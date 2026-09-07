import React, { useEffect, useState } from 'react';
import { deliveryGuide } from '../db/data';

const tabs = [['product-description', '상세 정보'], ['product-review', '상품 리뷰'], ['product-size', '사이즈 및 소재'], ['product-inquiry', '상품문의'], ['product-delivery', '배송안내']];

const ProductDescription = ({ product }) => {
  const [active, setActive] = useState(tabs[0][0]);
  const [inquiryNotice, setInquiryNotice] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-10% 0px -65% 0px' });
    tabs.forEach(([id]) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => observer.disconnect();
  }, []);
  return (
    <div>
      <nav aria-label="상품 상세 내용" className="sticky top-0 z-20 flex h-10 bg-white px-4 lg:h-[52px] lg:px-0">
        {tabs.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setActive(id)} className={`flex flex-1 items-center justify-center border-b text-[11.5px] lg:text-base ${active === id ? 'border-neutral-900 font-semibold' : 'border-neutral-300 font-normal'}`}>{label}</a>)}
      </nav>
      <section id="product-description" className="scroll-mt-16 px-4 pt-[60px] lg:px-0">
        {product.images[0] && <img src={product.images[0]} alt={product.product_name} loading="lazy" className="block h-auto w-full" />}
        <div className="px-4 py-10 lg:px-8 lg:py-16"><h2 className="max-w-xl text-2xl font-bold leading-snug lg:text-4xl">{product.product_name}</h2>{product.name_en && <p className="mt-3 text-lg">{product.name_en}</p>}{product.is_display_product_benefit === 1 && product.product_benefit && <p className="mt-6 whitespace-pre-wrap text-sm leading-6">{product.product_benefit}</p>}</div>
        {product.variants.length > 1 && <div className="px-4 py-8 lg:px-8"><h3 className="mb-6 text-xl font-semibold">COLOR</h3><div className="grid grid-cols-3 gap-4">{product.variants.map(variant => <figure key={variant.key}>{variant.images[0] && <img src={variant.images[0]} alt={variant.name} loading="lazy" className="aspect-square w-full object-cover" />}<figcaption className="mt-2 text-center text-xs lg:text-sm">{variant.name}</figcaption></figure>)}</div></div>}
        <h3 className="px-4 pb-6 pt-12 text-xl font-semibold lg:px-8">PRODUCT</h3>
        <div className="flex flex-col gap-6">{product.images.map((src, index) => <img key={src} src={src} alt={`${product.product_name} 상세 이미지 ${index + 1}`} loading="lazy" className="block h-auto w-full" />)}</div>
        {product.variants.slice(1).filter(variant => variant.images.length).map(variant => <figure key={variant.key} className="mt-10"><figcaption className="mb-3 px-4 text-sm">{variant.name}</figcaption><img src={variant.images[0]} alt={`${product.product_name} ${variant.name}`} loading="lazy" className="block h-auto w-full" /></figure>)}
      </section>
      <section id="product-review" className="mx-4 mt-16 scroll-mt-16 border-b border-neutral-200 py-8 lg:mx-0">
        <h2 className="text-lg font-semibold">상품 리뷰 <span className="text-neutral-500">{product.review_count || 0}</span></h2>
        <p className="mt-4 text-sm">평점 {Number(product.review_score || 0).toFixed(1)} / 5</p>
        <p className="py-16 text-center text-sm text-neutral-500">{Number(product.review_count) > 0 ? '리뷰 상세 내용을 준비하고 있습니다.' : '등록된 상품 리뷰가 없습니다.'}</p>
      </section>
      <section id="product-size" className="mt-16 scroll-mt-16 px-4 lg:px-0">
        <h2 className="mb-8 text-lg font-semibold lg:text-xl">사이즈 및 상품 정보</h2>
        <details open className="border border-neutral-200"><summary className="cursor-pointer p-5 font-semibold">상세 정보</summary><dl className="flex flex-col gap-5 bg-neutral-100 p-4 text-sm">{product.facts.map(([label, value]) => <div key={label}><dt className="mb-3 font-semibold">{label}</dt><dd className="whitespace-pre-wrap leading-6">{value}</dd></div>)}</dl></details>
        <p className="mt-4 text-sm text-neutral-500">소재 및 상세 규격 정보를 준비하고 있습니다.</p>
      </section>
      <section id="product-inquiry" className="mx-4 mt-16 scroll-mt-16 border-b border-neutral-200 pb-5 lg:mx-0">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">문의 <span className="text-primary-muji">0</span>건</h2><button type="button" onClick={() => setInquiryNotice(true)} className="border border-neutral-300 px-6 py-3 text-sm">상품 문의하기</button></div>
        {inquiryNotice && <p role="status" className="mt-4 text-sm text-neutral-600">상품 문의는 아직 접수할 수 없습니다.</p>}
      </section>
      <section id="product-delivery" className="mx-4 mt-16 scroll-mt-16 border-x border-t border-neutral-200 lg:mx-0">
        {deliveryGuide.map(({ title, text }) => <details key={title} open className="border-b border-neutral-200"><summary className="cursor-pointer px-4 py-6 text-sm font-semibold lg:text-base">{title}</summary><p className="whitespace-pre-wrap bg-neutral-100 p-4 text-xs leading-6 lg:text-sm">{text}</p></details>)}
      </section>
    </div>
  );
};

export default ProductDescription;
