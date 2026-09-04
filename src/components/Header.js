import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import TopBelt from './TopBelt';

function Header() {
  return (
    <>
      {/* 동적 띠 배너 컴포넌트 */}
      <TopBelt />

      {/* 무인양품 원본 Tailwind 헤더 시작 */}
      <div className="sticky top-0 z-40 w-full transition-[top] duration-300 ease-out">
        <section id="sticky-header" className="w-full bg-white lg:border-b lg:border-gray-200">
          <div className="Content flex h-[56px] w-full lg:h-[60px] max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-[80px]">
            <div className="flex h-full w-full items-center justify-between">
              
              {/* 좌측: 로고 & 메인 메뉴 */}
              <div className="flex h-full items-center justify-between lg:gap-[32px] 3xl:gap-[60px]">
                {/* 로고 */}
                <Link to="/" className="inline-block cursor-pointer align-top w-[100px] lg:w-[140px]">
                  <img alt="MUJI logo" className="h-full w-full" src="/images/logo.svg" />
                </Link>

                {/* PC 메인 메뉴 (원본 100% 롤백 구조) */}
                <div className="flex h-full flex-row-reverse items-center text-[14px] font-[600] leading-none text-neutral-800 max-lg:hidden 3xl:gap-0">
                  
                  {/* 상단 서브 메뉴 (기획전, From MUJI 등) */}
                  <div className="relative flex h-full flex-row-reverse lg:pl-[6px] xl:pl-[10px] 3xl:pl-[14px]">
                    <div className="flex items-center">
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">기획전</Link>
                    </div>
                    <div className="flex items-center">
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">From MUJI</Link>
                    </div>
                    <div className="flex items-center">
                      <span className="flex h-full cursor-pointer items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80">MUJI Support</span>
                    </div>
                  </div>
                  
                  {/* 하단 메인 메뉴 (BEST, 의복, 생활 등) */}
                  <div className="flex h-full lg:pr-[6px] xl:pr-[10px] 3xl:pr-[14px] border-r border-neutral-300 mr-2 pr-2">
                    <div className="flex items-center">
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] text-primary-muji hover:opacity-80" to="/">BEST</Link>
                    </div>
                    <div className="flex cursor-pointer items-center">
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">의복</Link>
                    </div>
                    <div className="flex cursor-pointer items-center">
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">생활</Link>
                    </div>
                    <div className="flex cursor-pointer items-center">
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">식품</Link>
                    </div>
                    <div className="flex cursor-pointer items-center">
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">뷰티</Link>
                    </div>
                    <div className="flex items-center leading-none">
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">MUJI GIFT CARD</Link>
                    </div>
                  </div>

                </div>
              </div>

              {/* 우측: 아이콘 영역 */}
              <div className="flex items-center gap-2 lg:gap-5 3xl:gap-10">
                {/* 검색창 영역 (PC) */}
                <div className="max-lg:hidden flex items-center">
                  <i className="inline-block cursor-pointer align-top w-6 h-6 hover:opacity-80">
                    <img alt="search" className="w-full h-full" src="/media/icons/icon_search.svg" />
                  </i>
                </div>
                
                {/* 모바일 돋보기 */}
                <i className="inline-block cursor-pointer lg:hidden w-6 h-6">
                  <img alt="search mobile" className="w-full h-full" src="/media/icons/icon_search.svg" />
                </i>
                
                {/* 마이페이지 */}
                <i className="inline-block cursor-pointer max-lg:hidden w-6 h-6 hover:opacity-80">
                  <img alt="mypage" className="w-full h-full" src="/media/icons/icon_user.svg" />
                </i>
                
                {/* 장바구니 */}
                <Link className="relative inline-flex items-center hover:opacity-80" to="/cart">
                  <i className="inline-block cursor-pointer align-top w-6 h-6">
                    <img alt="cart" className="w-full h-full" src="/media/icons/icon_cart.svg" />
                  </i>
                  <span className="absolute left-[6px] top-0 w-[16px] text-center text-[10px] font-[600] leading-[1.5] text-[#1d1d1f]">
                    0
                  </span>
                </Link>
              </div>

            </div>
          </div>

          {/* 메가 메뉴 드롭다운 영역 (초기엔 hidden 상태) */}
          <div className="relative max-lg:hidden">
            <div className="absolute z-[101] mx-auto w-full bg-white hidden border-t border-neutral-200 shadow-md">
              <div className="m-auto max-w-[1920px] px-[80px] pb-6 pt-6">
                <div className="flex gap-10">
                  <ul className="w-[225px] border-r border-neutral-200">
                    <li className="flex h-[48px] text-[14px] font-[500] text-neutral-800 bg-neutral-100 cursor-pointer">
                      <Link className="flex w-full items-center justify-between pl-[24px] pr-4" to="/">
                        스킨케어 <FiChevronRight />
                      </Link>
                    </li>
                    <li className="flex h-[48px] text-[14px] font-[500] text-neutral-800 hover:bg-neutral-100 cursor-pointer">
                      <Link className="flex w-full items-center justify-between pl-[24px] pr-4" to="/">
                        바디&헤어 <FiChevronRight />
                      </Link>
                    </li>
                  </ul>
                  <ul className="flex max-h-[360px] flex-col flex-wrap text-sm gap-2">
                    <li className="h-[40px] w-[200px] py-[10px]"><Link className="px-[30px] text-neutral-700 hover:text-neutral-900 font-medium" to="/">클렌징</Link></li>
                    <li className="h-[40px] w-[200px] py-[10px]"><Link className="px-[30px] text-neutral-700 hover:text-neutral-900 font-medium" to="/">토너</Link></li>
                    <li className="h-[40px] w-[200px] py-[10px]"><Link className="px-[30px] text-neutral-700 hover:text-neutral-900 font-medium" to="/">에센스·세럼</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* 모바일 전용 가로 스크롤 메뉴 (lg:hidden) */}
        <section className="scrollbar-hide flex w-full gap-4 overflow-x-auto whitespace-nowrap border-b border-neutral-200 bg-neutral-white px-4 py-3 text-[14px] font-semibold leading-none text-neutral-800 sm:px-6 lg:hidden">
          <div className="flex flex-row-reverse gap-4 border-r border-neutral-300 pr-4">
            <div className="flex items-center"><Link className="inline-block leading-none" to="/">기획전</Link></div>
            <div className="flex items-center"><Link className="inline-block leading-none" to="/">From MUJI</Link></div>
            <div className="flex items-center"><Link className="inline-block leading-none" to="/">MUJI Support</Link></div>
          </div>
          <div className="flex h-full gap-4">
            <div className="flex items-center"><Link className="flex h-full items-center leading-none text-primary-muji" to="/">BEST</Link></div>
            <div className="flex items-center"><Link className="flex h-full items-center leading-none" to="/">의복</Link></div>
            <div className="flex items-center"><Link className="flex h-full items-center leading-none" to="/">생활</Link></div>
            <div className="flex items-center"><Link className="flex h-full items-center leading-none" to="/">식품</Link></div>
            <div className="flex items-center"><Link className="flex h-full items-center leading-none" to="/">뷰티</Link></div>
          </div>
        </section>

      </div>
    </>
  );
}

export default Header;
