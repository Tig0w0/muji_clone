import React, { useMemo } from 'react';
import { asset } from '../utils/asset';
import { Link } from 'react-router-dom';
import { mainCategoryProducts, productDetailsList, getProductById } from '../db/data';

const initialNavItems = [
  { title: "신상품", link: "#", img: "circlenav_01.png" },
  { title: "숏클립", link: "#", img: "circlenav_02.png" },
  { title: "MUJI GIFT\nCARD", link: "#", img: "circlenav_03.png" },
  { title: "SNS 인기템", link: "#", img: "circlenav_04.png" },
  { title: "남성", link: "#", img: "circlenav_05.png" },
  { title: "여성", link: "#", img: "circlenav_06.png" },
  { title: "아동", link: "#", img: "circlenav_07.png" },
  { title: "패션잡화", link: "#", img: "circlenav_08.png" },
  { title: "생활용품", link: "#", img: "circlenav_09.png" },
  { title: "주방용품", link: "#", img: "circlenav_10.png" },
  { title: "패브릭", link: "#", img: "circlenav_11.png" },
  { title: "수납/정리", link: "#", img: "circlenav_12.png" },
  { title: "가구", link: "#", img: "circlenav_13.png" },
  { title: "뷰티", link: "#", img: "circlenav_14.png" },
  { title: "반려동물", link: "#", img: "circlenav_15.png" },
  { title: "문구", link: "#", img: "circlenav_16.png" },
  { title: "간편조리", link: "#", img: "circlenav_17.png" },
  { title: "스낵", link: "#", img: "circlenav_18.png" },
  { title: "가전/디지털", link: "#", img: "circlenav_19.png" },
  { title: "Labo", link: "#", img: "circlenav_20.jpg" },
];

function CircleNav() {
  // 컴포넌트 마운트 시 카테고리별 랜덤 상품 링크를 한 번만 계산합니다.
  const navItems = useMemo(() => {
    return initialNavItems.map(item => {
      let targetProducts = [];
      const cleanTitle = item.title.replace('\n', ' ');

      // 해당 타이틀과 일치하는 메인 카테고리 상품들을 찾습니다.
      for (const key in mainCategoryProducts) {
        if (mainCategoryProducts[key].name === cleanTitle) {
          targetProducts = mainCategoryProducts[key].products || [];
          break;
        }
      }

      // 유효한 상품(catalogProducts에 존재하는 상품)만 필터링합니다. (이미지 없는 상품은 제외됨)
      targetProducts = targetProducts.filter(p => getProductById(p.product_id || p.item_id || p.code));

      // 일치하는 카테고리가 없거나 유효한 상품이 비어있으면, 전체 상세 상품 리스트를 사용합니다.
      if (targetProducts.length === 0 && productDetailsList.length > 0) {
        targetProducts = productDetailsList;
      }

      // 상품 배열에서 랜덤하게 하나를 선택합니다.
      if (targetProducts.length > 0) {
        const randomIdx = Math.floor(Math.random() * targetProducts.length);
        const product = targetProducts[randomIdx];
        return { ...item, link: `/products/view/${product.product_id || product.item_id || product.code}` };
      }

      return item;
    });
  }, []);

  return (
    <section className="relative">
      
      {/* 1. PC 뷰 */}
      <div className="max-lg:hidden">
        <div className="relative mx-[auto] grid w-[93.33vw] max-w-[1360px] grid-cols-10 gap-x-[20px] gap-y-[20px] lg:mt-[30px] xl:mt-[60px]">
          {navItems.map((item, idx) => (
            <div key={`pc-${idx}`}>
              <Link to={item.link}>
                <div className="flex cursor-pointer flex-col items-center gap-[12px] text-center">
                  <div className="relative flex h-[80px] w-[80px] items-center justify-center overflow-hidden rounded-full bg-[#F2F2F2]">
                    <img 
                      alt={item.title.replace('\n', ' ')} 
                      loading="lazy" 
                      className="object-cover h-full w-full absolute inset-0"
                      src={asset(`/images/circlenav/${item.img}`)} 
                    />
                  </div>
                  <p className="text-[15px] font-medium leading-[1.3] max-xl:text-[14px] whitespace-pre-line">{item.title}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 모바일 뷰 */}
      <div className="mt-[20px] lg:hidden">
        <div>
          <div className="flex flex-col md:items-center">
            
            {/* 상단 스크롤 라인 */}
            <div className="w-full select-none overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-[8px] pl-[16px] w-max">
                {navItems.filter((_, idx) => idx % 2 === 0).map((item, idx) => (
                  <div key={`mo-top-${idx}`} className="w-[60px] flex-shrink-0">
                    <Link to={item.link}>
                      <div className="flex cursor-pointer flex-col items-center gap-[8px] text-center">
                        <div className="relative flex h-[59px] w-[59px] items-center justify-center overflow-hidden rounded-full bg-[#F2F2F2]">
                          <img 
                            alt={item.title.replace('\n', ' ')} 
                            loading="lazy" 
                            className="h-full w-full rounded-full object-cover absolute inset-0"
                            src={asset(`/images/circlenav/${item.img}`)} 
                          />
                        </div>
                        <p className="text-[12px] font-medium leading-[1.36] whitespace-pre-line">{item.title}</p>
                      </div>
                    </Link>
                  </div>
                ))}
                <div className="w-[16px] shrink-0"></div>
              </div>
            </div>

            {/* 하단 스크롤 라인 */}
            <div className="w-full select-none overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex gap-[8px] pl-[16px] w-max">
                {navItems.filter((_, idx) => idx % 2 !== 0).map((item, idx) => (
                  <div key={`mo-bot-${idx}`} className="w-[60px] flex-shrink-0">
                    <Link to={item.link}>
                      <div className="flex cursor-pointer flex-col items-center gap-[8px] text-center">
                        <div className="relative flex h-[59px] w-[59px] items-center justify-center overflow-hidden rounded-full bg-[#F2F2F2]">
                          <img 
                            alt={item.title.replace('\n', ' ')} 
                            loading="lazy" 
                            className="h-full w-full rounded-full object-cover absolute inset-0"
                            src={asset(`/images/circlenav/${item.img}`)} 
                          />
                        </div>
                        <p className="text-[12px] font-medium leading-[1.36] whitespace-pre-line">{item.title}</p>
                      </div>
                    </Link>
                  </div>
                ))}
                {/* 더보기 버튼 */}
                <div className="w-[60px] flex-shrink-0">
                  <Link to="/products/view/1004128">
                    <div className="flex cursor-pointer flex-col items-center gap-[8px] text-center">
                      <div className="flex h-[59px] w-[59px] items-center justify-center overflow-hidden rounded-full bg-neutral-100">
                        <i className="inline-block cursor-pointer align-top w-6">
                          <img 
                            alt="더보기" 
                            loading="lazy" 
                            className="h-full w-full"
                            src={asset('/images/icons/arrow_right.svg')} 
                          />
                        </i>
                      </div>
                      <p className="text-[12px] font-medium leading-[1.36]">더보기</p>
                    </div>
                  </Link>
                </div>
                <div className="w-[16px] shrink-0"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default CircleNav;
