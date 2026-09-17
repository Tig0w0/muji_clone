import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
import { catalogProducts, getProductImage } from '../../data/catalog';
import { formatProductContext, searchProducts } from '../../utils/productSearch';
import { generateProductAnswer, loadLocalLlm, LOCAL_LLM_NAME, supportsLocalLlm } from '../../utils/localLlm';

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

  const startModel = async () => {
    if (ready || loading) return;
    if (!supportsLocalLlm()) {
      setError('이 브라우저는 WebGPU를 지원하지 않아 로컬 AI를 실행할 수 없습니다.');
      return;
    }
    setError('');
    setLoading(true);
    setProgress(0);
    try {
      await loadLocalLlm(event => {
        if (typeof event?.progress === 'number') {
          const value = event.progress <= 1 ? event.progress * 100 : event.progress;
          setProgress(Math.max(0, Math.min(100, Math.round(value))));
        }
      });
      setReady(true);
      setProgress(100);
    } catch (e) {
      setError('AI 모델을 불러오지 못했습니다. 네트워크 상태를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };
  const submit = async event => {
    event.preventDefault();
    const query = input.trim();
    if (!query || !ready || loading) return;

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

    const responseIndex = messages.length + 1;
    const top = matches[0];
    const baseText = `${top.product_name} — ${price(top)}원 상품을 찾았습니다.`;
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
      setError('답변 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="fixed right-4 bottom-20 lg:bottom-6 z-50 w-12 h-12 rounded-full bg-[#7f0019] text-white shadow-lg flex items-center justify-center"
        aria-label={open ? 'AI 상품 도우미 닫기' : 'AI 상품 도우미 열기'}
      >
        {open ? <FiX size={20} /> : <FiMessageCircle size={21} />}
      </button>

      {open && (
        <section className="fixed right-4 bottom-36 lg:bottom-20 z-50 w-[calc(100vw-2rem)] max-w-[380px] h-[560px] max-h-[70vh] bg-white border border-[#ddd] shadow-2xl flex flex-col">
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
                <p>최초 실행 시 약 500MB의 AI 모델을 다운로드합니다. 이후에는 브라우저 캐시를 재사용할 수 있습니다.</p>
                <button type="button" onClick={startModel} disabled={loading} className="mt-3 w-full bg-[#333] text-white py-2 disabled:opacity-50">
                  {loading ? `AI 모델 준비 중${progress ? ` ${progress}%` : '...'}` : 'AI 시작하기'}
                </button>
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
              disabled={!ready || loading}
              placeholder={ready ? '찾는 상품을 입력하세요' : 'AI 모델을 먼저 시작해주세요'}
              className="flex-1 min-w-0 border border-[#ccc] px-3 py-2 text-xs outline-none focus:border-[#777] disabled:bg-[#f5f5f5]"
            />
            <button type="submit" disabled={!ready || loading || !input.trim()} className="w-10 flex items-center justify-center bg-[#7f0019] text-white disabled:opacity-40" aria-label="메시지 보내기">
              <FiSend size={16} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}

export default AiAssistant;
