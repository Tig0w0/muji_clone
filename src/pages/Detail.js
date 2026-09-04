import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

function Detail() {
  const { id } = useParams();

  return (
    <Container className="mt-4">
      <h2>상품 상세 페이지</h2>
      <p>현재 선택된 상품 ID: {id}</p>
      <p>이곳에 상품의 상세 이미지와 스펙 정보가 들어갈 예정입니다.</p>
    </Container>
  );
}

export default Detail;
