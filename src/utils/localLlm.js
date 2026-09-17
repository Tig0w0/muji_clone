import { cleanModelReason } from './localLlmPolicy';
export { buildInstantAnswer, shouldUseLocalLlm } from './localLlmPolicy';

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
};
const runWorkerTask = (type, payload = {}, callbacks = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, { resolve, reject, ...callbacks });
  getWorker().postMessage({ type, id, ...payload });
});

export const loadLocalLlm = onProgress => {
  if (!supportsLocalLlm()) return Promise.reject(new Error('WEBGPU_UNSUPPORTED'));
  return runWorkerTask('load', {}, { onProgress });
};

export const generateProductAnswer = async ({ query, products, onToken }) => {
  if (!supportsLocalLlm()) throw new Error('WEBGPU_UNSUPPORTED');
  const answer = await runWorkerTask('generate', { query, products }, {
    onToken: text => {
      const cleaned = cleanModelReason(text, products);
      if (cleaned) onToken?.(cleaned);
    },
  });
  return cleanModelReason(answer, products) || '추천 조건에 잘 맞는 상품입니다.';
};
