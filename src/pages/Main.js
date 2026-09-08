import React from 'react';
import FromMuji from '../components/FromMuji';
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

      {/* 좌우를 교차하는 고정 화보와 기획전 카드, 브랜드 이야기 */}
      <PlanSection />
      <FromMuji />
    </>
  );
}

export default Main;
