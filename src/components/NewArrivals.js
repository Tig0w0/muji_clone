import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { mainCategoryProducts } from '../db/data';
import 'swiper/css';
import 'swiper/css/free-mode';

// 무인양품 원본 이미지가 없거나 다운로드에 실패한 상품 코드 리스트 (페이지에서 완전히 제외)
const noImageProductCodes = new Set([
  // 영문 코드 (서버 403 차단 확인됨)
  'KE2V2A3A', 'KE2V1A3A', 'KE2Y6A3A', 'KE2Y5A3A',
  'MAJ37A5A', 'MAJ36A5A', 'MAH76A5A',
  'LB35CC3S', 'LB14CC3S', 'NE62CC2S', 'LAB5CC3S', 'LA1PUA3A',
  'C9S1008', 'C4A1005', 'NBE22A3A', 'NBH7CC4S', 'NBH6CC4S',
  'NBC0CC2S', 'NBB9CC2S', 'NB80CC2S',
  'OGB93A5A', 'OGB92A5A', 'OGB91A5A',
  'ODA60A6S', 'ODA59A6S', 'OAP02A3A', 'OAP01A3A',
  'OAO97A3A', 'OAO96A3A', 'OAO95A3A', 'OAO94A3A',
  'OAO93A3A', 'OAO92A3A', 'OAO23A3A', 'OAO09A3A',
  // 숫자 코드 (로컬 파일 없음 - 음식류 간편조리 등)
  '003244', '003046', '8013106', '3039', '595', '557',
  '2865', '717', '14917', '785364', '785357', '000755',
  '003251', '000748', '000731', '78967', '61986', '77618',
  '2988', '2971', '564', '77335', '2926', '2919',
  '2902', '25675',
]);

const getProductImage = (product) => {
  // 1. JSON 내부에 이미 로컬 주소로 변환된 썸네일이 있다면 최우선 사용
  if (product.thumbnail_list && product.thumbnail_list.length > 0) {
    const img = product.thumbnail_list[0];
    if (img.startsWith('/images/products/')) return img;
  }
  
  // 2. 그 외의 모든 경우, 사용자가 다운로드 해둔 로컬 파일(코드명.jpg)을 렌더링
  return `/images/products/${product.code}.jpg`;
};

