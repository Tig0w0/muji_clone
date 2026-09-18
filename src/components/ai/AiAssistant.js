import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
import { catalogProducts, getProductImage } from '../../data/catalog';
import { formatProductContext, searchProducts } from '../../utils/productSearch';
import {
  buildInstantAnswer,
  formatLocalLlmError,
  generateProductAnswer,
  loadLocalLlm,
  LOCAL_LLM_NAME,
  shouldUseLocalLlm,
  subscribeLocalLlmStatus,
  supportsLocalLlm,
} from '../../utils/localLlm';

const INITIAL_MESSAGE = {
  role: 'assistant',
  text: '원하는 상품을 자연스럽게 말씀해주세요. 예: “5만원 이하 남성 셔츠 찾아줘”',
};

const price = product => Number(product.sell_price ?? product.retail_price ?? 0).toLocaleString('ko-KR');

function ProductResults({ products }) {
  if (!products.length) return null;
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {products.slice(0, 3).map(product => (
        <Link key={product.product_id} to={`/products/view/${product.product_id}`} className="block text-left">
          <img src={getProductImage(product)} alt="" className="w-full aspect-square object-cover bg-[#f5f5f5]" />
          <div className="mt-1 text-[11px] leading-4 line-clamp-2">{product.product_name}</div>
          <div className="text-[11px] font-semibold mt-0.5">{price(product)}원</div>
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
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [diagnostics, setDiagnostics] = useState(null);

  useEffect(() => subscribeLocalLlmStatus(status => {
    setReady(status.state === 'ready');
    setLoading(status.state === 'loading');
    setProgress(status.progress || 0);
    setDiagnostics(status.diagnostics || null);
    setError(status.state === 'error' && status.error ? formatLocalLlmError(status.error) : '');
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
    } finally {
      setLoading(false);
    }
  };

  const submit = async event => {
    event.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const userMessage = { role: 'user', text: query };
    setMessages(current => [...current, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    const matches = searchProducts(catalogProducts, query);
    setProducts(matches);
    if (!matches.length) {
      setMessages(current => [...current, {
        role: 'assistant',
        text: '정확히 맞는 상품을 찾지 못했습니다. 상품 종류나 가격 조건을 조금 더 간단하게 입력해주세요.',
      }]);
      setLoading(false);
      return;
    }

    if (!shouldUseLocalLlm(query)) {
      setMessages(current => [...current, { role: 'assistant', text: buildInstantAnswer(matches) }]);
      setLoading(false);
      return;
    }

    const baseText = buildInstantAnswer(matches);
    if (!ready) {
      setMessages(current => [...current, {
        role: 'assistant',
        text: `${baseText} 로컬 AI가 준비되지 않아 검색 결과만 표시합니다.`,
      }]);
      setLoading(false);
      return;
    }

    const responseIndex = messages.length + 1;
    setMessages(current => [...current, { role: 'assistant', text: baseText }]);
    try {
      const answer = await generateProductAnswer({
        query,
        products: formatProductContext(matches),
        onToken: text => setMessages(current => current.map((message, index) =>
          index === responseIndex ? { ...message, text: `${baseText} ${text}` } : message
        )),
      });
      setMessages(current => current.map((message, index) =>
        index === responseIndex ? { ...message, text: `${baseText} ${answer}` } : message
      ));
    } catch (e) {
      setDiagnostics(e?.diagnostics || diagnostics);
      setError(formatLocalLlmError(e));
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
              <div className="text-sm font-semibold">AI 상품 도우미</div>
              <div className="text-[11px] text-[#777]">브라우저에서 로컬 AI 실행</div>
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
              </div>
            ))}

            {loading && ready && <div className="text-xs text-[#777]">상품을 확인하고 답변을 만들고 있습니다...</div>}
            {error && <div className="text-xs text-[#b3261e] bg-[#fff4f2] p-2">{error}</div>}
            <ProductResults products={products} />
          </div>

          <form onSubmit={submit} className="border-t p-3 flex gap-2">
            <input
              value={input}
              onChange={event => setInput(event.target.value)}
              disabled={loading}
              placeholder={ready ? '찾는 상품을 입력하세요' : 'AI 없이도 상품 검색이 가능합니다'}
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
