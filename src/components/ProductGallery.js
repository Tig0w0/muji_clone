import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Keyboard } from 'swiper/modules';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import 'swiper/css';

const ProductGallery = ({ product, color }) => {
  const [active, setActive] = useState(0);
  const swiperRef = useRef(null);
  const thumbsRef = useRef(null);
  // 선택한 색상에 포함된 실제 이미지 배열을 그대로 사용합니다.
  const variantImages = product.variants[color]?.images || [];
  const images = variantImages.length ? variantImages : product.images;
  const select = (index) => swiperRef.current?.slideTo(index);
  if (!images.length) return <div className="flex aspect-square items-center justify-center bg-neutral-100 text-sm text-neutral-500">상품 이미지가 없습니다.</div>;
  return (
    <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:gap-4">
      <div className="hidden w-[3.54vw] max-w-[68px] shrink-0 flex-col lg:flex">
        <button type="button" aria-label="이전 상품 이미지" disabled={active === 0} onClick={() => select(active - 1)} className="mb-2 flex justify-center disabled:opacity-30"><FiChevronUp size={24} /></button>
        <div ref={thumbsRef} className="flex max-h-[32.5vw] flex-col gap-2 overflow-y-auto [scrollbar-width:none]">
          {images.map((src, index) => <button key={src} type="button" aria-label={`상품 이미지 ${index + 1}`} aria-pressed={active === index} onClick={() => select(index)} className={`shrink-0 border ${active === index ? 'border-neutral-900' : 'border-transparent'}`}><img src={src.replace('w=960', 'w=68')} alt="" className="aspect-square w-full object-cover" /></button>)}
        </div>
        <button type="button" aria-label="다음 상품 이미지" disabled={active === images.length - 1} onClick={() => select(active + 1)} className="mt-2 flex justify-center disabled:opacity-30"><FiChevronDown size={24} /></button>
      </div>
      <div className="min-w-0 flex-1">
        <Swiper modules={[A11y, Keyboard]} keyboard={{ enabled: true, onlyInViewport: true }} slidesPerView={1} direction="horizontal" breakpoints={{ 1024: { direction: 'vertical' } }} onSwiper={(swiper) => { swiperRef.current = swiper; }} onSlideChange={(swiper) => {
          setActive(swiper.activeIndex);
          const thumb = thumbsRef.current?.children[swiper.activeIndex];
          if (thumb) thumbsRef.current.scrollTo({ top: Math.max(0, thumb.offsetTop - thumbsRef.current.offsetTop - 80), behavior: 'smooth' });
        }} className="aspect-square w-full bg-neutral-100">
          {images.map((src, index) => <SwiperSlide key={src}><img src={src} alt={`${product.product_name} 이미지 ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover" /></SwiperSlide>)}
        </Swiper>
        <div className="mt-3 flex justify-center gap-1 lg:hidden">
          {images.map((src, index) => <button key={src} type="button" aria-label={`이미지 ${index + 1}로 이동`} aria-pressed={active === index} onClick={() => select(index)} className="flex h-6 w-6 items-center justify-center"><span className={`h-1.5 w-1.5 rounded-full ${active === index ? 'bg-neutral-900' : 'bg-neutral-300'}`} /></button>)}
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
