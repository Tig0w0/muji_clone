export const LOCAL_LLM_NAME = 'Gemma 3 270M';
let worker = null;
let nextId = 1;
const pending = new Map();

export const supportsLocalLlm = () => typeof navigator !== 'undefined' && Boolean(navigator.gpu) && typeof Worker !== 'undefined';

const getWorker = () => {
  if (!worker) {
    worker = new Worker(new URL('./localLlm.worker.js', import.meta.url));
    worker.onmessage = event => {
      const { id, type, text, event: progressEvent, message } = event.data || {};
      const task = pending.get(id);
      if (!task) return;
      if (type === 'progress') task.onProgress?.(progressEvent);
      if (type === 'token') task.onToken?.(text);
      if (type === 'ready' || type === 'result') {
        pending.delete(id);
        task.resolve(type === 'result' ? text : true);
      }
      if (type === 'error') {
        pending.delete(id);
        task.reject(new Error(message || 'LOCAL_LLM_ERROR'));
      }
    };
  }
  return worker;
};const runWorkerTask = (type, payload = {}, callbacks = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, { resolve, reject, ...callbacks });
  getWorker().postMessage({ type, id, ...payload });
});

export const loadLocalLlm = onProgress => {
  if (!supportsLocalLlm()) return Promise.reject(new Error('WEBGPU_UNSUPPORTED'));
  return runWorkerTask('load', {}, { onProgress });
};

export const generateProductAnswer = ({ query, products, onToken }) => {
  if (!supportsLocalLlm()) return Promise.reject(new Error('WEBGPU_UNSUPPORTED'));
  return runWorkerTask('generate', { query, products }, { onToken });
};

export const shouldUseLocalLlm = query => /추천|비교|어울|선물|좋은|편한|어떤|왜|고민/.test(String(query || ''));

export const buildInstantAnswer = products => {
  const first = products[0];
  if (!first) return '조건에 맞는 상품을 찾지 못했습니다.';
  const price = Number(first.sell_price ?? first.retail_price ?? 0).toLocaleString('ko-KR');
  return `${first.product_name} — ${price}원 상품을 찾았습니다.`;
};