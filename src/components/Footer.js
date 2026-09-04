import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-light py-5 mt-5 border-top text-secondary" style={{ fontSize: '0.85rem' }}>
      <Container>
        <Row className="mb-4">
          <Col md={8}>
            <h6 className="fw-bold text-dark mb-3">무인양품 주식회사</h6>
            <p className="mb-1">대표이사 : 정기호 | 서울특별시 서대문구 연세로 12, 6층(창천동, 무인양품 신촌점)</p>
            <p className="mb-1">사업자등록번호 : 211-87-18698 | 통신판매업신고번호 : 2011-서울마포-0114</p>
            <p className="mb-1">개인정보보호책임자 : 박상진</p>
          </Col>
          <Col md={4} className="text-md-end">
            <h6 className="fw-bold text-dark mb-3">고객센터</h6>
            <p className="mb-1 fw-bold fs-5">1577-2892</p>
            <p className="mb-1">운영시간 : 평일 09:30 ~ 17:30</p>
            <p className="mb-1">(점심시간 12:00 ~ 13:00 / 주말 및 공휴일 휴무)</p>
          </Col>
        </Row>
        <Row>
          <Col className="text-center mt-3 pt-3 border-top">
            <p className="mb-0">Copyright © MUJI KOREA co.Ltd. All Rights Reserved.</p>
            <small>이 사이트는 클론 코딩 포트폴리오 목적으로 제작되었습니다.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
