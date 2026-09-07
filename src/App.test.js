import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getProductById, getProductDetail, getProductVariants, isOptionAvailable, mainCategoryProducts } from './db/data';
import ProductDetail from './components/ProductDetail';
import NewArrivals from './components/NewArrivals';

// Use the real v7 router exports through its CommonJS entry for CRA's Jest resolver.
jest.mock('react-router-dom', () => jest.requireActual('react-router'));

// Swiper layout needs a browser; these tests exercise data, routing and purchase-option state.
jest.mock('swiper/react', () => ({
  Swiper: ({ children }) => <div>{children}</div>,
  SwiperSlide: ({ children }) => <div>{children}</div>,
}), { virtual: true });
jest.mock('swiper/modules', () => ({ A11y: {}, Keyboard: {}, FreeMode: {} }), { virtual: true });
jest.mock('swiper/css', () => ({}), { virtual: true });
jest.mock('swiper/css/free-mode', () => ({}), { virtual: true });

beforeEach(() => {
  window.scrollTo = jest.fn();
  window.IntersectionObserver = jest.fn(() => ({ observe: jest.fn(), disconnect: jest.fn() }));
});

const renderDetail = id => render(<MemoryRouter initialEntries={[`/products/view/${id}`]}><Routes><Route path="/products/view/:id" element={<ProductDetail />} /></Routes></MemoryRouter>);

it('uses the exact main-list product objects for every category and builds valid options', () => {
  Object.values(mainCategoryProducts).forEach(category => category.products.forEach(product => {
    expect(getProductById(String(product.product_id))).toBe(product);
    const detail = getProductDetail(product.product_id);
    expect(detail.sell_price).toBe(product.sell_price);
    expect(detail.categories).toContain(category.name);
    expect(detail.variants.length).toBeGreaterThan(0);
    expect(detail.images.length).toBeGreaterThan(0);
    detail.variants.forEach(variant => {
      const source = product.options.option[variant.key];
      const rawChoices = source?.sizes || Object.values(product.options.option);
      expect(variant.choices).toHaveLength(rawChoices.filter(option => option.is_display !== 0).length);
      variant.choices.forEach(option => {
        expect(option.product_option_id).toBeDefined();
        expect(option.label).toBeTruthy();
      });
    });
  }));
});

it('loads a product directly by URL and changes the gallery with its color', () => {
  renderDetail(1005355);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('이중가제');
  fireEvent.click(screen.getByRole('button', { name: '스모키그린', exact: true }));
  expect(screen.getByRole('button', { name: '스모키그린', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByAltText('남성 사이드 심리스 이중가제 긴소매 파자마 이미지 1')).toHaveAttribute('src', getProductVariants(getProductById(1005355))[1].images[0]);
});

it('disables sold-out sizes and resets the selection when changing colors', () => {
  renderDetail(1005355);
  const options = within(screen.getByRole('group', { name: '옵션 선택' }));
  expect(options.getByRole('button', { name: 'XXL', exact: true })).toBeDisabled();
  fireEvent.click(options.getByRole('button', { name: 'S', exact: true }));
  expect(screen.getByLabelText('선택 수량')).toHaveTextContent('1');
  fireEvent.click(screen.getByRole('button', { name: '스모키그린', exact: true }));
  expect(screen.queryByLabelText('선택 수량')).not.toBeInTheDocument();
  expect(within(screen.getByRole('group', { name: '옵션 선택' })).getByRole('button', { name: 'XXL', exact: true })).toBeEnabled();
});

it('limits quantity to stock and calculates the selected option total', () => {
  renderDetail(1005355);
  fireEvent.click(within(screen.getByRole('group', { name: '옵션 선택' })).getByRole('button', { name: 'S', exact: true }));
  expect(screen.getByRole('button', { name: '수량 줄이기' })).toBeDisabled();
  for (let i = 0; i < 12; i++) fireEvent.click(screen.getByRole('button', { name: '수량 늘리기' }));
  expect(screen.getByLabelText('선택 수량')).toHaveTextContent('7');
  expect(screen.getByRole('button', { name: '수량 늘리기' })).toBeDisabled();
  expect(screen.getByLabelText('상품 합계')).toHaveTextContent('419,300원');
});

it('supports a food product without clothing options or copied pajama facts', () => {
  renderDetail(1005714);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('명태 비빔 냉면');
  expect(screen.queryByRole('group', { name: '색상 선택' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '바로 구매' }));
  expect(screen.getByRole('status')).toHaveTextContent('옵션을 선택해 주세요.');
  fireEvent.click(within(screen.getByRole('group', { name: '옵션 선택' })).getByRole('button', { name: 'FREE' }));
  expect(screen.getByLabelText('상품 합계')).toHaveTextContent('7,900원');
  expect(screen.queryByText(/캄보디아/)).not.toBeInTheDocument();
});

it('navigates from a main card to that exact product detail', () => {
  render(<MemoryRouter><Routes><Route path="/" element={<NewArrivals />} /><Route path="/products/view/:id" element={<ProductDetail />} /></Routes></MemoryRouter>);
  fireEvent.click(screen.getByRole('link', { name: '남성 사이드 심리스 이중가제 긴소매 파자마 상세 보기' }));
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('남성 사이드 심리스 이중가제 긴소매 파자마');
});

it('returns a not-found page instead of a different product for unknown IDs', () => {
  expect(getProductById('invalid')).toBeNull();
  renderDetail(999999999);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('상품을 찾을 수 없습니다.');
});

it('honors both product and option sale states', () => {
  expect(isOptionAvailable({ stock: 10, sale_state: 'SOLDOUT' }, { sale_state: 'ON' })).toBe(false);
  expect(isOptionAvailable({ stock: 10, sale_state: 'ON' }, { sale_state: 'SOLDOUT' })).toBe(false);
  expect(isOptionAvailable({ stock: 0, sale_state: 'ON' }, { sale_state: 'ON' })).toBe(false);
});

it('resets selected size and quantity when navigating to a related product', () => {
  renderDetail(1005355);
  fireEvent.click(within(screen.getByRole('group', { name: '옵션 선택' })).getByRole('button', { name: 'S', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: '수량 늘리기' }));
  const related = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/products/view/1005435');
  fireEvent.click(related);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(getProductById(1005435).product_name);
  expect(screen.queryByLabelText('선택 수량')).not.toBeInTheDocument();
});
