/* eslint-disable no-restricted-globals */
const MODEL_ID = 'onnx-community/gemma-3-270m-it-ONNX';
const IS_LOCAL_DEV = ['localhost', '127.0.0.1'].includes(self.location.hostname);
const MODEL_BASE_URL = new URL('../../models/', self.location.href).href;
const LOCAL_MODEL_URL = `${MODEL_BASE_URL}${MODEL_ID}/`;
let generatorPromise = null;
let TextStreamerClass = null;
let currentDiagnostics = null;

const adapterInfo = adapter => {
  const info = adapter?.info || {};
  return {
    vendor: info.vendor || '',
    architecture: info.architecture || '',
    device: info.device || '',
    description: info.description || '',
  };
};

const preflightModelData = async dtype => {
  const dataFile = dtype === 'q4f16'
    ? 'model_q4f16.onnx_data'
    : dtype === 'q4'
      ? 'model_q4.onnx_data'
      : 'model_quantized.onnx_data';
  const url = IS_LOCAL_DEV
    ? `https://huggingface.co/${MODEL_ID}/resolve/main/onnx/${dataFile}`
    : `${LOCAL_MODEL_URL}onnx/${dataFile}`;
  const response = IS_LOCAL_DEV
    ? await fetch(url, { headers: { Range: 'bytes=0-1023' } })
    : await fetch(url, { method: 'HEAD', cache: 'no-store' });
  if (!response.ok && response.status !== 206) {
    const error = new Error(`Model data preflight failed: HTTP ${response.status}`);
    error.code = 'MODEL_DATA_PREFLIGHT_FAILED';
    throw error;
  }
  if (IS_LOCAL_DEV) await response.arrayBuffer();
  return 'ok';
};
const inspectWebGpu = async () => {
  if (!navigator.gpu) {
    const error = new Error('WebGPU is unavailable.');
    error.code = 'WEBGPU_UNSUPPORTED';
    throw error;
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    const compatibility = await navigator.gpu.requestAdapter({ featureLevel: 'compatibility' });
    const error = new Error(compatibility ? 'Only WebGPU compatibility mode is available.' : 'No WebGPU adapter is available.');
    error.code = compatibility ? 'WEBGPU_COMPATIBILITY_ONLY' : 'WEBGPU_ADAPTER_UNAVAILABLE';
    error.diagnostics = compatibility ? { mode: 'compatibility', ...adapterInfo(compatibility) } : null;
    throw error;
  }
  const shaderF16 = adapter.features.has('shader-f16');
  const mobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  const dtype = shaderF16 ? 'q4f16' : 'q4';
  return {
    mode: adapter.features.has('core-features-and-limits') ? 'core' : 'standard',
    shaderF16,
    dtype,
    estimatedModelMb: dtype === 'q4f16' ? 273 : 323,
    mobile,
    ...adapterInfo(adapter),
  };
};
const classifyError = error => {
  if (error?.code) return error.code;
  const message = String(error?.message || error || '');
  if (/fetch|network|http|download|failed to load/i.test(message)) return 'MODEL_DOWNLOAD_FAILED';
  if (/memory|allocation|buffer|device lost|out of memory/i.test(message)) return 'GPU_MEMORY_OR_DEVICE_LOST';
  if (/webgpu|gpu|shader|adapter/i.test(message)) return 'WEBGPU_RUNTIME_ERROR';
  return 'MODEL_LOAD_FAILED';
};

const loadModel = async id => {
  if (!generatorPromise) {
    generatorPromise = inspectWebGpu().then(async diagnostics => {
      currentDiagnostics = diagnostics;
      self.postMessage({ type: 'progress', id, event: { status: 'diagnostics', ...diagnostics } });
      diagnostics.preflight = await preflightModelData(diagnostics.dtype);
      self.postMessage({ type: 'progress', id, event: { status: 'preflight', ...diagnostics } });

      const transformers = await import('@huggingface/transformers');
      if (!IS_LOCAL_DEV) {
        // Transformers.js 4.3 metadata probing skips HTTP URLs configured as localModelPath.
        // Treat our same-origin GitHub Pages model directory as a custom remote host instead.
        transformers.env.allowLocalModels = false;
        transformers.env.allowRemoteModels = true;
        transformers.env.remoteHost = MODEL_BASE_URL;
        transformers.env.remotePathTemplate = '{model}/';
      }
      TextStreamerClass = transformers.TextStreamer;
      const reportProgress = event => {
        if (event?.file) diagnostics.lastFile = event.file;
        if (event?.status) diagnostics.lastStatus = event.status;
        self.postMessage({
          type: 'progress',
          id,
          event: { ...event, dtype: diagnostics.dtype, diagnostics: { ...diagnostics } },
        });
      };

      const generator = await transformers.pipeline('text-generation', MODEL_ID, {
        device: 'webgpu',
        dtype: diagnostics.dtype,
        progress_callback: reportProgress,
      });

      diagnostics.lastStatus = 'ready';
      self.postMessage({
        type: 'progress',
        id,
        event: { status: 'ready', dtype: diagnostics.dtype, diagnostics: { ...diagnostics } },
      });
      return generator;
    }).catch(error => {
      generatorPromise = null;
      throw error;
    });
  }
  return generatorPromise;
};
const cleanAnswer = value => String(value || '')
  .replace(/<think>[\s\S]*?<\/think>/gi, '')
  .replace(/<\/?think>/gi, '')
  .trim();

