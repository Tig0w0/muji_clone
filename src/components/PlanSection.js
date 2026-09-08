import React, { useEffect, useRef, useState } from 'react';
import { mainPlans } from '../db/data';
import { MainImage, ProductPreview, PromotionVisual } from './PromotionVisual';
import './MainEditorial.css';

// 보조 카드의 짧은 등장 효과는 큰 이미지의 sticky 동작과 분리합니다.
function RevealColumn({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '0px 0px -20% 0px', threshold: 0 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`plan-column plan-reveal${visible ? ' is-visible' : ''}`}>{children}</div>;
}

function PlanCard({ entry }) {
  const { plan, point } = entry;
  const products = [...new Map(point.flatMap(item => item.products).map(product => [product.product_id, product])).values()];
  return <article className="plan-card">
    <a href="#">
      <MainImage className="plan-card-image" src={plan.plan_thumbnail_image_full || plan.plan_thumbnail_image} alt={plan.name} />
      <div className="plan-card-copy"><h3>{plan.name}</h3><p>{plan.sub_name}</p></div>
    </a>
    <div className="plan-products">{products.map(product => <ProductPreview key={product.product_id} product={product} />)}</div>
  </article>;
}

export default function PlanSection() {
  return <div className="main-promotions">
    {[mainPlans.slice(0, 5), mainPlans.slice(5, 10)].filter(group => group.length).map((group, index) => (
      <section key={group[0].plan.plan_id} className={`plan-section${index % 2 ? ' plan-section-reverse' : ''}`} aria-label={group[0].plan.name}>
        <div className="plan-feature"><PromotionVisual entry={group[0]} featured /></div>
        <div className="plan-cards">
          <div className="plan-column">{group.slice(1, 3).map(entry => <PlanCard key={entry.plan.plan_id} entry={entry} />)}</div>
          <RevealColumn>{group.slice(3, 5).map(entry => <PlanCard key={entry.plan.plan_id} entry={entry} />)}</RevealColumn>
          {index === 1 && <a className="editorial-more" href="#">기획전 더보기</a>}
        </div>
      </section>
    ))}
  </div>;
}
