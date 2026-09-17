const MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';
export const LOCAL_LLM_NAME = 'Qwen2.5 0.5B';
let generatorPromise = null;
let TextStreamerClass = null;

export const supportsLocalLlm = () => typeof navigator !== 'undefined' && Boolean(navigator.gpu);

const getModelDtype = async () => {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('WEBGPU_ADAPTER_UNAVAILABLE');
  return adapter.features.has('shader-f16') ? 'q4f16' : 'q8';
};

export const loadLocalLlm = async onProgress => {
  if (!supportsLocalLlm()) throw new Error('WEBGPU_UNSUPPORTED');
  if (!generatorPromise) {
    generatorPromise = getModelDtype().then(async dtype => {
      const transformers = await import('@huggingface/transformers');
      TextStreamerClass = transformers.TextStreamer;
      return transformers.pipeline('text-generation', MODEL_ID, {
        device: 'webgpu',
        dtype,
        progress_callback: event => onProgress?.({ ...event, dtype }),
      });
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
    content: [
      '당신은 MUJI 상품 안내 도우미입니다.',
      '제공된 상품 데이터만 사용하세요.',
      '질문에 이 상품이 맞는 이유만 한국어 12단어 이내로 작성하세요.',
      '상품명과 가격은 반복하지 마세요.',
      '추측하거나 없는 정보를 만들지 마세요.',
    ].join(' '),
  },
  {
    role: 'user',
    content: `질문: ${query}\n상품: ${JSON.stringify(products)}\n이유:`,
  },
];

export const generateProductAnswer = async ({ query, products, onToken }) => {
  const generator = await loadLocalLlm();
  let streamed = '';
  const streamer = onToken && TextStreamerClass ? new TextStreamerClass(generator.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: chunk => {
      streamed += chunk;
      onToken(cleanAnswer(streamed));
    },
  }) : undefined;
  const output = await generator(buildMessages({ query, products }), {
    max_new_tokens: 16,
    do_sample: false,
    tokenizer_encode_kwargs: { enable_thinking: false },
    ...(streamer ? { streamer } : {}),
  });

  const finalText = cleanAnswer(output?.[0]?.generated_text?.at?.(-1)?.content);
  return finalText || cleanAnswer(streamed) || '조건에 맞는 이유를 확인했습니다.';
};