import React from 'react';
import { fromMujiPlans } from '../db/data';
import { PromotionVisual } from './PromotionVisual';

export default function FromMuji() {
  return <section className="from-muji" aria-labelledby="from-muji-title">
    <h2 id="from-muji-title">From MUJI</h2>
    <div className="from-muji-grid">{[0, 1, 2].map(column => <div className="from-muji-column" key={column}>
      {fromMujiPlans.filter((_, index) => index % 3 === column).map(entry => <PromotionVisual key={entry.plan.plan_id} entry={entry} center={column === 1} />)}
    </div>)}</div>
    <a className="editorial-more" href="#">From MUJI 더보기</a>
  </section>;
}
