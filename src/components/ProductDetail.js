import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductDetail, getProductCategory, getProductImage } from '../db/data';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductDescription from './ProductDescription';

const ProductDetailContent = ({ product }) => {
  const id = product.product_id;
  const [color, setColor] = useState(0);
  const relatedProducts = (getProductCategory(id)?.products || []).filter(item => item.product_id !== id).slice(0, 6);

  // 페이지 진입 시 스크롤을 맨 위로 올립니다.
  useEffect(() => {
    window.scrollTo(0, 0);
    setColor(0);
  }, [id]);

  return (
    <main className="product-detail pb-16 lg:pb-[100px]">
      <div className="mx-auto max-w-[1760px] lg:mt-6 lg:w-[91.66vw]">
        <nav aria-label="상품 카테고리" className="mb-6 hidden items-center gap-2 text-sm text-neutral-400 lg:flex">
          <Link to="/">홈</Link>{product.categories.map(category => <React.Fragment key={category}><span aria-hidden="true">›</span><span className="text-neutral-600">{category}</span></React.Fragment>)}
        </nav>
        {/* 원본 비율: 갤러리 54.38vw, 구매 정보 33.96vw. 나머지는 열 사이 여백입니다. */}
        <div className="grid grid-cols-1 items-start lg:grid-cols-[minmax(0,54.38fr)_minmax(0,33.96fr)] lg:gap-x-[3.32vw]">
          <div className="min-w-0"><ProductGallery key={`${id}-${color}`} product={product} color={color} /></div>
          <aside className="min-w-0 px-4 pt-6 lg:sticky lg:top-6 lg:row-span-2 lg:px-0 lg:pt-0">
            <ProductInfo key={id} product={product} color={color} onColorChange={setColor} relatedProducts={relatedProducts.slice(0, 2)} />
          </aside>
          <div className="mt-16 min-w-0 lg:mt-20"><ProductDescription product={product} /></div>
        </div>
        {relatedProducts.length > 0 && <section className="mt-24 px-4 lg:px-0"><h2 className="mb-8 text-xl font-semibold lg:text-[32px]">연관 상품</h2><div className="flex gap-5 overflow-x-auto pb-5">{relatedProducts.map(item => <Link key={item.product_id} to={`/products/view/${item.product_id}`} className="w-[44vw] shrink-0 lg:w-[14.58vw]"><img src={getProductImage(item)} alt={item.product_name} loading="lazy" className="aspect-square w-full bg-neutral-100 object-cover" /><p className="mt-3 truncate text-sm">{item.product_name}</p><p className="mt-2 text-sm font-semibold">{Number(item.sell_price).toLocaleString('ko-KR')}원</p></Link>)}</div></section>}
      </div>
    </main>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const product = useMemo(() => getProductDetail(id), [id]);
  if (!product) return <main className="px-4 py-24 text-center"><h1 className="text-xl font-semibold">상품을 찾을 수 없습니다.</h1><Link className="mt-6 inline-block underline" to="/">메인으로 돌아가기</Link></main>;
  return <ProductDetailContent key={id} product={product} />;
};

export default ProductDetail;
