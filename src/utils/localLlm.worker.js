/* eslint-disable no-restricted-globals */
const MODEL_ID = 'onnx-community/gemma-3-270m-it-ONNX';
let generatorPromise = null;
let TextStreamerClass = null;

const getModelDtype = async () => {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('WEBGPU_ADAPTER_UNAVAILABLE');
  return adapter.features.has('shader-f16') ? 'q4f16' : 'q8';
};

const loadModel = async id => {
  if (!generatorPromise) {
    generatorPromise = getModelDtype().then(async dtype => {
      const transformers = await import('@huggingface/transformers');
      TextStreamerClass = transformers.TextStreamer;
      const generator = await transformers.pipeline('text-generation', MODEL_ID, {
        device: 'webgpu',
        dtype,
        progress_callback: event => self.postMessage({ type: 'progress', id, event: { ...event, dtype } }),
      });
      return generator;
    }).catch(error => {
      generatorPromise = null;
      throw error;
    });
  }
  return generatorPromise;
};const cleanAnswer = value => String(value || '')
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
  });  const output = await generator(buildMessages({ query, products }), {
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
      self.postMessage({ type: 'ready', id });
    } else if (type === 'generate') {
      await generate(event.data);
    }
  } catch (error) {
    self.postMessage({ type: 'error', id, message: error?.message || String(error) });
  }
};