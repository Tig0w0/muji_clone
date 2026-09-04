import React from 'react';
import { Container } from 'react-bootstrap';
import Banner from '../components/Banner'; // 메인 비주얼 배너
import CircleNav from '../components/CircleNav'; // 원형 퀵 메뉴

function Main() {
  return (
    <>
      {/* 전체 너비를 꽉 채우는 메인 비주얼 배너 */}
      <Banner />
      
      {/* 동그란 카테고리 퀵 메뉴 영역 (좌우 스크롤) */}
      <CircleNav />
      
      {/* 아래부터는 양옆 여백이 있는 상품 영역 */}
      <Container className="mt-5">
        <h4 className="fw-bold mb-4">신상품이 입고 되었어요</h4>
        <p>이곳에 동그란 카테고리 메뉴와 상품 리스트가 들어갈 예정입니다.</p>
      </Container>
    </>
  );
}

export default Main;