const NewArrivals = () => {
  // mainCategoryProducts: { A: { name: "남성", products: [...] }, B: { name: "여성", products: [...] }, ... }
  // 1. 객체를 배열로 변환 (탭 렌더링용)
  const categories = Object.entries(mainCategoryProducts).map(([key, value]) => ({
    key,
    name: value.name,
    products: value.products
  }));

  // 2. 상태 관리 (첫번째 탭(남성)이 기본 선택되도록 설정)
  const [activeTab, setActiveTab] = useState(categories.length > 0 ? categories[0].key : null);

  // 현재 활성화된 카테고리의 상품 리스트 (이미지 없는 상품은 제외)
  const currentCategory = categories.find(cat => cat.key === activeTab);
  const products = currentCategory
    ? currentCategory.products.filter(p => !noImageProductCodes.has(p.code))
    : [];

  return (
    <section className="relative">
      <div className="mt-[48px] flex flex-col gap-[48px] pl-[16px] lg:mt-[100px] lg:gap-[100px] lg:pl-[80px]">
        <div className="flex flex-col gap-[16px] lg:gap-[32px]">
          <p className="text-[20px] font-semibold text-neutral-900 lg:text-[32px] lg:font-bold">신상품이 입고 되었어요</p>
          
          <div className="relative flex w-full flex-col">
            {/* 카테고리 탭 영역 */}
            <div className="scrollbar-hide mb-4 flex gap-[16px] overflow-x-auto whitespace-nowrap pr-[16px] max-lg:text-[14px] lg:mb-[28px] lg:gap-[24px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {categories.map((cat) => (
                <p
                  key={cat.key}
                  onClick={() => setActiveTab(cat.key)}
                  className={`cursor-pointer transition-colors ${activeTab === cat.key ? 'text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  {cat.name}
                </p>
              ))}
            </div>

            {/* 상품 리스트 (스와이퍼) 영역 */}
            <div id="relatedProducts" className="relative flex w-full">
              <Swiper
                modules={[FreeMode]}
                freeMode={true}
                slidesPerView={'auto'}
                spaceBetween={20}
                className="w-full"
              >
                {products.map((product) => (
                  <SwiperSlide key={product.product_id} className="relative !w-[14.58vw] max-lg:!max-h-[90.55vw] max-lg:!w-[44.44vw] cursor-pointer">
                    <Link to={`/products/view/${product.product_id}`} className="flex flex-col gap-[12px]" aria-label={`${product.product_name} 상세 보기`}>
                      <article className="flex cursor-pointer gap-[12px] lg:gap-[12px] flex-col">
                        <div className="flex flex-col lg:flex-row">
                          <div className="w-[100%] relative flex aspect-square min-h-[140px] min-w-[140px] justify-end gap-[4px] bg-neutral-100 h-[44.44vw] w-[44.44vw] lg:h-[100%] lg:w-[100%] max-lg:h-[44.44vw] max-lg:w-[44.44vw]">
                            <img
                              className="w-[100%] object-cover absolute inset-0 h-full mix-blend-multiply"
                              loading="lazy"
                              alt={product.product_name}
                              src={getProductImage(product)}
                            />
                            {/* 품절 표시 */}
                            {(product.total_stock === 0 || product.sale_state === 0) && (
                              <div className="text-neutral-0 absolute bottom-0 left-0 z-[10] flex h-full w-full items-center justify-center bg-black/50 py-1.5 text-center uppercase">
                                <span className="inline-block text-[16px] font-bold text-white lg:text-[20px]">SOLD OUT</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <div className="h-[auto] lg:h-[auto]">
                            <p className="max-h-[24px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] leading-[13px] text-[#1d1d1f] lg:text-[14px] lg:font-normal lg:leading-[24px]">
                              {product.product_name}
                            </p>
                          </div>
                          
                          <div className="relative mt-2 text-[12px] leading-[12px] md:mt-1 lg:text-[12px] lg:leading-[12px]">
                            <div className="mt-[4px] flex flex-col flex-wrap max-lg:gap-[4px] lg:flex-row lg:justify-between">
                              <div className="flex flex-col">
                                <span className="font-normal text-[#9D9DA0] lg:text-[13px] lg:leading-[13px]">&nbsp;</span>
                                <p className="mt-[6px] flex items-center text-[13px] font-semibold leading-none lg:justify-center lg:text-[14px]">
                                  {product.sell_price.toLocaleString()}원
                                </p>
                              </div>
                              
                              <div className="lg:self-end flex gap-[8px]">
                                {product.review_count > 0 && (
                                  <div className="flex items-center justify-center gap-[2px]">
                                    <i className="inline-block cursor-pointer align-top w-6 mr-[2px] h-[16px] w-[16px]">
                                      <img alt="star" loading="lazy" width="24" height="24" className="h-full w-full" src="https://mujikorea.co.kr/_next/static/media/star.30hlrl68_3n_2.svg" />
                                    </i>
                                    <p className="text-[12px] font-normal leading-[12px] text-[#9D9DA0] lg:text-[13px] lg:leading-[13px]">
                                      {Number(product.review_score).toFixed(1)}
                                    </p>
                                    <p className="text-[12px] font-normal leading-[12px] text-[#9D9DA0] lg:text-[13px] lg:leading-[13px]">
                                      ({product.review_count})
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 플래그 리스트 (SNS 인기 등) */}
                          {product.flag_list && product.flag_list.length > 0 && (
                            <div className="mb-[4px] mt-[8px] flex flex-wrap gap-[2px] lg:mt-[8px] lg:gap-[4px]">
                              {product.flag_list.map((flag, idx) => (
                                <div key={idx} className="flex bg-[#F5F5F5] px-[4px] py-[3px] text-center text-[11px] font-normal leading-[11px] text-[#3C3C43] lg:px-[6px] lg:text-[12px] lg:leading-[12px]" style={{border: '1px solid rgb(242, 242, 242)'}}>
                                  {flag.tag_name || flag.name || flag}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    </Link>
                  </SwiperSlide>
                ))}

                {/* 신상품 모아보기 더보기 슬라이드 */}
                <SwiperSlide className="relative !w-[14.58vw] max-lg:!max-h-[90.55vw] max-lg:!w-[44.44vw] cursor-pointer flex flex-col justify-center items-center h-[auto]">
                  <div className="flex h-[44.44vw] w-[44.44vw] lg:h-[14.58vw] lg:w-[14.58vw] flex-col items-center justify-center gap-2 lg:gap-4 bg-white hover:bg-neutral-50 transition-colors rounded-md" style={{marginTop: '0px'}}>
                    <p className="text-[14px] font-semibold text-neutral-900 lg:text-[15px]">신상품 모아보기</p>
                    <i className="inline-block cursor-pointer align-top w-6 lg:w-[24px]">
                      <img alt="arrow right" loading="lazy" width="24" height="24" decoding="async" className="h-full w-full opacity-40" src="https://mujikorea.co.kr/_next/static/media/arrow_right_g.00gqkt3rc96uw.svg" />
                    </i>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
