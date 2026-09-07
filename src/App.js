import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Main from './pages/Main';
import ProductDetail from './components/ProductDetail';
import Cart from './pages/Cart';

function App() {
  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 화면 상단에 항상 고정되는 헤더 */}
      <Header />
      
      {/* 중간 콘텐츠 영역 (페이지 이동에 따라 내용이 바뀜) */}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/products/view/:id" element={<ProductDetail />} />
          <Route path="/cart/list" element={<Cart />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </div>
      
      {/* 화면 하단에 항상 고정되는 푸터 */}
      <Footer />
    </div>
  );
}

export default App;
