/* eslint-disable no-restricted-globals */
const MODEL_ID = 'onnx-community/gemma-3-270m-it-ONNX';
const IS_LOCAL_DEV = ['localhost', '127.0.0.1'].includes(self.location.hostname);
const MODEL_BASE_URL = new URL('../../models/', self.location.href).href;
const LOCAL_MODEL_URL = `${MODEL_BASE_URL}${MODEL_ID}/`;
let generatorPromise = null;
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
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const numbered = text.match(/(?:^|\s)\d+[.)]\s*/g) || [];
  const boldMarks = text.match(/\*\*/g) || [];
  const repeatedFragments = /(\S.{0,20})\1{2,}/.test(text);

  if (
    /^\s*[{[]/.test(text)
    || /"(?:tool|arguments)"\s*:/.test(text)
    || numbered.length >= 3
    || boldMarks.length >= 4
    || repeatedFragments
  ) return '';

  if (text.length > 260) text = text.slice(0, 260).replace(/\s+\S*$/, '') + '…';
  return text;
};

const extractJsonObject = value => {
  const text = cleanAnswer(value);
  const fenced = text.match(/\{[\s\S]*\}/);
  if (!fenced) return null;
  try { return JSON.parse(fenced[0]); } catch { return null; }
};

const buildToolCallMessages = ({ query, history = [], previousIntent = {}, categories = [] }) => [
  {
    role: 'system',
    content: '당신은 쇼핑 상담용 도구 선택기입니다. 반드시 JSON 하나만 출력하세요. 설명 문장과 마크다운은 금지합니다. 사용 가능한 도구: search_products, list_categories, get_product, compare_products. 대부분의 상품 추천/검색에는 search_products를 사용하세요. search_products 스키마: {"tool":"search_products","arguments":{"query":"","gender":"","category":"","min_price":null,"max_price":null,"colors":[],"keywords":[],"purpose":"","style":"","limit":6}}. 카테고리를 모를 때만 list_categories를 사용하세요. 상품 ID가 명확할 때만 get_product 또는 compare_products를 사용하세요. 현재 사용 가능한 카테고리 이름을 참고하세요.',
  },
  {
    role: 'user',
    content: `카테고리: ${JSON.stringify(categories)}\n이전 조건: ${JSON.stringify(previousIntent)}\n최근 대화: ${JSON.stringify(history.slice(-4))}\n현재 요청: ${query}`,
  },
];

const buildAnswerMessages = ({ query, toolCall, toolResult, intent = {} }) => [
  {
    role: 'system',
    content: '당신은 MUJI 온라인 쇼핑 상담원입니다. 한국어로 2~4문장만 답하세요. JSON, 코드, 마크다운 목록은 출력하지 마세요. 사용자 문장을 그대로 반복하지 마세요. 반드시 제공된 도구 실행 결과만 근거로 답하세요. 상품이 있으면 1~3개를 간단히 비교하고 다음 선택에 도움이 되는 질문을 하나 덧붙이세요. 상품이 없으면 조건을 하나 더 물어보세요.',
  },
  {
    role: 'user',
    content: `현재 요청: ${query}\n실행한 도구: ${JSON.stringify(toolCall)}\n현재 조건: ${JSON.stringify(intent)}\n도구 결과: ${JSON.stringify(toolResult)}\n답변:`,
  },
];

const planToolCall = async ({ id, query, history, previousIntent, categories }) => {
  const generator = await loadModel(id);
  const output = await generator(buildToolCallMessages({ query, history, previousIntent, categories }), {
    max_new_tokens: 140,
    do_sample: false,
    repetition_penalty: 1.08,
    no_repeat_ngram_size: 3,
  });
  const generated = output?.[0]?.generated_text;
  const raw = Array.isArray(generated) ? generated.at(-1)?.content : generated;
  const toolCall = extractJsonObject(raw) || {
    tool: 'search_products',
    arguments: { query, limit: 6 },
  };
  self.postMessage({ type: 'tool_call', id, toolCall });
};

const generateFromTool = async ({ id, query, toolCall, toolResult, intent }) => {
  const generator = await loadModel(id);
  const output = await generator(buildAnswerMessages({ query, toolCall, toolResult, intent }), {
    max_new_tokens: 72,
    do_sample: false,
    repetition_penalty: 1.15,
    no_repeat_ngram_size: 3,
  });
  const generated = output?.[0]?.generated_text;
  const finalText = sanitizeConsultantAnswer(Array.isArray(generated) ? generated.at(-1)?.content : generated);
  self.postMessage({ type: 'result', id, text: finalText });
};

self.onmessage = async event => {
  const { type, id } = event.data || {};
  try {
    if (type === 'load') {
      await loadModel(id);
      self.postMessage({ type: 'ready', id, diagnostics: currentDiagnostics });
    } else if (type === 'plan_tool') {
      await planToolCall(event.data);
    } else if (type === 'generate_from_tool') {
      await generateFromTool(event.data);
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
