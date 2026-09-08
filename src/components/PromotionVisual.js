import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProductImage, productImageUrl } from '../db/data';
import imagePaths from '../db/mainImagePaths.json';

export function MainImage({ src, alt, ...props }) {
  const base = process.env.PUBLIC_URL || '';
  const localPath = imagePaths[src] ? `${base}${imagePaths[src]}` : productImageUrl(src);
  return <img {...props} src={localPath} alt={alt} loading="lazy" onError={event => {
    const fallback = productImageUrl(src);
    if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
  }} />;
}

export function ProductPreview({ product }) {
  const price = Number(product.last_price ?? product.sell_price);
  return <Link className="promotion-product" to={`/products/view/${product.product_id}`}>
    <MainImage src={getProductImage(product)} alt="" />
    <div><p className="promotion-product-name">{product.product_name || product.name_ko}</p>
      {Number(product.discount_rate) > 0 && <del>{Number(product.retail_price).toLocaleString('ko-KR')}원</del>}
      <p className="promotion-product-price">{Number(product.discount_rate) > 0 && <span>{product.discount_rate}% </span>}{price.toLocaleString('ko-KR')}원</p>
    </div>
  </Link>;
}

export function PromotionVisual({ entry, featured = false, center = false }) {
  const { plan, point = [] } = entry;
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const triggerRefs = useRef({});
  useEffect(() => {
    if (active === null) return;
    const closeOutside = event => { if (!ref.current?.contains(event.target)) setActive(null); };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [active]);
  return <div ref={ref} className={`promotion-visual ${featured ? 'promotion-featured' : `promotion-story${center ? ' promotion-story-center' : ''}`}`} onKeyDown={event => {
    if (event.key === 'Escape' && active !== null) { triggerRefs.current[active]?.focus(); setActive(null); }
  }}>
    <div className="promotion-stage">
    <Link className="promotion-image-link" to={`/plan/view/${plan.plan_id}`} aria-label={plan.name}>
      <MainImage src={plan.plan_thumbnail_image_full || plan.plan_thumbnail_image} alt={plan.name} />
      {featured && <div className="promotion-feature-copy"><p>{plan.title}</p><h2>{plan.name}</h2></div>}
    </Link>
    {point.map(({ info, products }, index) => {
      // 상품이 없는 핫스팟(데이터 정리로 인해 비워진 경우)은 렌더링하지 않습니다.
      if (!products || products.length === 0) return null;

      const id = `promotion-${plan.plan_id}-point-${index}`;
      return <div key={id} className={`promotion-hotspot${active === index ? ' is-open' : ''}`} style={{ left: `${info.x}%`, top: `calc(${info.y}% - 8px)` }} onPointerEnter={event => { if (event.pointerType === 'mouse') setActive(index); }} onPointerLeave={() => {
        if (!ref.current?.querySelector(`#${id}`)?.contains(document.activeElement) && document.activeElement !== triggerRefs.current[index]) setActive(null);
      }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setActive(null); }}>
        <button type="button" ref={node => { triggerRefs.current[index] = node; }} className="promotion-dot" aria-label={`${products[0]?.product_name || products[0]?.name_ko} 상품 정보`} aria-expanded={active === index} aria-controls={active === index ? id : undefined} onClick={() => setActive(active === index ? null : index)} />
        {active === index && <div id={id} className={`promotion-tooltip${info.x > 65 ? ' tooltip-left' : ''}`} role="region" aria-label="대표 상품">
          {products.map(product => <div className="promotion-tooltip-item" key={product.product_id}>
            <p className="promotion-tooltip-name">{product.product_name || product.name_ko}</p>
            <p className="promotion-tooltip-price">{Number(product.last_price ?? product.sell_price).toLocaleString('ko-KR')}원</p>
            <Link className="promotion-tooltip-link" to={`/products/view/${product.product_id}`}>
              <span>상품 보러가기</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
            </Link>
          </div>)}
        </div>}
      </div>;
    })}
    </div>
    {!featured && <Link className="promotion-story-copy" to={`/plan/view/${plan.plan_id}`}><h3>{plan.name}</h3><p>{plan.sub_name}</p></Link>}
  </div>;
}