const sanitizeConsultantAnswer = value => {
  let text = cleanAnswer(value)
    .replace(/(?:\*\*?\s*\d+[.)]?\s*){3,}/g, '')
    .replace(/(?:\d+[.)]\s*){4,}/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (text.length > 260) text = text.slice(0, 260).replace(/\s+\S*$/, '') + '…';
  return text;
};

const extractJsonObject = value => {
  const text = cleanAnswer(value);
  const fenced = text.match(/\{[\s\S]*\}/);
  if (!fenced) return null;
  try { return JSON.parse(fenced[0]); } catch { return null; }
};

const buildIntentMessages = ({ query, history = [], previousIntent = {} }) => [
  {
    role: 'system',
    content: '당신은 MUJI 쇼핑 상담원의 검색 의도 분석기입니다. JSON 하나만 출력하세요. 스키마: {"gender":"","category":"","min_price":null,"max_price":null,"colors":[],"keywords":[],"purpose":"","style":""}. 이전 조건과 현재 발화를 함께 보고 새로 확인된 값만 정확히 채우세요. gender는 남성 여성 아동 또는 빈 문자열. category는 셔츠 티셔츠 팬츠 파자마 가구 주방용품 생활용품 문구 뷰티 간편조리 스낵 등 실제 상품 종류를 짧게 정규화하세요. 남자=남성 여자=여성 잠옷=파자마. 5만원대는 50000~59999. 모르면 빈 값으로 두세요.',
  },
  {
    role: 'user',
    content: `이전 조건: ${JSON.stringify(previousIntent)}\n최근 대화: ${JSON.stringify(history.slice(-4))}\n현재 말: ${query}`,
  },
];

const buildMessages = ({ query, products, intent = {} }) => [
  {
    role: 'system',
    content: '당신은 MUJI 온라인 쇼핑 상담원입니다. 한국어로 2~4문장만 자연스럽게 답하세요. 번호 목록과 마크다운 굵게 표시는 쓰지 마세요. 사용자의 문장을 그대로 반복하지 마세요. 같은 문장이나 단어를 반복하지 마세요. 제공된 상품 데이터 밖의 소재 성능이나 기능은 지어내지 마세요. 상품 후보가 있으면 현재 조건에 맞는 이유를 짧게 설명하고 다음 선택에 도움이 되는 질문을 하나 덧붙이세요. 상품 후보가 없으면 필요한 조건 하나만 질문하세요.',
  },
  {
    role: 'user',
    content: `현재 요청: ${query}\n현재 조건: ${JSON.stringify(intent)}\n상품 후보: ${JSON.stringify(products)}\n답변:`,
  },
];

const interpret = async ({ id, query, history, previousIntent }) => {
  const generator = await loadModel(id);
  const output = await generator(buildIntentMessages({ query, history, previousIntent }), {
    max_new_tokens: 120,
    do_sample: false,
  });
  const generated = output?.[0]?.generated_text;
  const raw = Array.isArray(generated) ? generated.at(-1)?.content : generated;
  const intent = extractJsonObject(raw) || {
    gender: '', category: '', min_price: null, max_price: null, colors: [], keywords: [], purpose: '', style: '',
  };
  self.postMessage({ type: 'intent', id, intent });
};

const generate = async ({ id, query, products, intent }) => {
  const generator = await loadModel(id);
  let streamed = '';

  const tokenizer = generator?.tokenizer;
  const canStream = Boolean(tokenizer?.all_special_ids && TextStreamerClass);
  const streamer = canStream
    ? new TextStreamerClass(tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: chunk => {
          streamed += chunk;
          self.postMessage({ type: 'token', id, text: sanitizeConsultantAnswer(streamed) });
        },
      })
    : null;

  const options = {
    max_new_tokens: 64,
    do_sample: false,
    repetition_penalty: 1.15,
    no_repeat_ngram_size: 3,
  };
  if (streamer) options.streamer = streamer;

  const output = await generator(buildMessages({ query, products, intent }), options);
  const generated = output?.[0]?.generated_text;
  const finalText = sanitizeConsultantAnswer(Array.isArray(generated) ? generated.at(-1)?.content : generated)
    || sanitizeConsultantAnswer(streamed)
    || '조건에 맞는 상품을 확인해보세요.';
  self.postMessage({ type: 'result', id, text: finalText });
};

self.onmessage = async event => {
  const { type, id } = event.data || {};
  try {
    if (type === 'load') {
      await loadModel(id);
      self.postMessage({ type: 'ready', id, diagnostics: currentDiagnostics });
    } else if (type === 'interpret') {
      await interpret(event.data);
    } else if (type === 'generate') {
      await generate(event.data);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      code: classifyError(error),
      message: error?.message || String(error),
      diagnostics: error?.diagnostics || currentDiagnostics,
    });
  }
};
