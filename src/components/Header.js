import React, { useState } from 'react';
import { asset } from '../utils/asset';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import TopBelt from './TopBelt';
import { useSelector } from 'react-redux';

/* ── 메가 메뉴 데이터 ─────────────────────────────────── */
const megaMenuData = {
  의복: [
    { name: '남성', children: ['아우터', '티셔츠', '니트', '팬츠', '셔츠', '홈웨어', '이너웨어', '양말'] },
    { name: '여성', children: ['아우터', '티셔츠', '니트', '팬츠', '스커트', '원피스', '홈웨어', '이너웨어'] },
    { name: '아동', children: ['아우터', '상의', '하의', '내의', '아이템'] },
    { name: '패션잡화', children: ['가방', '지갑', '모자', '양말', '벨트', '우산'] },
  ],
  생활: [
    { name: '주방용품', children: ['주방잡화', '주방수납/정리', '식기', '잔/컵/물병', '보관/밀폐용기', '조리도구', '커피/티용품'] },
    { name: '여행용품', children: ['트래블파우치', '여행용기', '여행용품세트'] },
    { name: '패브릭', children: ['침구', '수건', '쿠션/방석', '러그'] },
    { name: '수납/정리', children: ['폴리프로필렌', '수납박스', '서랍장', '선반'] },
    { name: '가구', children: ['소파', '테이블', '의자', '수납가구', '침대'] },
    { name: '생활용품', children: ['욕실용품', '청소용품', '세탁용품', '방향제'] },
    { name: '가전/디지털', children: ['조명', '오디오', '선풍기/히터', '공기청정기'] },
    { name: '문구', children: ['볼펜/필기류', '노트/다이어리', '파일/바인더'] },
    { name: '반려동물', children: ['반려동물 먹이', '반려동물 용품'] },
  ],
  식품: [
    { name: '간편조리', children: ['밀키트', '국', '반찬', '스프/카레/소스', '파스타/면류'] },
    { name: '스낵', children: ['과자', '쿠키', '초콜릿', '젤리/캔디', '팝콘'] },
  ],
  뷰티: [
    { name: '스킨케어', children: ['클렌징', '토너', '에센스·세럼', '로션', '크림', '선케어'] },
    { name: '바디&헤어', children: ['바디워시', '바디로션', '샴푸', '컨디셔너', '헤어에센스'] },
    { name: '구강케어', children: ['칫솔', '치약', '가글'] },
    { name: '뷰티소품', children: ['화장솜', '면봉', '거울', '파우치'] },
    { name: '프래그런스', children: ['향수', '룸스프레이', '캔들', '디퓨저'] },
  ],
};

/* MUJI Support는 아이콘 카드 형태라 별도 데이터 */
const supportMenu = [
  { name: 'MUJI GIFT CARD', icon: asset('/images/support/support_bn_giftcard_02.jpg') },
  { name: 'ReMUJI',         icon: asset('/images/support/support_bn_stamp_02.jpg') },
  { name: '카탈로그',        icon: asset('/images/support/support_bn_catalog_02.jpg') },
  { name: '사용설명서',      icon: asset('/images/support/support_bn_instructions_02.jpg') },
  { name: 'IA 상담 서비스',  icon: asset('/images/support/support_bn_ia_02.jpg') },
  { name: '커뮤니티 예약',   icon: asset('/images/support/support_bn_commu_02.jpg') },
  { name: '매장 픽업',       icon: asset('/images/support/support_bn_pickup_02.jpg') },
];

