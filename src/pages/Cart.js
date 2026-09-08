import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiHome, FiShoppingBag, FiX } from 'react-icons/fi';
import { getProductVariants, isOptionAvailable } from '../db/data';
import { getCartLines, getCartTotals, removeItems, setSelected, updateItem } from '../store';

const money = value => Number(value || 0).toLocaleString('ko-KR');
const outlineButton = 'rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 disabled:cursor-not-allowed disabled:text-neutral-400';

function OptionEditor({ line, lines, onClose, onSaved }) {
  const dispatch = useDispatch();
  const variants = getProductVariants(line.product);
  const [variantKey, setVariantKey] = useState(line.variant.key);
  const [optionId, setOptionId] = useState(String(line.optionId));
  const [quantity, setQuantity] = useState(line.quantity);
  const variant = variants.find(item => item.key === variantKey);
  const option = variant.choices.find(item => String(item.product_option_id) === optionId);
  const existing = lines.find(item => item.key !== line.key && item.productId === line.productId && String(item.optionId) === optionId);
  const maximum = Math.max(0, Number(option?.stock || 0) - (existing?.quantity || 0));
  const canSave = isOptionAvailable(option, line.product) && quantity >= 1 && quantity <= maximum;
  const submit = event => {
    event.preventDefault();
    if (!canSave) return;
    dispatch(updateItem({ key: line.key, optionId: Number(optionId), quantity }));
    onSaved('옵션을 변경했습니다.');
    onClose();
  };
  return (
    <form aria-label="옵션 변경" onSubmit={submit} className="mt-5 grid gap-4 border border-neutral-200 bg-neutral-100 p-4 lg:ml-[142px]">
      {line.product.options?.option_type === 'SUB' && <label className="grid gap-2 text-sm">색상<select value={variantKey} onChange={event => { setVariantKey(event.target.value); setOptionId(''); setQuantity(1); }} className="h-10 min-w-0 border border-neutral-300 bg-white px-3">{variants.map(item => <option key={item.key} value={item.key}>{item.name}</option>)}</select></label>}
      <label className="grid gap-2 text-sm">옵션<select value={optionId} onChange={event => { setOptionId(event.target.value); setQuantity(1); }} className="h-10 min-w-0 border border-neutral-300 bg-white px-3"><option value="">옵션을 선택해 주세요</option>{variant.choices.map(item => <option key={item.product_option_id} value={item.product_option_id} disabled={!isOptionAvailable(item, line.product)}>{item.label}{!isOptionAvailable(item, line.product) ? ' (품절)' : ''}</option>)}</select></label>
      <div className="flex items-center justify-between"><span className="text-sm">수량</span><div className="flex items-center border border-neutral-300 bg-white"><button type="button" aria-label="수량 줄이기" disabled={quantity <= 1} onClick={() => setQuantity(value => value - 1)} className="h-10 w-10 disabled:text-neutral-300">−</button><output aria-label="변경 수량" className="w-10 text-center text-sm">{quantity}</output><button type="button" aria-label="수량 늘리기" disabled={!option || quantity >= maximum} onClick={() => setQuantity(value => value + 1)} className="h-10 w-10 disabled:text-neutral-300">+</button></div></div>
      {option && quantity > maximum && <p className="text-sm text-primary-muji">장바구니에 담긴 수량을 포함해 재고를 초과할 수 없습니다. 변경 가능한 수량: {maximum}개</p>}
      <div className="grid grid-cols-2 gap-2"><button type="button" onClick={onClose} className={`${outlineButton} h-10`}>취소</button><button type="submit" disabled={!canSave} className="h-10 rounded-md bg-neutral-800 text-sm text-white disabled:bg-neutral-300">변경 적용</button></div>
    </form>
  );
}

