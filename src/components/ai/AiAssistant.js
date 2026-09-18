import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
import { catalogProducts, getProductImage } from '../../data/catalog';
import {
  extractDeterministicIntent,
  mergeShoppingIntent,
  formatProductContext,
  searchProducts,
  searchProductsByIntent,
} from '../../utils/productSearch';
import {
  buildInstantAnswer,
  formatLocalLlmError,
  generateProductAnswer,
  interpretProductIntent,
  loadLocalLlm,
  LOCAL_LLM_NAME,
  subscribeLocalLlmStatus,
  supportsLocalLlm,
} from '../../utils/localLlm';

const INITIAL_MESSAGE = {
  role: 'assistant',
  text: '찾는 상품이 정해져 있지 않아도 괜찮아요. 용도, 예산, 스타일을 말씀해주시면 함께 좁혀볼게요.',
};

const EMPTY_INTENT = {
  gender: '',
  category: '',
  min_price: null,
  max_price: null,
  colors: [],
  keywords: [],
  purpose: '',
  style: '',
};

const compactHistory = messages => messages
  .filter(message => message?.text)
  .slice(-6)
  .map(({ role, text }) => ({ role, text }));

const price = product => Number(product.sell_price ?? product.retail_price ?? 0).toLocaleString('ko-KR');

function ProductResults({ products = [] }) {
  if (!products.length) return null;
  return (
    <div className="mt-2 grid grid-cols-3 gap-1.5 max-w-[300px]">
      {products.slice(0, 3).map(product => (
        <Link
          key={product.product_id}
          to={`/products/view/${product.product_id}`}
          className="min-w-0 border border-[#e5e5e5] bg-white p-1.5 text-left"
        >
          <img
            src={getProductImage(product)}
            alt=""
            className="w-full aspect-square object-cover bg-[#f5f5f5]"
          />
          <div className="mt-1 text-[10px] leading-3 line-clamp-2 min-h-[24px]">{product.product_name}</div>
          <div className="mt-0.5 text-[10px] font-semibold">{price(product)}원</div>
        </Link>
      ))}
    </div>
  );
}

