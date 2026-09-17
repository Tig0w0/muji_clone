import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import './index.css';
import App from './App';
import { initializeData } from './data/catalog';

const root = ReactDOM.createRoot(document.getElementById('root'));

async function start() {
  await initializeData();
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
