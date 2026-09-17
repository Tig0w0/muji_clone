/* eslint-disable no-restricted-globals */
const MODEL_ID = 'onnx-community/gemma-3-270m-it-ONNX';
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
  const diagnostics = {
    mode: adapter.features.has('core-features-and-limits') ? 'core' : 'standard',
    shaderF16,
    dtype: shaderF16 ? 'q4f16' : 'q8',
    estimatedModelMb: shaderF16 ? 273 : 545,
    mobile: /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent),
    ...adapterInfo(adapter),
  };
  return diagnostics;
};

const classifyError = error => {
  if (error?.code) return error.code;
  const message = String(error?.message || error || '');
  if (/fetch|network|http|download/i.test(message)) return 'MODEL_DOWNLOAD_FAILED';
  if (/memory|allocation|buffer|device lost|out of memory/i.test(message)) return 'GPU_MEMORY_OR_DEVICE_LOST';
  if (/webgpu|gpu|shader|adapter/i.test(message)) return 'WEBGPU_RUNTIME_ERROR';
  return 'MODEL_LOAD_FAILED';
};

const loadModel = async id => {
  if (!generatorPromise) {
    generatorPromise = inspectWebGpu().then(async diagnostics => {
      currentDiagnostics = diagnostics;
      self.postMessage({ type: 'progress', id, event: { status: 'diagnostics', ...diagnostics } });
      const transformers = await import('@huggingface/transformers');
      TextStreamerClass = transformers.TextStreamer;
      return transformers.pipeline('text-generation', MODEL_ID, {
        device: 'webgpu',
        dtype: diagnostics.dtype,
        progress_callback: event => self.postMessage({
          type: 'progress',
          id,
          event: { ...event, dtype: diagnostics.dtype, diagnostics },
        }),
      });
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
const generate = async ({ id, query, products }) => {
  const generator = await loadModel(id);
  let streamed = '';
  const streamer = new TextStreamerClass(generator.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: chunk => {
      streamed += chunk;
      self.postMessage({ type: 'token', id, text: cleanAnswer(streamed) });
    },
  });
  const output = await generator(buildMessages({ query, products }), {
    max_new_tokens: 24,
    do_sample: false,
    streamer,
  });
  const finalText = cleanAnswer(output?.[0]?.generated_text?.at?.(-1)?.content)
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