/* ── 메가 메뉴 패널 (2단 좌우 구조) ──────────────────── */
const TwoColumnPanel = ({ menuKey, menuData, activeSubMenu, setActiveSubMenu }) => (
  <div className="flex gap-10">
    <ul className="w-[225px] shrink-0 border-r border-neutral-200">
      {menuData.map(sub => (
        <li
          key={sub.name}
          className={`flex h-[48px] cursor-pointer text-[14px] font-[500] ${activeSubMenu === sub.name ? 'bg-neutral-100 font-semibold text-neutral-900' : 'text-neutral-800 hover:bg-neutral-100'}`}
          onMouseEnter={() => setActiveSubMenu(sub.name)}
        >
          <Link className="flex w-full items-center justify-between pl-[24px] pr-4" to="/">
            {sub.name}
            <FiChevronRight className={activeSubMenu === sub.name ? 'text-neutral-900' : 'text-neutral-400'} />
          </Link>
        </li>
      ))}
    </ul>
    <ul className="flex max-h-[360px] flex-col flex-wrap gap-2 text-sm">
      {menuData.find(sub => sub.name === activeSubMenu)?.children.map(child => (
        <li key={child} className="h-[40px] w-[200px] py-[10px]">
          <Link className="px-[30px] font-medium text-neutral-700 hover:text-neutral-900 hover:underline" to="/">{child}</Link>
        </li>
      ))}
    </ul>
  </div>
);

/* ── MUJI Support 패널 (아이콘 카드 형태) ──────────────── */
const SupportPanel = () => (
  <div className="flex gap-6">
    {supportMenu.map(item => (
      <Link key={item.name} to="/" className="flex w-[200px] flex-col items-center gap-3 rounded-sm text-center text-[13px] font-medium text-neutral-700 hover:opacity-80">
        <img
          src={item.icon}
          alt={item.name}
          className="h-[176px] w-[200px] rounded-sm object-cover"
        />
        <span>{item.name}</span>
      </Link>
    ))}
  </div>
);

