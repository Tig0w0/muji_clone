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
        transformers.env.localModelPath = MODEL_BASE_URL;
        transformers.env.allowLocalModels = true;
        transformers.env.allowRemoteModels = false;
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

      diagnostics.lastStatus = 'tokenizer';
      self.postMessage({
        type: 'progress',
        id,
        event: { status: 'tokenizer', dtype: diagnostics.dtype, diagnostics: { ...diagnostics } },
      });
      const tokenizer = await transformers.AutoTokenizer.from_pretrained(MODEL_ID, {
        progress_callback: reportProgress,
      });

      const generator = await transformers.pipeline('text-generation', MODEL_ID, {
        device: 'webgpu',
        dtype: diagnostics.dtype,
        progress_callback: reportProgress,
      });

      // In production local-only mode, Transformers.js 4.3 can fail to auto-detect
      // tokenizer files during pipeline discovery. Attach the explicitly loaded
      // tokenizer so text-generation and TextStreamer can both use it.
      generator.tokenizer = tokenizer;
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

const extractJsonObject = value => {
  const text = cleanAnswer(value);
  const fenced = text.match(/\{[\s\S]*\}/);
  if (!fenced) return null;
  try { return JSON.parse(fenced[0]); } catch { return null; }
};

const buildIntentMessages = query => [
  {
    role: 'system',
    content: '사용자의 MUJI 상품 검색 의도를 JSON 하나로만 변환하세요. 설명은 쓰지 마세요. 스키마: {"gender":"","category":"","min_price":null,"max_price":null,"colors":[],"keywords":[]}. gender는 남성 여성 아동 중 하나 또는 빈 문자열. category는 사용자가 찾는 상품 종류를 짧게 정규화하세요. 예: 남자=남성 여자=여성 잠옷=파자마. "5만원대"는 min_price=50000 max_price=59999. "5만원 이하"는 max_price=50000. 모르는 값은 빈 문자열 null 빈 배열을 사용하세요.',
  },
  { role: 'user', content: query },
];

const buildMessages = ({ query, products }) => [
  {
    role: 'system',
    content: '당신은 MUJI 상품 안내 도우미입니다. 제공된 상품 데이터만 사용하세요. 상품명에 직접 적힌 정보만 근거로 한국어 추천 이유를 8단어 이내 한 문장으로 작성하세요. 쉼표를 쓰지 말고 반드시 마침표로 끝내세요. 상품명과 가격은 반복하지 마세요.',
  },
  {
    role: 'user',
    content: `질문: ${query}\n상품: ${JSON.stringify(products)}\n답변:`,
  },
];

const interpret = async ({ id, query }) => {
  const generator = await loadModel(id);
  const output = await generator(buildIntentMessages(query), {
    max_new_tokens: 96,
    do_sample: false,
  });
  const raw = output?.[0]?.generated_text?.at?.(-1)?.content || '';
  const intent = extractJsonObject(raw) || {
    gender: '', category: '', min_price: null, max_price: null, colors: [], keywords: [],
  };
  self.postMessage({ type: 'intent', id, intent });
};

const generate = async ({ id, query, products }) => {
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
          self.postMessage({ type: 'token', id, text: cleanAnswer(streamed) });
        },
      })
    : null;

  const options = {
    max_new_tokens: 24,
    do_sample: false,
  };
  if (streamer) options.streamer = streamer;

  const output = await generator(buildMessages({ query, products }), options);
  const generated = output?.[0]?.generated_text;
  const finalText = cleanAnswer(Array.isArray(generated) ? generated.at(-1)?.content : generated)
    || cleanAnswer(streamed)
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
