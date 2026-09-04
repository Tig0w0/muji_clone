import React from 'react';
import { Card, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <Col md={4} className="mb-4">
      <Card 
        className="h-100 border-0" 
        style={{ cursor: 'pointer' }} 
        onClick={() => navigate(`/detail/${product.id}`)}
      >
        <Card.Img variant="top" src={product.imgUrl} alt={product.title} />
        <Card.Body className="d-flex flex-column text-center">
          <Card.Title className="fw-bold">{product.title}</Card.Title>
          <Card.Text className="text-muted small">{product.content}</Card.Text>
          <div className="mt-auto">
            <h5 className="fw-bold text-danger">{product.price.toLocaleString()}원</h5>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default ProductCard;
