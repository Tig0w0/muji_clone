import { cleanModelReason, describeLocalLlmError } from './localLlmPolicy';
export { buildInstantAnswer, describeLocalLlmError, shouldUseLocalLlm } from './localLlmPolicy';

export const LOCAL_LLM_NAME = 'Gemma 3 270M';
let worker = null;
let nextId = 1;
const pending = new Map();

export const supportsLocalLlm = () => typeof navigator !== 'undefined'
  && Boolean(navigator.gpu)
  && typeof Worker !== 'undefined';

const rejectPending = error => {
  pending.forEach(task => task.reject(error));
  pending.clear();
};

const getWorker = () => {
  if (!worker) {
    worker = new Worker(new URL('./localLlm.worker.js', import.meta.url));
    worker.onerror = event => {
      rejectPending(new Error(event.message || 'LOCAL_LLM_WORKER_ERROR'));
      worker?.terminate();
      worker = null;
    };
    worker.onmessage = event => {
      const { id, type, text, event: progressEvent, message, code, diagnostics } = event.data || {};
      const task = pending.get(id);
      if (!task) return;
      if (type === 'progress') task.onProgress?.(progressEvent);
      if (type === 'token') task.onToken?.(text);
      if (type === 'ready' || type === 'result') {
        pending.delete(id);
        task.resolve(type === 'result' ? text : (diagnostics || true));
      }
      if (type === 'error') {
        pending.delete(id);
        const error = new Error(message || 'LOCAL_LLM_ERROR');
        error.code = code || 'LOCAL_LLM_ERROR';
        error.diagnostics = diagnostics;
        task.reject(error);
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
  if (!supportsLocalLlm()) {
    const error = new Error('WebGPU or Web Worker is unavailable.');
    error.code = 'WEBGPU_UNSUPPORTED';
    return Promise.reject(error);
  }
  return runWorkerTask('load', {}, { onProgress });
};

export const generateProductAnswer = async ({ query, products, onToken }) => {
  if (!supportsLocalLlm()) {
    const error = new Error('WebGPU or Web Worker is unavailable.');
    error.code = 'WEBGPU_UNSUPPORTED';
    throw error;
  }
  const answer = await runWorkerTask('generate', { query, products }, {
    onToken: text => {
      const cleaned = cleanModelReason(text, products);
      if (cleaned) onToken?.(cleaned);
    },
  });
  return cleanModelReason(answer, products) || '추천 조건에 잘 맞는 상품입니다.';
};

export const formatLocalLlmError = error => describeLocalLlmError(error);
