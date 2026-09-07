import React from 'react';
import { Link } from 'react-router-dom';

const navItems = [
  { title: "신상품", link: "https://mujikorea.co.kr/products/new?qb=&category=2", img: "mKF3arlxh2tev2L7P0p0PRoOUXKnZXpF4NUq8kq1.png" },
  { title: "숏클립", link: "/plan/view/197", img: "bBpBF3PMsbN6fhqqKpOfKuFSbutE8WbGyE1VIFRM.png" },
  { title: "MUJI GIFT\nCARD", link: "/mujisupport/giftcard?qb", img: "ti7n4lHbivGKel7EPlMjpPRCSHTtDJqbmPS0tSZt.png" },
  { title: "SNS 인기템", link: "/plan/view/261?qb", img: "XcdcY6GdqYhip3ss2iUc8gRmjN65DmHLAd3Jjdbf.png" },
  { title: "남성", link: "/products/category/5?qb", img: "pow2JtVlLlsGhrA40nVgm9A02hvZPBNWdcQxNGJB.png" },
  { title: "여성", link: "/products/category/6?qb", img: "PXInCXTTvYplyS4utYLMV7fb3rPv3BTPN4pblqB5.png" },
  { title: "아동", link: "/products/category/7?qb", img: "bgfoeDJuuVDf4AqVBUtpi3UiHJurfQpmJkGBa7NH.png" },
  { title: "패션잡화", link: "/products/category/8?qb", img: "F7HO5fwzzbM6B0TYnV7bhlMb7d8hOEaXPKffFCqk.png" },
  { title: "생활용품", link: "/products/category/26?qb", img: "xDs9DAJM7J9CtH10pBhiWJWCGClj3ps40xuQ8Fhd.png" },
  { title: "주방용품", link: "/products/category/22?qb", img: "IxKQWKHdgKPwovTOdFzMntMYdUtlMUiGbVnjXOXi.png" },
  { title: "패브릭", link: "/products/category/23?qb", img: "lJCAn2MifIIpPhcBsEHosg0T0KVOqP1CWXvSXMHY.png" },
  { title: "수납/정리", link: "/products/category/24?qb", img: "FnHKt30d20nucSTowFmRogxCvpNoPx7aE14TDhHY.png" },
  { title: "가구", link: "/products/category/25?qb", img: "CIXkzScFWN3tsUIUGzWMayb9LHVQ0sLlmSQheek2.png" },
  { title: "뷰티", link: "/products/category/178", img: "pDRI9JTZWuZjcpTa4o3SG3cZqAkI1f74YOS8pmNz.png" },
  { title: "반려동물", link: "/products/category/168?qb", img: "2mTa4ecjkQEcsuOgqWEI0SIYJJ878IxImnl3U7F5.png" },
  { title: "문구", link: "/products/category/28?qb", img: "a9pV7Qlc1Nyjmv3Iy4dvIWg2Z9SiiFLy127BC58W.png" },
  { title: "간편조리", link: "/products/category/9?qb", img: "FhvWdITLbPWGSHbrd1GCMF80SNlOheVqbS0Sckzz.png" },
  { title: "스낵", link: "/products/category/10?qb", img: "jCseAx18FRguTu2ZP9Am50uYyTtBj9jZ9envenSi.png" },
  { title: "가전/디지털", link: "/products/category/27?qb", img: "239VcSNaFVsteXgcpwLlbcirULYrA2i42rBhmXtM.png" },
  { title: "Labo", link: "/plan/view/110?qb", img: "Wn4ueN8MpE1XNQB6wKmCz5OEzDVFyctU8rpW3FYG.jpg" },
];

function CircleNav() {
  return (
    <section className="relative">
      
      {/* 1. PC 뷰 */}
      <div className="max-lg:hidden">
        <div className="relative mx-[auto] grid w-[93.33vw] max-w-[1360px] grid-cols-10 gap-x-[20px] gap-y-[20px] lg:mt-[30px] xl:mt-[60px]">
          {navItems.map((item, idx) => (
            <div key={`pc-${idx}`}>
              {/* 외부 링크와 내부 링크 분기 처리 가능하지만 디자인 클론 목적이므로 그대로 a 태그 허용 혹은 Link 사용 */}
              <Link to={item.link}>
                <div className="flex cursor-pointer flex-col items-center gap-[12px] text-center">
                  <div className="relative flex h-[80px] w-[80px] items-center justify-center overflow-hidden rounded-full bg-[#F2F2F2]">
                    <img 
                      alt={item.title.replace('\n', ' ')} 
                      loading="lazy" 
                      className="object-cover h-full w-full absolute inset-0"
                      src={`https://public.mujikorea.co.kr/images/banner/${item.img}`} 
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
            {/* Tailwind Arbitrary variants로 scrollbar 숨김 처리 */}
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
                            src={`https://public.mujikorea.co.kr/images/banner/${item.img}`} 
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
                            src={`https://public.mujikorea.co.kr/images/banner/${item.img}`} 
                          />
                        </div>
                        <p className="text-[12px] font-medium leading-[1.36] whitespace-pre-line">{item.title}</p>
                      </div>
                    </Link>
                  </div>
                ))}
                {/* 더보기 버튼 */}
                <div className="w-[60px] flex-shrink-0">
                  <Link to="/layer/category">
                    <div className="flex cursor-pointer flex-col items-center gap-[8px] text-center">
                      <div className="flex h-[59px] w-[59px] items-center justify-center overflow-hidden rounded-full bg-neutral-100">
                        <i className="inline-block cursor-pointer align-top w-6">
                          <img 
                            alt="더보기" 
                            loading="lazy" 
                            className="h-full w-full"
                            src="https://mujikorea.co.kr/_next/static/media/arrow_right.2rkxjuegzh6o1.svg" 
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
