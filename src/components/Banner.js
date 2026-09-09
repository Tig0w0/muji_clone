import React from 'react';
import { asset } from '../utils/asset';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';

// Swiper 필수 CSS
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// 1. JSON 파일에서 원본 데이터 불러오기
import bannerJson from '../json/main_banner_and_products.json';

function Banner() {
  
  // PC / MO 배너 데이터 추출
  const pcSlides = bannerJson.data['1_BANNER_MAIN_TOP_PC'] || [];
  const moSlides = bannerJson.data['1_BANNER_MAIN_TOP_MO'] || [];

  // 공통 Swiper 옵션 (양옆 슬라이드 살짝 보이게 설정)
  const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    loop: true,
    slidesPerView: 'auto', // CSS의 width 값에 맞춰서 유동적으로 표시
    centeredSlides: true, // 활성 슬라이드를 가운데로
    spaceBetween: 0,
    autoplay: { delay: 4000, disableOnInteraction: false },
    pagination: {
      el: '.custom-pagination',
      type: 'fraction',
      renderFraction: function (currentClass, totalClass) {
        return `<div class="flex gap-[12px] text-neutral-white"><span class="${currentClass}"></span> / <span class="${totalClass}"></span></div>`;
      }
    },
    navigation: {
      prevEl: '.main-swiper-prev',
      nextEl: '.main-swiper-next',
    },
    className: "MainVisualBanner [&.swiper]:lg:px-[4.16667vw] swiper-backface-hidden overflow-visible lg:overflow-hidden" // 모바일은 밖으로 삐져나온거 보이게, PC는 내부적으로 처리
  };

  return (
    <section className="relative overflow-hidden lg:overflow-visible">
      
      {/* 1. PC용 배너: 모바일 배너와 동시에 노출되지 않도록 기본 숨김 */}
      <div className="hidden sm:block">
        <Swiper {...swiperOptions}>
          {pcSlides.map((item, index) => (
            // PC 뷰 폭을 화면의 일정 비율(원본 약 1200px / 1920px = 62.5vw)로 제한하여 양옆이 걸리도록 유도
            <SwiperSlide key={`pc-${item.banner_id || index}`} className="w-[85vw] lg:w-[62.5vw] 3xl:w-[1200px] [&.swiper-slide]:h-[138.88vw] [&.swiper-slide]:sm:h-[35.42vw] [&.swiper-slide]:3xl:h-[680px]">
              {({ isActive }) => (
                <Link to={item.banner_image_link || "#"} className="relative block h-full w-full cursor-pointer">
                  <img 
                    alt={item.banner_title || `banner-${index}`}
                    className="h-full w-full object-cover" 
                    src={asset(item.banner_image_url)} 
                  />
                  
                  {/* 2. 딤(Dim) 처리 버그 수정: 비활성화 슬라이드만 어둡게 */}
                  <div className={`absolute left-0 top-0 h-full w-full ${isActive ? 'bg-opacity-0' : 'bg-black bg-opacity-40'} transition-colors duration-300`}></div>
                  
                  {/* 텍스트 영역 */}
                  {item.banner_title && (
                    <div>
                      <div className="absolute left-[0] top-[0] z-10 h-full w-full">
                        <div className="absolute bottom-[74px] left-[32px] z-10 lg:bottom-[153px] lg:left-[7.76vw] lg:top-[18.33vw]">
                          <div 
                            className="mb-[16px] whitespace-pre-wrap text-[28px] font-bold leading-[34px] lg:mb-[20px] lg:text-[2.7vw] lg:leading-[3.23vw]"
                            style={{ color: item.banner_title_color || '#ffffff' }}
                          >
                            {item.banner_title}
                          </div>
                          <div 
                            className="text-[16px] font-semibold leading-[16px] lg:text-[1.25vw] lg:leading-[1.25vw]"
                            style={{ color: item.banner_title_color || '#ffffff' }}
                          >
                            {item.banner_sub_title}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              )}
            </SwiperSlide>
          ))}
          
          {/* 커스텀 Pagination & Navigation (PC) */}
          <div className="pointer-events-auto absolute bottom-[32px] z-20 h-[32px] w-[70px] content-center rounded-[30px] bg-black bg-opacity-30 px-[16px] max-lg:right-[16px] lg:bottom-[28px] lg:left-[50%] lg:h-[36px] lg:w-[90px] lg:-translate-x-1/2 3xl:bottom-[53px]">
            <div className="flex flex-row items-center justify-center gap-[2px] py-[10px] lg:py-2">
              <div className="custom-pagination font-nomal flex flex-row items-center justify-center gap-[2px] text-[12px] leading-[12px] text-white lg:text-[14px] lg:leading-[16px] 3xl:text-[16px]">
                {/* Swiper가 이 안에 fraction을 주입함 */}
              </div>
            </div>
          </div>
          <div className="main-swiper-prev absolute left-[4.17vw] top-[50%] z-[9999] h-[40px] w-[40px] -translate-y-1/2 cursor-pointer max-lg:hidden">
            <i className="inline-block cursor-pointer align-top w-6 h-[100%] w-[100%]">
              <img alt="prev" className="h-full w-full" src={asset('/images/icons/arrow_prev.svg')} />
            </i>
          </div>
          <div className="main-swiper-next absolute right-[4.17vw] top-[50%] z-[9999] h-[40px] w-[40px] -translate-y-1/2 cursor-pointer max-lg:hidden">
            <i className="inline-block cursor-pointer align-top w-6 h-[100%] w-[100%]">
              <img alt="next" className="h-full w-full" src={asset('/images/icons/arrow_next.svg')} />
            </i>
          </div>
        </Swiper>
      </div>

      {/* 2. 모바일용 배너 (sm:hidden) */}
      <div className="sm:hidden">
        <Swiper {...swiperOptions}>
          {moSlides.map((item, index) => (
            // 모바일 뷰 폭을 화면의 85%로 제한하여 양옆 슬라이드가 보이게 함
            <SwiperSlide key={`mo-${item.banner_id || index}`} className="w-[85vw] [&.swiper-slide]:h-[138.88vw] [&.swiper-slide]:sm:h-[35.42vw] [&.swiper-slide]:3xl:h-[680px]">
              {({ isActive }) => (
                <Link to={item.banner_image_link || "#"} className="relative block h-full w-full cursor-pointer">
                  <img 
                    alt={item.banner_title || `banner-mo-${index}`}
                    className="h-full w-full object-cover" 
                    src={asset(item.banner_image_url)} 
                  />
                  
                  {/* 비활성화 슬라이드 딤(Dim) 처리 */}
                  <div className={`absolute left-0 top-0 h-full w-full ${isActive ? 'bg-opacity-0' : 'bg-black bg-opacity-40'} transition-colors duration-300`}></div>
                  
                  {item.banner_title && (
                    <div>
                      <div className="absolute left-[0] top-[0] z-10 h-full w-full">
                        <div className="absolute bottom-[74px] left-[32px] z-10 lg:bottom-[153px] lg:left-[7.76vw] lg:top-[18.33vw]">
                          <div 
                            className="mb-[16px] whitespace-pre-wrap text-[28px] font-bold leading-[34px] lg:mb-[20px] lg:text-[2.7vw] lg:leading-[3.23vw]"
                            style={{ color: item.banner_title_color || '#ffffff' }}
                          >
                            {item.banner_title}
                          </div>
                          <div 
                            className="text-[16px] font-semibold leading-[16px] lg:text-[1.25vw] lg:leading-[1.25vw]"
                            style={{ color: item.banner_title_color || '#ffffff' }}
                          >
                            {item.banner_sub_title}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              )}
            </SwiperSlide>
          ))}
          
          {/* 커스텀 Pagination (모바일) */}
          <div className="pointer-events-auto absolute bottom-[32px] z-20 h-[32px] w-[70px] content-center rounded-[30px] bg-black bg-opacity-30 px-[16px] max-lg:right-[16px] lg:bottom-[28px] lg:left-[50%] lg:h-[36px] lg:w-[90px] lg:-translate-x-1/2 3xl:bottom-[53px]">
            <div className="flex flex-row items-center justify-center gap-[2px] py-[10px] lg:py-2">
              <div className="custom-pagination font-nomal flex flex-row items-center justify-center gap-[2px] text-[12px] leading-[12px] text-white lg:text-[14px] lg:leading-[16px] 3xl:text-[16px]">
                {/* Fraction injection point */}
              </div>
            </div>
          </div>
        </Swiper>
      </div>

    </section>
  );
}

export default Banner;
