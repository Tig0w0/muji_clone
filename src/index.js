import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import './index.css';
import App from './App';
import { initializeData } from './data/catalog';
import { loadLocalLlm, supportsLocalLlm } from './utils/localLlm';

const root = ReactDOM.createRoot(document.getElementById('root'));
const updateBootstrapStatus = text => {
  const target = document.getElementById('bootstrap-status');
  if (target) target.textContent = text;
};

async function start() {
  let aiWarmup = null;
  let backendDone = false;

  const backendPromise = initializeData().finally(() => {
    backendDone = true;
  });

  const warmupTimer = setTimeout(() => {
    if (backendDone || !supportsLocalLlm()) return;
    updateBootstrapStatus('백엔드 서버와 로컬 AI 모델을 함께 준비하고 있습니다.');
    aiWarmup = loadLocalLlm(event => {
      if (typeof event?.progress !== 'number') return;
      const value = event.progress <= 1 ? event.progress * 100 : event.progress;
      updateBootstrapStatus(`백엔드 서버와 로컬 AI 모델을 함께 준비 중입니다. AI ${Math.round(value)}%`);
    }).catch(error => {
      console.warn('Local AI warmup failed.', error);
    });
  }, 1500);

  await backendPromise;
  clearTimeout(warmupTimer);
  if (aiWarmup) updateBootstrapStatus('상품 데이터가 준비되었습니다. AI 모델은 백그라운드에서 계속 준비합니다.');

  const { store } = await import('./store/cart');
  root.render(
    <Provider store={store}>
      <HashRouter><App /></HashRouter>
    </Provider>
  );
}

start().catch(error => {
  console.error('Failed to load catalog from backend.', error);
  root.render(<main className="px-4 py-24 text-center">데이터를 불러오지 못했습니다.</main>);
});
