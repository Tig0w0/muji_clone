import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { getProductDetail, getProductCategory, getProductImage, catalogProducts } from '../db/data';
import ProductGallery from '../components/ProductGallery';
import ProductInfo from '../components/ProductInfo';
import ProductDescription from '../components/ProductDescription';

const ProductDetailContent = ({ product }) => {
  const id = product.product_id;
  const [color, setColor] = useState(0);
  const relatedProducts = useMemo(() => {
    const baseName = product.product_name || '';
    const words = baseName.split(/\s+/);
    const lastWord = words[words.length - 1]; // Core noun (e.g. 셔츠)
    
    return (getProductCategory(id)?.products || [])
      .filter(item => item.product_id !== id)
      .map(item => {
        let score = 0;
        words.forEach(w => {
          if (w.length > 1 && item.product_name.includes(w)) {
            score += (w === lastWord ? 10 : 1);
          }
        });
        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || (b.review_count || 0) - (a.review_count || 0))
      .slice(0, 10);
  }, [id, product.product_name]);



  // 페이지 진입 시 스크롤을 맨 위로 올리고 최근 본 상품으로 저장합니다.
  useEffect(() => {
    window.scrollTo(0, 0);
    setColor(0);
    localStorage.setItem('recentProductId', id);
    
    let recents = [];
    try { recents = JSON.parse(localStorage.getItem('recentProductIds') || '[]'); } catch (e) {}
    recents = recents.filter(rid => rid !== id);
    recents.unshift(id);
    if (recents.length > 20) recents = recents.slice(0, 20);
    localStorage.setItem('recentProductIds', JSON.stringify(recents));
  }, [id]);

  const recentProductIds = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('recentProductIds') || '[]'); } catch (e) { return []; }
  }, [id]);

  const recentlyViewed = recentProductIds.filter(rid => rid !== id).map(getProductDetail).filter(Boolean);
  const popularRanking = useMemo(() => {
    const categoryGroup = getProductCategory(id);
    const pool = categoryGroup ? categoryGroup.products : catalogProducts;
    return [...pool]
      .filter(p => p.product_id !== id)
      .sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
      .slice(0, 15);
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
          <aside className="min-w-0 px-4 pt-6 lg:sticky lg:top-[84px] lg:row-span-2 lg:max-h-[calc(100vh-108px)] lg:overflow-y-auto lg:px-0 lg:pt-0">
            <ProductInfo key={id} product={product} color={color} onColorChange={setColor} relatedProducts={relatedProducts} />
          </aside>
          <div className="mt-16 min-w-0 lg:mt-20"><ProductDescription product={product} /></div>
        </div>
        {popularRanking.length > 0 && (
          <section className="mt-24 px-4 pb-10 lg:px-0">
            <h2 className="mb-8 text-xl font-semibold lg:text-[32px]">인기랭킹</h2>
            <Swiper modules={[FreeMode]} freeMode={true} slidesPerView="auto" spaceBetween={20} className="w-full">
              {popularRanking.map(item => (
                <SwiperSlide key={item.product_id} className="!w-[44vw] shrink-0 lg:!w-[14.58vw]">
                  <Link to={`/products/view/${item.product_id}`} className="block">
                    <img src={getProductImage(item)} alt={item.product_name} loading="lazy" className="aspect-square w-full bg-neutral-100 object-cover mix-blend-multiply" />
                    <p className="mt-3 truncate text-sm">{item.product_name}</p>
                    <p className="mt-2 text-sm font-semibold">{Number(item.sell_price).toLocaleString('ko-KR')}원</p>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        {recentlyViewed.length > 0 && (
          <section className="mt-10 px-4 pb-10 lg:px-0">
            <h2 className="mb-8 text-xl font-semibold lg:text-[32px]">최근 본 상품</h2>
            <Swiper modules={[FreeMode]} freeMode={true} slidesPerView="auto" spaceBetween={20} className="w-full">
              {recentlyViewed.map(item => (
                <SwiperSlide key={item.product_id} className="!w-[44vw] shrink-0 lg:!w-[14.58vw]">
                  <Link to={`/products/view/${item.product_id}`} className="block">
                    <img src={getProductImage(item)} alt={item.product_name} loading="lazy" className="aspect-square w-full bg-neutral-100 object-cover mix-blend-multiply" />
                    <p className="mt-3 truncate text-sm">{item.product_name}</p>
                    <p className="mt-2 text-sm font-semibold">{Number(item.sell_price).toLocaleString('ko-KR')}원</p>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}
      </div>
    </main>
  );
};

const Detail = () => {
  const { id } = useParams();
  const product = useMemo(() => getProductDetail(id), [id]);
  if (!product) return <main className="px-4 py-24 text-center"><h1 className="text-xl font-semibold">상품을 찾을 수 없습니다.</h1><Link className="mt-6 inline-block underline" to="/">메인으로 돌아가기</Link></main>;
  return <ProductDetailContent key={id} product={product} />;
};

export default Detail;
