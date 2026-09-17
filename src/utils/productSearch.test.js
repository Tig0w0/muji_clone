import { formatProductContext, searchProducts } from './productSearch';

const products = [
  { product_id: 1, product_name: '남성 검정 셔츠', sell_price: 39900, sale_state: 'ON', total_stock: 3, options: { color: ['검정'] } },
  { product_id: 2, product_name: '남성 베이지 셔츠', sell_price: 59900, sale_state: 'ON', total_stock: 2, options: { color: ['베이지'] } },
  { product_id: 3, product_name: '여성 검정 팬츠', sell_price: 29900, sale_state: 'ON', total_stock: 5, options: { color: ['검정'] } },
  { product_id: 4, product_name: '남성 검정 셔츠 품절', sell_price: 29900, sale_state: 'ON', total_stock: 0, options: { color: ['검정'] } },
];

test('matches keywords and price constraints', () => {
  const result = searchProducts(products, '5만원 이하 남성 검정 셔츠');
  expect(result.map(item => item.product_id)).toEqual([1]);
});

test('passes only minimal grounded facts to the model', () => {
  expect(formatProductContext([products[0]])).toEqual([
    { name: '남성 검정 셔츠', price: 39900 },
  ]);
});