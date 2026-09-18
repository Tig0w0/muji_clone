import { cleanModelReason, describeLocalLlmError } from './localLlmPolicy';
export { buildInstantAnswer, describeLocalLlmError, shouldUseLocalLlm } from './localLlmPolicy';

export const LOCAL_LLM_NAME = 'Gemma 3 270M';
let worker = null;
let nextId = 1;
let loadPromise = null;
const pending = new Map();
const statusListeners = new Set();

let modelStatus = {
  state: 'idle',
  progress: 0,
  diagnostics: null,
  error: null,
};

const setModelStatus = patch => {
  modelStatus = { ...modelStatus, ...patch };
  statusListeners.forEach(listener => listener(modelStatus));
};

export const getLocalLlmStatus = () => modelStatus;
export const subscribeLocalLlmStatus = listener => {
  statusListeners.add(listener);
  listener(modelStatus);
  return () => statusListeners.delete(listener);
};
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
    setModelStatus({ state: 'error', error });
    return Promise.reject(error);
  }

  if (modelStatus.state === 'ready') {
    return Promise.resolve(modelStatus.diagnostics || true);
  }

  if (loadPromise) return loadPromise;

  setModelStatus({ state: 'loading', progress: 0, error: null });
  loadPromise = runWorkerTask('load', {}, {
    onProgress: event => {
      const raw = typeof event?.progress === 'number' ? event.progress : null;
      const progress = raw === null ? modelStatus.progress : Math.round(raw <= 1 ? raw * 100 : raw);
      const diagnostics = event?.diagnostics || (event?.status === 'diagnostics' || event?.status === 'preflight' ? event : modelStatus.diagnostics);
      setModelStatus({
        state: 'loading',
        progress: Math.max(0, Math.min(100, progress)),
        diagnostics,
      });
      onProgress?.(event);
    },
  }).then(result => {
    const diagnostics = result === true ? modelStatus.diagnostics : result;
    setModelStatus({ state: 'ready', progress: 100, diagnostics, error: null });
    return result;
  }).catch(error => {
    setModelStatus({
      state: 'error',
      diagnostics: error?.diagnostics || modelStatus.diagnostics,
      error,
    });
    throw error;
  }).finally(() => {
    loadPromise = null;
  });

  return loadPromise;
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
