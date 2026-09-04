import React from 'react';
import { mainCategoryProducts, getProductById } from '../db/data';
import './CircleNav.css';

// 카테고리 키 리스트 (A, B, C, D 등)
const categories = Object.keys(mainCategoryProducts);

function CircleNav() {
  return (
    <div className="circle-nav-container">
      <ul className="circle-nav-list">
        {categories.map((key) => {
          const category = mainCategoryProducts[key];
          if (!category || !category.products || category.products.length === 0) return null;

          // 카테고리 첫 번째 상품의 ID를 가져와 상세 정보(이미지) 조회
          const firstProductId = category.products[0].product_id;
          const detail = getProductById(firstProductId);
          
          // 상세 데이터에서 첫 번째 옵션의 첫 번째 이미지 찾기
          let imageUrl = '';
          if (detail && detail.options && detail.options.option) {
             const firstOptionKey = Object.keys(detail.options.option)[0];
             const firstOption = detail.options.option[firstOptionKey];
             if (firstOption && firstOption.images && firstOption.images.length > 0) {
                 imageUrl = firstOption.images[0]; // 대표 상품의 첫 이미지!
             }
          }

          // 이미지를 못 찾았다면 카테고리 상품 배열에 있는 다른 임시 필드를 사용하거나 기본 회색 처리
          const fallbackImage = imageUrl || 'https://via.placeholder.com/150?text=' + encodeURIComponent(category.name);

          return (
            <li key={key} className="circle-nav-item">
              <a href={`/category/${key}`} className="circle-nav-link">
                <div className="circle-img-wrap">
                  <img src={fallbackImage} alt={category.name} />
                </div>
                <span className="circle-nav-title">{category.name}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CircleNav;