function Cart() {
  const dispatch = useDispatch();
  const items = useSelector(state => state.cart.items);
  const lines = useMemo(() => getCartLines(items), [items]);
  const [deliveryType, setDeliveryType] = useState(() => lines.length && lines.every(line => line.deliveryType === 'INSTALL') ? 'INSTALL' : 'DELIVERY');
  const [editingKey, setEditingKey] = useState(null);
  const [notice, setNotice] = useState('');
  const checkboxRef = useRef(null);
  const visible = lines.filter(line => line.deliveryType === deliveryType);
  const available = visible.filter(line => line.available);
  const selected = available.filter(line => line.selected);
  const totals = getCartTotals(selected);
  const allSelected = available.length > 0 && selected.length === available.length;
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { if (checkboxRef.current) checkboxRef.current.indeterminate = selected.length > 0 && !allSelected; }, [selected.length, allSelected]);

  const remove = keys => { dispatch(removeItems(keys)); setEditingKey(null); setNotice(`${keys.length}개 항목을 삭제했습니다.`); };
  const deletionButtons = <div className="flex items-center gap-2 text-sm text-neutral-500"><button type="button" disabled={!visible.some(line => line.selected)} onClick={() => remove(visible.filter(line => line.selected).map(line => line.key))} className="whitespace-nowrap disabled:opacity-40">선택 삭제</button><span className="h-3.5 w-px bg-neutral-300" /><button type="button" disabled={!visible.some(line => !line.available)} onClick={() => remove(visible.filter(line => !line.available).map(line => line.key))} className="whitespace-nowrap disabled:opacity-40">품절 삭제</button></div>;
  const order = all => {
    const orderLines = all ? available : selected;
    if (!orderLines.length) return;
    if (all) dispatch(setSelected({ keys: available.map(line => line.key), selected: true }));
    setNotice(`${getCartTotals(orderLines).quantity}개 상품을 선택했습니다. 주문서 작성 기능을 준비 중입니다.`);
  };
  const orderButtons = mobile => <div className={`grid grid-cols-2 gap-2 ${mobile ? '' : 'lg:grid-cols-1'}`}><button type="button" onClick={() => order(true)} disabled={!available.length} className={`rounded-md bg-neutral-800 px-3 font-semibold text-white disabled:bg-neutral-200 disabled:text-neutral-500 ${mobile ? 'order-2 h-11 text-sm' : 'h-[52px] text-lg'}`}>전체 상품 주문</button><button type="button" onClick={() => order(false)} disabled={!selected.length} className={`${outlineButton} ${mobile ? 'order-1 h-11' : 'h-[52px] text-lg'}`}>선택 상품 주문</button></div>;

  return (
    <main className="pb-[180px] lg:pb-[100px]">
      <div className="relative flex h-14 items-center justify-center border-b border-neutral-200 px-4 lg:hidden"><div className="absolute left-4 flex gap-3"><Link to="/" aria-label="쇼핑 계속하기"><FiArrowLeft size={24} /></Link><Link to="/" aria-label="홈"><FiHome size={22} /></Link></div><span className="font-medium">장바구니</span></div>
      <section className="mx-auto w-full max-w-[1920px] px-4 lg:px-20">
        <h1 className="py-10 text-xl font-semibold leading-none lg:text-[32px] lg:font-bold">장바구니</h1>
        <div className="flex flex-col lg:flex-row lg:gap-8 2xl:gap-16">
          <div className="min-w-0 flex-1 lg:basis-3/4">
            <div role="tablist" aria-label="배송 유형" className="flex gap-4 pb-5 text-lg font-semibold lg:text-2xl">{[['DELIVERY', '택배 배송'], ['INSTALL', '설치 배송']].map(([type, label]) => <button key={type} id={`cart-tab-${type}`} aria-controls="cart-panel" role="tab" aria-selected={deliveryType === type} type="button" onClick={() => { setDeliveryType(type); setEditingKey(null); setNotice(''); }} className={`border-b-[3px] pb-1 ${deliveryType === type ? 'border-neutral-900' : 'border-transparent'}`}>{label} ({lines.filter(line => line.deliveryType === type).length})</button>)}</div>
            <div id="cart-panel" role="tabpanel" aria-labelledby={`cart-tab-${deliveryType}`} className="lg:px-6">
              {visible.length ? <>
                <div className="flex items-center justify-between gap-3 py-3"><label className="flex items-center gap-2 text-sm"><input ref={checkboxRef} type="checkbox" checked={allSelected} disabled={!available.length} onChange={event => dispatch(setSelected({ keys: available.map(line => line.key), selected: event.target.checked }))} className="h-3.5 w-3.5 accent-neutral-900" />전체 선택</label>{deletionButtons}</div>
                <div className="flex flex-col gap-10">{visible.map(line => <article key={line.key} aria-label={`${line.product.product_name} ${line.variant.name} ${line.option.label}`}>
                  <div className="flex items-center justify-between py-2"><input type="checkbox" aria-label={`${line.product.product_name} ${line.variant.name} ${line.option.label} 선택`} checked={line.selected && line.available} disabled={!line.available} onChange={event => dispatch(setSelected({ keys: [line.key], selected: event.target.checked }))} className="h-3.5 w-3.5 accent-neutral-900" /><button type="button" aria-label={`${line.product.product_name} ${line.variant.name} ${line.option.label} 삭제`} onClick={() => remove([line.key])}><FiX size={24} /></button></div>
                  <div className="grid gap-4 lg:flex lg:items-center lg:justify-between"><div className="flex min-w-0 items-start gap-3"><Link to={`/products/view/${line.productId}`} className="relative h-[120px] w-[120px] shrink-0 bg-neutral-100 lg:h-[130px] lg:w-[130px]"><img src={line.image} alt={line.product.product_name} className="h-full w-full object-cover" />{!line.available && <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold">품절</span>}</Link><div className="my-auto flex min-w-0 flex-col gap-2 lg:gap-3"><Link to={`/products/view/${line.productId}`} className="line-clamp-2 text-sm font-semibold leading-[18px]">{line.product.product_name}</Link><p className="text-xs text-neutral-600 lg:text-sm">옵션 : {line.product.options?.option_type === 'SUB' ? `${line.variant.name}/` : ''}{line.option.label}/{line.quantity}개</p><p className="text-xs font-semibold lg:text-sm">{money(line.unitPrice * line.quantity)}원</p></div></div><button type="button" aria-expanded={editingKey === line.key} onClick={() => setEditingKey(editingKey === line.key ? null : line.key)} className={`${outlineButton} h-9 shrink-0 lg:w-[106px]`}>옵션 변경하기</button></div>
                  {editingKey === line.key && <OptionEditor key={line.key} line={line} lines={lines} onClose={() => setEditingKey(null)} onSaved={setNotice} />}
                </article>)}</div>
                <div className="mt-10 flex flex-col gap-5 lg:mt-5 lg:flex-row lg:items-center lg:justify-between"><p className="text-xs text-neutral-700 lg:text-sm">주문서 작성 단계에서 할인/포인트 적용을 하실 수 있습니다.</p>{deletionButtons}</div>
                <p className="mt-[30px] text-xs text-neutral-700 lg:text-sm">일반 택배 배송 상품과 냉동 택배 배송 상품의 배송비는 따로 계산됩니다.</p>
              </> : <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 border-y border-neutral-200 py-16"><FiShoppingBag size={40} className="text-neutral-400" /><p className="text-sm text-neutral-600">{lines.length ? '해당 배송 유형의 상품이 없습니다.' : '장바구니에 담긴 상품이 없습니다.'}</p><Link to="/" className="rounded-md border border-neutral-300 px-8 py-3 text-sm">쇼핑 계속하기</Link></div>}
            </div>
          </div>
          <aside aria-label="결제 금액 요약" className="mt-10 min-w-0 lg:mt-0 lg:min-w-[282px] lg:basis-1/4"><div className="border border-neutral-200 px-4 py-8 lg:sticky lg:top-28 lg:px-6"><h2 className="h-12 border-b border-neutral-300 text-lg font-semibold lg:text-xl">결제 금액</h2><div className="flex justify-between gap-2 py-5 text-lg font-semibold"><span>결제 예정 금액</span><span aria-label="결제 예정 금액">{money(totals.total)}원</span></div><dl className="text-sm text-neutral-600"><div className="flex justify-between gap-2 border-b border-neutral-200 px-3 py-4 font-semibold"><dt>총 {totals.quantity}개의 상품 금액</dt><dd>{money(totals.original)}원</dd></div><div className="flex justify-between border-b border-neutral-200 px-3 py-4 font-semibold"><dt>총 할인 혜택</dt><dd>{money(totals.discount)}원</dd></div><div className="flex justify-between border-b border-neutral-200 px-3 py-4 font-semibold"><dt>배송비</dt><dd aria-label="배송비">{money(totals.shipping)}원</dd></div><div className="border-b border-neutral-200 px-3 py-4"><div className="flex justify-between font-semibold"><dt>적립예상 포인트</dt><dd>0P</dd></div><div className="mt-4 flex justify-between"><dt>구매 포인트</dt><dd>0P</dd></div><div className="mt-3 flex justify-between"><dt>회원 포인트</dt><dd>0P</dd></div></div></dl><div className="mt-8 hidden lg:block">{orderButtons(false)}</div></div></aside>
        </div>
        {notice && <p role="status" className="mt-6 rounded border border-neutral-200 bg-neutral-100 p-4 text-sm">{notice}</p>}
      </section>
      <div className="fixed bottom-0 left-0 z-[12000] flex w-full flex-col gap-4 bg-white px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-4 shadow-[0_0_12px_0_rgba(0,0,0,0.12)] lg:hidden"><div className="flex items-center justify-between"><span className="text-sm">{money(totals.discount)}원 할인적용</span><span className="text-xl font-medium">{money(totals.total)}원</span></div>{orderButtons(true)}</div>
    </main>
  );
}

export default Cart;
