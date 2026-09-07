import React from 'react';
import Banner from '../components/Banner'; // 메인 비주얼 배너
import CircleNav from '../components/CircleNav'; // 원형 퀵 메뉴
import NewArrivals from '../components/NewArrivals'; // 신상품 섹션
import PlanSection from '../components/PlanSection'; // 엇갈림 기획전 섹션

function Main() {
  return (
    <>
      {/* 전체 너비를 꽉 채우는 메인 비주얼 배너 */}
      <Banner />
      
      {/* 동그란 카테고리 퀵 메뉴 영역 (좌우 스크롤) */}
      <CircleNav />
      
      {/* 탭 기반 스와이퍼: 신상품 영역 */}
      <NewArrivals />

      {/* 좌측 Sticky 고정, 우측 스크롤 기획전 영역 */}
      <PlanSection />
    </>
  );
}

export default Main;
