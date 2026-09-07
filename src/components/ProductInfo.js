import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiUpload, FiMessageSquare, FiStar } from 'react-icons/fi';
import { getProductImage, isOptionAvailable } from '../db/data';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../store';

const money = value => Number(value || 0).toLocaleString('ko-KR');

const ProductInfo = ({ product, color, onColorChange, relatedProducts = [] }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const variant = product.variants[color] || product.variants[0];
  const [optionId, setOptionId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(Boolean(product.is_like));
  const [notice, setNotice] = useState('');
  const choices = variant?.choices || [];
  const selected = choices.find(option => String(option.product_option_id) === optionId);
  const available = isOptionAvailable(selected, product);
  const soldOut = !product.variants.some(group => group.choices.some(option => isOptionAvailable(option, product)));
  const unitPrice = Number(product.sell_price) + Number(selected?.adjust_price || 0);
  const releases = choices.filter(option => option.muji_release_date && Number(option.stock) === 0);
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setNotice('상품 주소를 복사했습니다.'); }
    catch { setNotice('브라우저 주소창에서 상품 주소를 복사해 주세요.'); }
  };
  const purchase = action => {
    if (!selected) { setNotice('옵션을 선택해 주세요.'); return; }
    if (!available) { setNotice('선택한 옵션은 품절입니다.'); return; }
    if (action !== 'cart') { setNotice('주문 기능을 준비 중입니다.'); return; }
    const existing = cartItems.find(item => item.productId === product.product_id && item.optionId === selected.product_option_id);
    const remaining = Number(selected.stock) - (existing?.quantity || 0);
    if (remaining <= 0) { setNotice('해당 옵션의 구매 가능한 수량이 이미 장바구니에 담겨 있습니다.'); return; }
    dispatch(addItem({ productId: product.product_id, optionId: selected.product_option_id, quantity }));
    setNotice(remaining < quantity ? `재고 수량에 맞춰 ${remaining}개를 장바구니에 담았습니다.` : '장바구니에 담았습니다.');
  };
  return (
    <div className="bg-white">
      <p className="mb-4 text-xs text-neutral-500 lg:hidden">{product.categories.join(' › ')}</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {(product.flag_list || []).map((flag, index) => <span key={index} className="rounded-sm border border-neutral-200 px-2 py-1.5 text-xs leading-none">{typeof flag === 'string' ? flag : flag.name || flag.tag_name}</span>)}
        {soldOut && <span className="rounded-sm border border-neutral-200 px-2 py-1.5 text-xs">품절</span>}
      </div>
      <div className="mb-3 flex items-start justify-between gap-3">
        <h1 className="max-w-[402px] text-lg font-bold leading-6 lg:text-2xl lg:leading-8">{product.product_name}</h1>
        <div className="flex shrink-0 gap-2">
          <button type="button" aria-label="관심상품" aria-pressed={liked} onClick={() => setLiked(!liked)} className="flex h-8 w-8 items-center justify-center"><FiHeart size={26} fill={liked ? '#7f0019' : 'none'} color={liked ? '#7f0019' : 'currentColor'} /></button>
          <button type="button" aria-label="상품 공유" onClick={share} className="flex h-8 w-8 items-center justify-center"><FiUpload size={26} /></button>
        </div>
      </div>
      <button type="button" onClick={() => document.getElementById('product-review')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 text-xs text-neutral-500"><FiMessageSquare size={20} />{product.review_count || 0}<FiStar size={20} />{Number(product.review_score || 0).toFixed(1)}</button>
      {Number(product.retail_price) > Number(product.sell_price) && <p className="mt-4 text-sm text-neutral-500 line-through">{money(product.retail_price)}원</p>}
      <p className="mt-4 text-xl font-semibold leading-none lg:text-2xl">{money(product.sell_price)}원</p>
      <dl className="mt-6 flex flex-col gap-5 text-sm text-neutral-600">
        <div className="flex gap-4"><dt className="w-16 shrink-0 font-semibold">배송정보</dt><dd>{product.shipping_type === 'INSTALL' ? '설치 배송' : '택배 배송'}</dd></div>
        <div className="flex gap-4"><dt className="w-16 shrink-0 font-semibold">배송비</dt><dd>{product.shipping_type === 'INSTALL' ? <>500,000원 이상 구매시 무료 설치배송.<br />500,000원 미만 구매시 배송비 50,000원</> : <>30,000원 이상 구매시 배송비 무료.<br />30,000원 미만 구매시 배송비 3,500원<br />도서산간비 추가</>}</dd></div>
        <div className="flex gap-4"><dt className="w-16 shrink-0 font-semibold">상품번호</dt><dd>{product.code}</dd></div>
      </dl>
      <div className="mt-6 border-t border-neutral-200 py-6">
        {product.options?.option_type === 'SUB' && <>
          <div role="group" aria-label="색상 선택" className="flex flex-wrap gap-1.5">
            {product.variants.map((group, index) => <button key={group.key} type="button" title={group.name} aria-label={group.name} aria-pressed={index === color} onClick={() => { onColorChange(index); setOptionId(''); setQuantity(1); setNotice(''); }} className={`flex h-[42px] min-w-[42px] items-center justify-center rounded-full border ${index === color ? 'border-neutral-600' : 'border-transparent'}`}>
              {group.chip ? <img src={group.chip} alt="" className="h-8 w-8 rounded-full border border-neutral-200 object-cover" /> : group.hex ? <span className="h-8 w-8 rounded-full border border-neutral-200" style={{ backgroundColor: group.hex }} /> : <span className="px-2 text-xs">{group.name}</span>}
            </button>)}
          </div>
          <p className="mt-2 text-xs text-neutral-600">{variant.name}</p>
        </>}
        <div role="group" aria-label="옵션 선택" className="mt-5 flex flex-wrap gap-2">
          {choices.map(option => <button key={option.product_option_id} type="button" aria-pressed={optionId === String(option.product_option_id)} disabled={!isOptionAvailable(option, product)} onClick={() => { setOptionId(String(option.product_option_id)); setQuantity(1); setNotice(''); }} className={`rounded-sm border px-[23px] py-[9px] text-sm font-medium disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 disabled:line-through ${optionId === String(option.product_option_id) ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 text-neutral-800'}`}>{option.label}</button>)}
        </div>
        {!choices.length && <p className="mt-3 text-sm text-neutral-500">선택 가능한 옵션이 없습니다.</p>}
        <button type="button" onClick={() => document.getElementById('product-size')?.scrollIntoView({ behavior: 'smooth' })} className="mt-4 text-sm text-neutral-500 underline">사이즈 및 상품 정보</button>
        {relatedProducts.length > 0 && <div className="mt-10"><p className="mb-5 text-sm font-semibold">연관 상품</p><div className="flex gap-2 overflow-x-auto pb-2">{relatedProducts.map(item => <Link key={item.product_id} to={`/products/view/${item.product_id}`} className="w-[120px] shrink-0"><img src={getProductImage(item)} alt={item.product_name} loading="lazy" className="aspect-square w-full bg-neutral-100 object-cover" /><p className="mt-1 truncate text-sm">{item.product_name}</p><p className="mt-1 text-sm font-semibold">{money(item.sell_price)}원</p></Link>)}</div></div>}
        {releases.length > 0 && <details open className="mt-5"><summary className="cursor-pointer py-3 text-sm font-semibold">입고예정 안내</summary><div className="space-y-2 bg-neutral-100 p-4 text-sm">{releases.map(option => <p key={option.product_option_id}>{variant.name} / {option.label} : {option.muji_release_date.slice(0, 10)}</p>)}</div></details>}
        {selected && <div className="mt-6 bg-neutral-100 p-4"><p className="text-sm">{product.options?.option_type === 'SUB' ? `${variant.name} / ` : ''}{selected.label}</p><div className="mt-4 flex items-center justify-between gap-3"><div className="flex items-center border border-neutral-300 bg-white"><button type="button" aria-label="수량 줄이기" disabled={quantity <= 1} onClick={() => setQuantity(value => value - 1)} className="h-9 w-9 disabled:text-neutral-300">−</button><output aria-label="선택 수량" className="w-10 text-center text-sm">{quantity}</output><button type="button" aria-label="수량 늘리기" disabled={quantity >= Number(selected.stock)} onClick={() => setQuantity(value => Math.min(Number(selected.stock), value + 1))} className="h-9 w-9 disabled:text-neutral-300">+</button></div><p aria-label="상품 합계" className="font-semibold">{money(unitPrice * quantity)}원</p></div></div>}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => purchase('cart')} disabled={soldOut} className="h-[52px] rounded-sm border border-neutral-300 text-base font-medium disabled:text-neutral-400">장바구니</button>
          <button type="button" onClick={() => purchase('buy')} disabled={soldOut} className="h-[52px] rounded-sm bg-neutral-900 text-base font-medium text-white disabled:bg-neutral-300">{soldOut ? '품절' : '바로 구매'}</button>
        </div>
        <button type="button" onClick={() => setNotice('매장별 재고 정보는 현재 제공하지 않습니다.')} className="mt-2 h-11 w-full border border-neutral-300 text-sm">매장재고</button>
        {notice && <div className="mt-3 text-sm leading-6 text-primary-muji"><p role="status">{notice}</p>{notice.includes('담았습니다') && <Link to="/cart/list" className="inline-block underline">장바구니 보기</Link>}</div>}
      </div>
    </div>
  );
};

export default ProductInfo;
