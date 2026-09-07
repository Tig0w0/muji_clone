import React from 'react';

const Footer = () => {
  return (
    <footer id="footer" data-chatbot="false" className="ScrollDown floating footer relative lg:border-t lg:border-neutral-200 false ">
      <div className="">
        <div className="Content mx-auto w-full max-w-[1440px] px-4 lg:px-[60px] 3xl:px-[100px] flex gap-6 overflow-x-scroll whitespace-nowrap py-4 text-[12px] font-semibold scrollbar-hide lg:py-5 lg:text-[14px]">
          <div className="flex items-center"><a href="/contents/company">About MUJI</a></div>
          <div className="flex items-center"><a href="https://recruit.mujikorea.co.kr/home" target="_blank" rel="noreferrer">채용공고</a></div>
          <div className="flex items-center"><a href="/board/location">매장안내</a></div>
          <div className="flex items-center"><a href="/contents/terms">이용약관</a></div>
          <div className="flex items-center font-extrabold"><a href="/contents/privacy">개인정보처리방침</a></div>
        </div>
        <div className="Content mx-auto w-full max-w-[1440px] px-4 lg:px-[60px] 3xl:px-[100px] flex pt-[24px] max-lg:flex-col max-lg:pb-[100px] lg:py-[36px]">
          <div className="lg:w-1/4 2xl:w-1/3">
            <a href="/">
              <i className="inline-block cursor-pointer align-top w-6 w-[120px] lg:w-[140px]">
                <img alt="MUJI Logo" loading="lazy" width="140" height="22" decoding="async" className="h-full w-full" style={{color: 'transparent'}} src="https://mujikorea.co.kr/_next/static/media/logo.1xh_mc-y7cty6.svg" />
              </i>
            </a>
            <ul className="mt-6 flex flex-col gap-4 text-sm font-semibold lg:mt-11 lg:gap-5 lg:pb-4 lg:text-base [&_a]:block [&_a]:leading-none">
              <li><a href="/board/faq">고객센터</a></li>
              <li><a href="/board/notice">공지사항</a></li>
              <li><a href="/mypage/inquiry/oneononeinquiry">1:1문의</a></li>
              <li><a href="/mypage/inquiry/oneononeinquiry/write?type_id=49">제휴문의</a></li>
            </ul>
          </div>
          <div className="max-lg:mt-6 lg:w-3/4 lg:max-w-[870px] lg:pt-[42px] 2xl:w-2/3">
            <button type="button" className="flex w-full justify-center gap-1 py-[10px] text-sm text-neutral-500 lg:hidden">
              무인양품(주) 사업자정보
              <i className="inline-block cursor-pointer align-top w-5">
                <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-full w-full" style={{color: 'transparent'}} src="https://mujikorea.co.kr/_next/static/media/arrow_bottom_g.1fey5a5dclep5.svg" />
              </i>
            </button>
            <div className="hidden max-lg:mt-4 max-lg:flex-col max-lg:gap-4 lg:flex lg:h-full lg:justify-between [&_p]:text-xs [&_p]:leading-[18px] [&_p]:text-neutral-500 [&_p]:lg:text-sm [&_p]:lg:leading-[20px]">
              <div className="flex flex-col gap-4 lg:justify-between">
                <div className="lg:max-w-[328px]">
                  <p>상호명 : 무인양품(주)</p>
                  <p>대표 : NINOMIYA KENICHIRO,김진엽</p>
                  <p>주소 : 서울 중구 서소문로 50 10층(중림동,CENTRALPLACE)</p>
                  <p>사업자번호 : 105-86-73836</p>
                  <p>통신판매업신고 : 2024-서울중구-1904</p>
                </div>
                <div className="flex gap-2 [&_a]:flex [&_a]:h-[40px] [&_a]:w-[40px] [&_a]:items-center [&_a]:justify-center [&_a]:rounded-full [&_a]:border [&_a]:border-neutral-200">
                  <a href="https://play.google.com/store/apps/details?id=com.muji&hl=ko" target="_blank" rel="noreferrer">
                    <img alt="Google Play" loading="lazy" width="20" height="20" decoding="async" className="aspect-square object-contain" src="https://public.mujikorea.co.kr/images/shop/HCEPhhas2bgQlXwuhPYl7lC4YqjkdOxwmo0RhEiG.png" style={{color: 'transparent'}} />
                  </a>
                  <a href="https://apps.apple.com/us/app/%EB%AC%B4%EC%A7%80%EC%BD%94%EB%A6%AC%EC%95%84-%EB%A9%A4%EB%B2%84%EC%8B%AD/id6739993593" target="_blank" rel="noreferrer">
                    <img alt="App Store" loading="lazy" width="20" height="20" decoding="async" className="aspect-square object-contain" src="https://public.mujikorea.co.kr/images/shop/M1ma1a2LXJZsu0IDKv8x0fCHI9Wx6tIhvjGraNYW.svg" style={{color: 'transparent'}} />
                  </a>
                  <a href="https://www.instagram.com/mujikr" target="_blank" rel="noreferrer">
                    <img alt="instagram" loading="lazy" width="20" height="20" decoding="async" className="aspect-square object-contain" src="https://public.mujikorea.co.kr/images/shop/Al5DRMaV1Ch91qC6NMsJvI76DNrJ436xhhzIuxMQ.svg" style={{color: 'transparent'}} />
                  </a>
                  <a href="https://www.facebook.com/mujikorea" target="_blank" rel="noreferrer">
                    <img alt="facebook" loading="lazy" width="20" height="20" decoding="async" className="aspect-square object-contain" src="https://public.mujikorea.co.kr/images/shop/LX5Ph4zZMk1qXwjbkNw2xLieSI0XKULVgYtdyNjH.svg" style={{color: 'transparent'}} />
                  </a>
                  <a href="https://www.youtube.com/@mujikorea_" target="_blank" rel="noreferrer">
                    <img alt="youtube" loading="lazy" width="20" height="20" decoding="async" className="aspect-square object-contain" src="https://public.mujikorea.co.kr/images/shop/GhGdgx5PwZyDjV12ByMAVbh4k05VUOeD4tAx9haK.svg" style={{color: 'transparent'}} />
                  </a>
                </div>
              </div>
              <div className="lg:max-w-[345px]">
                <p>고객만족센터 : 1551-3780</p>
                <p className="whitespace-pre-wrap">운영시간 : 평일 09:30 ~ 18:30 (주말, 공휴일 휴무){'\n'}점심시간 12:30 ~ 13:30</p>
                <p className="mt-3 max-lg:hidden">이 페이지는 리액트 활용 과제를 위한 클론코딩 연습목적으로 제작되었습니다.</p>
                <div className="mt-4 flex gap-5 lg:mt-3">
                  <button className="inline-flex items-center justify-center font-medium gap-1 text-sm text-neutral-500 lg:hover:text-neutral-900 text-xs font-medium text-neutral-500 underline lg:text-sm" type="button">임직원 인증</button>
                </div>
                <div className="mt-6 flex gap-2 lg:mt-5">
                  <a className="inline-flex items-center justify-center font-medium gap-1 h-[44px] px-[12px] text-sm rounded-md border border-neutral-300 bg-neutral-white lg:hover:bg-neutral-200 text-neutral-800 w-full justify-between px-4 py-[10px] uppercase lg:max-w-[150px]" target="_blank" rel="noreferrer" href="https://www.muji.com/">
                    <span>Global Site</span>
                    <i className="inline-block cursor-pointer align-top w-6">
                      <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-full w-full" style={{color: 'transparent'}} src="https://mujikorea.co.kr/_next/static/media/arrow_right.2rkxjuegzh6o1.svg" />
                    </i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-neutral-500 lg:hidden">COPYRIGHT (주)무인양품 ALL RIGHTS RESERVED.</p>
      </div>

      {/* Floating Buttons (Scroll to Top / Recently Viewed) */}
      <div className="fixed bottom-[68px] right-4 z-[10000] lg:bottom-[40px] lg:right-5 lg:z-[11000] max-lg:bottom-[20px] max-lg:transition-[bottom] max-lg:duration-300">
        <div className="grid grid-cols-[38px_1fr] items-end lg:grid-cols-[40px_1fr]">
          <div className="flex flex-col gap-[10px] text-center transition-all duration-300 translate-y-0 max-lg:opacity-100 lg:gap-[10px]">
            <button className="inline-flex items-center justify-center font-medium gap-1 text-sm text-neutral-500 lg:hover:text-neutral-900 relative h-[38px] w-[38px] overflow-hidden rounded-full border border-neutral-100 bg-neutral-white transition-all duration-300 lg:h-10 lg:w-10 max-lg:translate-y-0 max-lg:opacity-0" type="button">
              <img alt="" loading="lazy" decoding="async" className="object-cover" src="https://product.mujikorea.co.kr/images/products/4550723608695/4550723608695_1260.jpg?w=80" style={{position: 'absolute', height: '100%', width: '100%', inset: '0px', color: 'transparent'}} />
            </button>
            <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="inline-flex items-center justify-center font-medium gap-1 text-sm text-neutral-500 lg:hover:text-neutral-900 h-[38px] w-[38px] overflow-hidden rounded-full border border-neutral-100 bg-neutral-white transition-all duration-300 lg:h-10 lg:w-10 pointer-events-auto translate-y-0 opacity-100" type="button">
              <i className="inline-block cursor-pointer align-top w-6 !w-4 lg:w-[18px]">
                <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-full w-full" style={{color: 'transparent'}} src="https://mujikorea.co.kr/_next/static/media/arrow_top.3gmw-khnw0884.svg" />
              </i>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
