import React from 'react';
import { fireEvent, render as renderReact, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getProductById, getProductDetail, getProductVariants, isOptionAvailable, mainCategoryProducts } from './db/data';
import ProductDetail from './components/ProductDetail';
import NewArrivals from './components/NewArrivals';
import Cart from './pages/Cart';
import Header from './components/Header';
import { addItem, createCartStore } from './store';

const render = (ui, store = createCartStore(null)) => ({
  ...renderReact(<Provider store={store}>{ui}</Provider>), store,
});

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

it('adds the selected option to the cart and updates the header count', () => {
  const { store } = render(<MemoryRouter initialEntries={['/products/view/1005355']}><Header /><Routes><Route path="/products/view/:id" element={<ProductDetail />} /><Route path="/cart/list" element={<Cart />} /></Routes></MemoryRouter>);
  fireEvent.click(within(screen.getByRole('group', { name: '옵션 선택' })).getByRole('button', { name: 'S', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: '수량 늘리기' }));
  fireEvent.click(screen.getByRole('button', { name: '장바구니', exact: true }));
  expect(store.getState().cart.items).toEqual([{ productId: 1005355, optionId: 426331, quantity: 2, selected: true }]);
  expect(screen.getByRole('link', { name: '장바구니 상품 2개' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: '장바구니 보기' }));
  expect(screen.getByRole('heading', { name: '장바구니', level: 1 })).toBeInTheDocument();
  expect(screen.getByText('옵션 : 스모키블루 스트라이프/S/2개')).toBeInTheDocument();
  expect(screen.getByLabelText('결제 예정 금액')).toHaveTextContent('119,800원');
});

it('changes cart color, size and quantity and removes the selected item', () => {
  const store = createCartStore(null);
  store.dispatch(addItem({ productId: 1005355, optionId: 426331, quantity: 1 }));
  render(<MemoryRouter><Cart /></MemoryRouter>, store);
  fireEvent.click(screen.getByRole('button', { name: '옵션 변경하기' }));
  const editor = within(screen.getByRole('form', { name: '옵션 변경' }));
  fireEvent.change(editor.getByLabelText('색상'), { target: { value: '스모키그린' } });
  fireEvent.change(editor.getByLabelText('옵션'), { target: { value: '426320' } });
  fireEvent.click(editor.getByRole('button', { name: '수량 늘리기' }));
  fireEvent.click(editor.getByRole('button', { name: '변경 적용' }));
  expect(store.getState().cart.items[0]).toMatchObject({ optionId: 426320, quantity: 2 });
  expect(screen.getByText('옵션 : 스모키그린/S/2개')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: '전체 선택' }));
  expect(screen.getByLabelText('결제 예정 금액')).toHaveTextContent('0원');
  fireEvent.click(screen.getByRole('checkbox', { name: '전체 선택' }));
  fireEvent.click(screen.getAllByRole('button', { name: '선택 삭제' })[0]);
  expect(screen.getByText('장바구니에 담긴 상품이 없습니다.')).toBeInTheDocument();
  expect(store.getState().cart.items).toHaveLength(0);
});

it('keeps delivery-tab selection and totals separate', () => {
  const store = createCartStore(null);
  store.dispatch(addItem({ productId: 1005714, optionId: 430844, quantity: 1 }));
  store.dispatch(addItem({ productId: 1005293, optionId: 426016, quantity: 1 }));
  render(<MemoryRouter><Cart /></MemoryRouter>, store);
  expect(screen.getByLabelText('결제 예정 금액')).toHaveTextContent('11,400원');
  fireEvent.click(screen.getByRole('tab', { name: '설치 배송 (1)' }));
  expect(screen.getByLabelText('결제 예정 금액')).toHaveTextContent('129,000원');
  fireEvent.click(screen.getByRole('checkbox', { name: '전체 선택' }));
  fireEvent.click(screen.getByRole('tab', { name: '택배 배송 (1)' }));
  expect(screen.getByRole('checkbox', { name: '전체 선택' })).toBeChecked();
  expect(screen.getByLabelText('결제 예정 금액')).toHaveTextContent('11,400원');
});

it('lets users remove saved sold-out items without charging for them', () => {
  const storage = { getItem: () => JSON.stringify([{ productId: 1005355, optionId: 426335, quantity: 1, selected: true }]), setItem: jest.fn() };
  render(<MemoryRouter><Cart /></MemoryRouter>, createCartStore(storage));
  expect(screen.getByText('품절', { exact: true })).toBeInTheDocument();
  expect(screen.getByLabelText('결제 예정 금액')).toHaveTextContent('0원');
  fireEvent.click(screen.getAllByRole('button', { name: '품절 삭제' })[0]);
  expect(screen.getByText('장바구니에 담긴 상품이 없습니다.')).toBeInTheDocument();
});

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
