import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { topBelt as beltData } from '../db/data'; // 이름 불일치 에러 수정

import 'swiper/css';

function TopBelt() {
  // 데이터가 없으면 렌더링하지 않음
  if (!beltData || beltData.length === 0) return null;

  return (
    <div 
      id="HeaderLineBanner" 
      style={{
        position: 'relative',
        zIndex: 2,
        borderBottom: '1px solid #ebebec'
      }}
    >
      <Swiper
        direction={'vertical'}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        modules={[Autoplay]}
        loop={beltData.length > 1} // 데이터가 여러 개일 때만 루프
        allowTouchMove={false} // 띠 배너는 직접 드래그 스와이프를 막는 경우가 많음
        style={{
          width: '100%',
          height: '48px',
          zIndex: 1,
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: 0,
          listStyle: 'none',
          display: 'block',
          position: 'relative',
          overflow: 'hidden',
          touchAction: 'pan-x'
        }}
      >
        {beltData.map((item, index) => {
          // '$MUJI APP$' 같은 텍스트 처리를 위해 원본 텍스트를 그대로 사용
          const title = item.belt_title;
          
          return (
            <SwiperSlide 
              key={index}
              style={{
                backgroundColor: item.belt_background_color || '#1d1d1f',
                height: '48px'
              }}
            >
              <a 
                href={item.belt_link_url} 
                style={{ textDecoration: 'none', display: 'block', height: '100%' }}
              >
                <div 
                  style={{
                    display: 'flex',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div 
                    style={{
                      color: item.belt_font_color || '#ffffff',
                      fontSize: '1rem', // PC 화면을 위해 16px(1rem) 수준으로 확대
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.belt_title.split(/\$(.*?)\$/g).map((part, i) => 
                      i % 2 === 1 ? (
                        <span key={i} style={{ color: item.belt_bold_color || 'inherit' }}>
                          {part}
                        </span>
                      ) : (
                        <React.Fragment key={i}>{part}</React.Fragment>
                      )
                    )}
                  </div>
                </div>
              </a>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

export default TopBelt;
