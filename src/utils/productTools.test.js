import {
  buildToolFallbackAnswer,
  executeProductTool,
  fallbackProductToolCall,
  getCatalogCategoryNames,
  normalizeProductToolCall,
  routeAssistantQuery,
} from './productTools';

const products = [
  {
    product_id: 1,
    product_name: '남성 저지 티셔츠',
    sell_price: 19900,
    sale_state: 'ON',
    total_stock: 5,
    categories: ['남성'],
    options: { color: ['흰색'], size: ['M'] },
  },
  {
    product_id: 2,
    product_name: '과자 슈가 버터 비스킷',
    sell_price: 2500,
    sale_state: 'ON',
    total_stock: 8,
    categories: ['스낵'],
    options: { color: [], size: [] },
  },
];

const categories = {
  A: { name: '남성', products: [products[0]] },
  N: { name: '스낵', products: [products[1]] },
};

const getProductById = id => products.find(product => Number(product.product_id) === Number(id)) || null;

test('lists live catalog categories', () => {
  expect(getCatalogCategoryNames(categories)).toEqual(['남성', '스낵']);
});

test('normalizes an AI search tool call with deterministic user constraints', () => {
  const call = normalizeProductToolCall({
    tool: 'search_products',
    arguments: { query: '과자 추천해줘', limit: 20 },
  }, '과자 추천해줘', { gender: '남성', category: '셔츠', purpose: '선물' });

  expect(call.tool).toBe('search_products');
  expect(call.arguments.category).toBe('스낵');
  expect(call.arguments.gender).toBe('');
  expect(call.arguments.limit).toBe(8);
});

test('executes search_products against the actual catalog array', () => {
  const result = executeProductTool({
    toolCall: { tool: 'search_products', arguments: { query: '과자 추천해줘' } },
    query: '과자 추천해줘',
    previousIntent: {},
    catalogProducts: products,
    mainCategoryProducts: categories,
    getProductById,
  });

  expect(result.products.map(product => product.product_id)).toEqual([2]);
  expect(result.result.products[0]).toMatchObject({
    id: 2,
    name: '과자 슈가 버터 비스킷',
    price: 2500,
  });
});

test('executes get_product without exposing the whole catalog', () => {
  const result = executeProductTool({
    toolCall: { tool: 'get_product', arguments: { product_id: 1 } },
    query: '1번 상품 알려줘',
    previousIntent: {},
    catalogProducts: products,
    mainCategoryProducts: categories,
    getProductById,
  });

  expect(result.products).toHaveLength(1);
  expect(result.result.product.id).toBe(1);
});

test('provides a deterministic fallback tool call when the small model fails', () => {
  const call = fallbackProductToolCall('남자 티셔츠 찾아줘', {});
  expect(call).toMatchObject({
    tool: 'search_products',
    arguments: {
      gender: '남성',
      category: '티셔츠',
    },
  });
});


test('routes greetings without invoking product tools', () => {
  expect(routeAssistantQuery('안녕', {})).toMatchObject({ mode: 'chat' });
});

test('routes broad food requests to live food categories', () => {
  const route = routeAssistantQuery('뭐 맛있는거 없을까', {});
  expect(route.mode).toBe('tool');
  expect(route.toolCall).toMatchObject({
    tool: 'search_products',
    arguments: {
      category_any: ['스낵', '간편조리'],
    },
  });
});

test('rejects hallucinated tools by normalizing them to search_products', () => {
  const call = normalizeProductToolCall({
    tool: 'search_images',
    arguments: { query: '과자' },
  }, '과자', {});
  expect(call.tool).toBe('search_products');
  expect(call.arguments.category).toBe('스낵');
});

test('builds a safe fallback sentence without exposing tool JSON', () => {
  const text = buildToolFallbackAnswer({ products: [products[1], products[0]], result: {} });
  expect(text).toContain('후보');
  expect(text).not.toContain('{');
});