/* ── 메인 헤더 컴포넌트 ──────────────────────────────── */
function Header() {
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState({});
  const cartCount = useSelector(state => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));

  const openMenu = (menuKey) => {
    setHoveredMenu(menuKey);
    /* 해당 메뉴를 처음 열 때 첫 번째 항목을 기본 선택 */
    if (megaMenuData[menuKey] && !activeSubMenu[menuKey]) {
      setActiveSubMenu(prev => ({ ...prev, [menuKey]: megaMenuData[menuKey][0].name }));
    }
  };

  return (
    <>
      {/* 동적 띠 배너 컴포넌트 */}
      <TopBelt />

      {/* 무인양품 원본 Tailwind 헤더 시작 */}
      <div className="sticky top-0 z-40 w-full transition-[top] duration-300 ease-out">
        <section
          id="sticky-header"
          className="w-full bg-white lg:border-b lg:border-gray-200"
          onMouseLeave={() => setHoveredMenu(null)}
        >
          <div className="Content mx-auto flex h-[56px] w-full max-w-[1920px] px-4 sm:px-6 lg:h-[60px] lg:px-[80px]">
            <div className="flex h-full w-full items-center justify-between">

              {/* 좌측: 로고 & 메인 메뉴 */}
              <div className="flex h-full items-center justify-between lg:gap-[32px] 3xl:gap-[60px]">
                {/* 로고 */}
                <Link to="/" className="inline-block w-[100px] cursor-pointer align-top lg:w-[140px]">
                  <img alt="MUJI logo" className="h-full w-full" src={asset('/images/logo/logo.svg')} />
                </Link>

                {/* PC 메인 메뉴 */}
                <div className="flex h-full flex-row-reverse items-center text-[14px] font-[600] leading-none text-neutral-800 max-lg:hidden 3xl:gap-0">

                  {/* 상단 서브 메뉴 (기획전, From MUJI, MUJI Support) */}
                  <div className="relative flex h-full flex-row-reverse lg:pl-[6px] xl:pl-[10px] 3xl:pl-[14px]">
                    <div className="flex items-center" onMouseEnter={() => setHoveredMenu(null)}>
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">기획전</Link>
                    </div>
                    <div className="flex items-center" onMouseEnter={() => setHoveredMenu(null)}>
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">From MUJI</Link>
                    </div>
                    <div className="flex items-center" onMouseEnter={() => openMenu('MUJI Support')}>
                      <span className="flex h-full cursor-pointer items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80">MUJI Support</span>
                    </div>
                  </div>

                  {/* 하단 메인 메뉴 (BEST, 의복, 생활, 식품, 뷰티, MUJI GIFT CARD) */}
                  <div className="flex h-full border-r border-neutral-300 lg:mr-2 lg:pr-[6px] xl:pr-[10px] 3xl:pr-[14px]">
                    <div className="flex items-center" onMouseEnter={() => setHoveredMenu(null)}>
                      <Link className="flex h-full items-center px-2 leading-none text-primary-muji lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">BEST</Link>
                    </div>
                    <div className="flex cursor-pointer items-center" onMouseEnter={() => openMenu('의복')}>
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">의복</Link>
                    </div>
                    <div className="flex cursor-pointer items-center" onMouseEnter={() => openMenu('생활')}>
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">생활</Link>
                    </div>
                    <div className="flex cursor-pointer items-center" onMouseEnter={() => openMenu('식품')}>
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">식품</Link>
                    </div>
                    <div className="flex cursor-pointer items-center" onMouseEnter={() => openMenu('뷰티')}>
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">뷰티</Link>
                    </div>
                    <div className="flex items-center leading-none" onMouseEnter={() => setHoveredMenu(null)}>
                      <Link className="flex h-full items-center px-2 leading-none lg:px-[6px] xl:px-[10px] 3xl:px-[14px] hover:opacity-80" to="/">MUJI GIFT CARD</Link>
                    </div>
                  </div>

                </div>
              </div>

              {/* 우측: 아이콘 영역 */}
              <div className="flex items-center gap-2 lg:gap-5 3xl:gap-10">
                {/* 검색창 영역 (PC) */}
                <div className="flex items-center max-lg:hidden">
                  <i className="inline-block h-6 w-6 cursor-pointer align-top hover:opacity-80">
                    <img alt="search" className="h-full w-full" src={asset('/images/icons/icon_search.svg')} />
                  </i>
                </div>
                {/* 모바일 돋보기 */}
                <i className="inline-block h-6 w-6 cursor-pointer lg:hidden">
                  <img alt="search mobile" className="h-full w-full" src={asset('/images/icons/icon_search.svg')} />
                </i>
                {/* 마이페이지 */}
                <i className="inline-block h-6 w-6 cursor-pointer hover:opacity-80 max-lg:hidden">
                  <img alt="mypage" className="h-full w-full" src={asset('/images/icons/icon_user.svg')} />
                </i>
                {/* 장바구니 */}
                <Link className="relative inline-flex items-center hover:opacity-80" to="/cart/list" aria-label={`장바구니 상품 ${cartCount}개`}>
                  <i className="inline-block h-6 w-6 cursor-pointer align-top">
                    <img alt="cart" className="h-full w-full" src={asset('/images/icons/icon_cart.svg')} />
                  </i>
                  <span className="absolute left-[6px] top-0 w-[16px] text-center text-[10px] font-[600] leading-[1.5] text-[#1d1d1f]">
                    {cartCount}
                  </span>
                </Link>
              </div>

            </div>
          </div>

          {/* ── 메가 메뉴 드롭다운 패널 ── */}
          <div className="relative max-lg:hidden">
            {/* 의복 / 생활 / 식품 / 뷰티 — 공통 2단 패널 */}
            {['의복', '생활', '식품', '뷰티'].map(key => (
              <div
                key={key}
                className={`absolute z-[101] w-full border-t border-neutral-200 bg-white shadow-md transition-all duration-200 ${hoveredMenu === key ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'}`}
              >
                <div className="mx-auto max-w-[1920px] px-[80px] pb-6 pt-6">
                  <TwoColumnPanel
                    menuKey={key}
                    menuData={megaMenuData[key]}
                    activeSubMenu={activeSubMenu[key] || megaMenuData[key][0].name}
                    setActiveSubMenu={(val) => setActiveSubMenu(prev => ({ ...prev, [key]: val }))}
                  />
                </div>
              </div>
            ))}

            {/* MUJI Support — 아이콘 카드 패널 */}
            <div
              className={`absolute z-[101] w-full border-t border-neutral-200 bg-white shadow-md transition-all duration-200 ${hoveredMenu === 'MUJI Support' ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'}`}
            >
              <div className="mx-auto max-w-[1920px] px-[80px] pb-8 pt-8">
                <SupportPanel />
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