function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [intentContext, setIntentContext] = useState(EMPTY_INTENT);
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState('');
  const [diagnostics, setDiagnostics] = useState(null);

  useEffect(() => subscribeLocalLlmStatus(status => {
    setReady(status.state === 'ready');
    setLoading(status.state === 'loading');
    setProgress(status.progress || 0);
    setDiagnostics(status.diagnostics || null);
    setError(status.state === 'error' && status.error ? formatLocalLlmError(status.error) : '');
    setErrorDetail(status.state === 'error' && status.error
      ? [status.error.code, status.error.message].filter(Boolean).join(' · ')
      : '');
  }), []);

  const startModel = async () => {
    if (ready || loading) return;
    if (!supportsLocalLlm()) {
      const unsupported = new Error('WebGPU unavailable');
      unsupported.code = 'WEBGPU_UNSUPPORTED';
      setError(formatLocalLlmError(unsupported));
      return;
    }
    setError('');
    setErrorDetail('');
    setDiagnostics(null);
    setLoading(true);
    setProgress(0);
    try {
      const result = await loadLocalLlm(event => {
        if (event?.diagnostics) setDiagnostics(event.diagnostics);
        if (event?.status === 'diagnostics') setDiagnostics(event);
        if (typeof event?.progress === 'number') {
          const value = event.progress <= 1 ? event.progress * 100 : event.progress;
          setProgress(Math.max(0, Math.min(100, Math.round(value))));
        }
      });
      setDiagnostics(result === true ? null : result);
      setReady(true);
      setProgress(100);
    } catch (e) {
      setDiagnostics(e?.diagnostics || null);
      setError(formatLocalLlmError(e));
      setErrorDetail([e?.code, e?.message].filter(Boolean).join(' · '));
    } finally {
      setLoading(false);
    }
  };

  const submit = async event => {
    event.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const history = compactHistory(messages);
    const userMessage = { role: 'user', text: query };
    setMessages(current => [...current, userMessage]);
    setInput('');
    setLoading(true);
    setError('');
    setErrorDetail('');

    if (!ready) {
      const matches = searchProducts(catalogProducts, query);
      setMessages(current => [...current, {
        role: 'assistant',
        text: matches.length
          ? `${buildInstantAnswer(matches)} AI가 준비되면 용도와 취향을 함께 고려한 상담도 받을 수 있습니다.`
          : '지금은 기본 상품 검색만 사용할 수 있습니다. AI가 준비되면 용도와 예산을 함께 상담해드릴게요.',
        products: matches.slice(0, 3),
      }]);
      setLoading(false);
      return;
    }

    let nextIntent = intentContext;
    let matches = [];
    try {
      const deterministic = extractDeterministicIntent(query);
      const parsed = await interpretProductIntent({
        query,
        history,
        previousIntent: intentContext,
      });
      nextIntent = mergeShoppingIntent(intentContext, parsed, deterministic, query);
      setIntentContext(nextIntent);
      matches = searchProductsByIntent(catalogProducts, nextIntent, 6);

      const hasDeterministicSignal = Boolean(
        deterministic.gender
        || deterministic.category
        || deterministic.min_price !== null
        || deterministic.max_price !== null
      );
      if (!matches.length && !hasDeterministicSignal) {
        matches = searchProducts(catalogProducts, query, 6);
      }
    } catch (e) {
      const deterministic = extractDeterministicIntent(query);
      nextIntent = mergeShoppingIntent(intentContext, {}, deterministic, query);
      setIntentContext(nextIntent);
      matches = searchProductsByIntent(catalogProducts, nextIntent, 6);
      if (!matches.length) matches = searchProducts(catalogProducts, query, 6);
    }

    const responseIndex = messages.length + 1;
    setMessages(current => [...current, {
      role: 'assistant',
      text: matches.length ? '조건을 바탕으로 몇 가지를 골라보고 있어요.' : '조금 더 취향을 확인해볼게요.',
      products: matches.slice(0, 3),
    }]);

    try {
      const answer = await generateProductAnswer({
        query,
        products: formatProductContext(matches),
        history: [...history, userMessage],
        intent: nextIntent,
        onToken: text => setMessages(current => current.map((message, index) =>
          index === responseIndex ? { ...message, text } : message
        )),
      });
      setMessages(current => current.map((message, index) =>
        index === responseIndex ? { ...message, text: answer } : message
      ));
    } catch (e) {
      setDiagnostics(e?.diagnostics || diagnostics);
      setError(formatLocalLlmError(e));
      setErrorDetail([e?.code, e?.message].filter(Boolean).join(' · '));
      setMessages(current => current.map((message, index) =>
        index === responseIndex && !message.text
          ? { ...message, text: matches.length ? buildInstantAnswer(matches) : '조건을 조금 더 구체적으로 말씀해주세요.' }
          : message
      ));
    } finally {
      setLoading(false);
    }
  };

  const diagnosticsText = diagnostics
    ? [
        diagnostics.mode,
        diagnostics.dtype,
        diagnostics.shaderF16 === false ? 'shader-f16 미지원' : diagnostics.shaderF16 ? 'shader-f16 지원' : null,
        diagnostics.vendor || diagnostics.architecture || null,
        diagnostics.lastFile ? `파일 ${diagnostics.lastFile}` : null,
        diagnostics.lastStatus ? `상태 ${diagnostics.lastStatus}` : null,
      ].filter(Boolean).join(' · ')
    : '';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="fixed right-4 bottom-36 lg:right-4 lg:bottom-24 z-[11000] w-12 h-12 rounded-full bg-[#7f0019] text-white shadow-lg flex items-center justify-center"
        aria-label={open ? 'AI 상품 도우미 닫기' : 'AI 상품 도우미 열기'}
      >
        {open ? <FiX size={20} /> : <FiMessageCircle size={21} />}
      </button>

      {open && (
        <section className="fixed right-4 bottom-52 lg:bottom-40 z-[10900] w-[calc(100vw-2rem)] max-w-[380px] h-[560px] max-h-[70vh] bg-white border border-[#ddd] shadow-2xl flex flex-col">
          <header className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">AI 쇼핑 상담</div>
              <div className="text-[11px] text-[#777]">용도·예산·취향을 함께 좁혀드려요</div>
            </div>
            <span className="text-[10px] text-[#777]">{LOCAL_LLM_NAME}</span>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {!ready && (
              <div className="border border-[#e5e5e5] bg-[#fafafa] p-3 text-xs leading-5">
                <p>{loading
                  ? `페이지 로딩과 함께 AI 모델을 준비하고 있습니다.${progress ? ` ${progress}%` : ''}`
                  : error
                    ? '페이지 로딩 중 AI 준비에 실패했습니다. 상품 검색은 계속 사용할 수 있습니다.'
                    : '페이지 로딩과 함께 AI 모델을 준비합니다.'}</p>
                {error && (
                  <button type="button" onClick={startModel} className="mt-3 w-full bg-[#333] text-white py-2">
                    AI 다시 시도
                  </button>
                )}
              </div>
            )}
            {diagnosticsText && (
              <div className="text-[10px] leading-4 text-[#666] bg-[#f7f7f7] px-2 py-1.5">
                진단: {diagnosticsText}
              </div>
            )}
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block max-w-[88%] px-3 py-2 text-xs leading-5 ${
                  message.role === 'user' ? 'bg-[#333] text-white' : 'bg-[#f4f4f4] text-[#222]'
                }`}>
                  {message.text}
                </div>
                {message.role === 'assistant' && <ProductResults products={message.products} />}
              </div>
            ))}

            {loading && ready && <div className="text-xs text-[#777]">조건을 정리하고 상품을 비교하고 있습니다...</div>}
            {error && (
              <div className="text-xs text-[#b3261e] bg-[#fff4f2] p-2">
                <div>{error}</div>
                {errorDetail && (
                  <div className="mt-1 text-[10px] leading-4 break-all text-[#7a3b35]">세부: {errorDetail}</div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={submit} className="border-t p-3 flex gap-2">
            <input
              value={input}
              onChange={event => setInput(event.target.value)}
              disabled={loading}
              placeholder={ready ? '용도나 고민을 편하게 말씀해주세요' : 'AI 없이도 기본 검색은 가능합니다'}
              className="flex-1 min-w-0 border border-[#ccc] px-3 py-2 text-xs outline-none focus:border-[#777] disabled:bg-[#f5f5f5]"
            />
            <button type="submit" disabled={loading || !input.trim()} className="w-10 flex items-center justify-center bg-[#7f0019] text-white disabled:opacity-40" aria-label="메시지 보내기">
              <FiSend size={16} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}

export default AiAssistant;
