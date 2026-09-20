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
  {
    product_id: 3,
    product_name: '부드러운 브라 캐미솔',
    sell_price: 24900,
    sale_state: 'ON',
    total_stock: 6,
    categories: ['여성'],
    options: { color: ['흰색'], size: ['M'] },
  },
  {
    product_id: 4,
    product_name: '슬러브 치노 와이드 팬츠',
    sell_price: 49900,
    sale_state: 'ON',
    total_stock: 7,
    categories: ['여성'],
    options: { color: ['차콜'], size: ['M'] },
  },
];

const categories = {
  A: { name: '남성', products: [products[0]] },
  B: { name: '여성', products: [products[2], products[3]] },
  N: { name: '스낵', products: [products[1]] },
};

const getProductById = id => products.find(product => Number(product.product_id) === Number(id)) || null;

test('lists live catalog categories', () => {
  expect(getCatalogCategoryNames(categories)).toEqual(['남성', '여성', '스낵']);
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


test('routes bathroom requests across 생활용품 and 뷰티 without stale clothing context', () => {
  const route = routeAssistantQuery('욕실용품 추천해줘', {
    gender: '남성',
    category: '셔츠',
    purpose: '선물',
  });

  expect(route.mode).toBe('tool');
  expect(route.toolCall).toMatchObject({
    tool: 'search_products',
    arguments: {
      gender: '',
      category: '',
      purpose: '',
      category_any: ['생활용품', '뷰티'],
    },
  });
});


test('routes 여성 속옷 to the underwear virtual group while keeping gender', () => {
  const route = routeAssistantQuery('여성 속옷 추천해줘', {});
  expect(route.mode).toBe('tool');
  expect(route.toolCall).toMatchObject({
    tool: 'search_products',
    arguments: {
      gender: '여성',
      keyword_any: expect.arrayContaining(['브라', '캐미솔', '팬티']),
    },
  });

  const result = executeProductTool({
    toolCall: route.toolCall,
    query: '여성 속옷 추천해줘',
    previousIntent: {},
    catalogProducts: products,
    mainCategoryProducts: categories,
    getProductById,
  });

  expect(result.products.map(product => product.product_id)).toEqual([3]);
});

test('virtual group filtering does not fall back to unrelated products', () => {
  const route = routeAssistantQuery('여성 양말 추천해줘', {});
  const result = executeProductTool({
    toolCall: route.toolCall,
    query: '여성 양말 추천해줘',
    previousIntent: {},
    catalogProducts: products,
    mainCategoryProducts: categories,
    getProductById,
  });
  expect(result.products).toEqual([]);
});


test('keeps inferred female context when refining previous results to underwear', () => {
  const previousProducts = [products[2], products[3]];
  const route = routeAssistantQuery('속옷 종류로', {}, previousProducts);

  expect(route.mode).toBe('tool');
  expect(route.toolCall).toMatchObject({
    tool: 'search_products',
    arguments: {
      gender: '여성',
      keyword_any: expect.arrayContaining(['브라', '캐미솔']),
    },
  });

  const result = executeProductTool({
    toolCall: route.toolCall,
    query: '속옷 종류로',
    previousIntent: {},
    catalogProducts: products,
    mainCategoryProducts: categories,
    getProductById,
  });

  expect(result.products.map(product => product.product_id)).toEqual([3]);
});

test('resolves first-product follow-up against the previous cards', () => {
  const route = routeAssistantQuery('첫 번째 상품 자세히 알려줘', {}, [products[2], products[3]]);
  expect(route).toMatchObject({
    mode: 'tool',
    toolCall: {
      tool: 'get_product',
      arguments: { product_id: 3 },
    },
  });
});

test('resolves comparison follow-up against previous card positions', () => {
  const route = routeAssistantQuery('1번이랑 2번 비교해줘', {}, [products[2], products[3]]);
  expect(route).toMatchObject({
    mode: 'tool',
    toolCall: {
      tool: 'compare_products',
      arguments: { product_ids: [3, 4] },
    },
  });
});

test('uses the cheapest previous card as the ceiling for a cheaper follow-up', () => {
  const route = routeAssistantQuery('좀 더 싼 걸로 보여줘', { gender: '여성' }, [products[2], products[3]]);
  expect(route.mode).toBe('tool');
  expect(route.toolCall.tool).toBe('search_products');
  expect(route.toolCall.arguments.max_price).toBe(24899);
  expect(route.toolCall.arguments.exclude_ids).toEqual([3, 4]);
});

test('excludes previous cards when asking for different options', () => {
  const route = routeAssistantQuery('다른 걸로 보여줘', { gender: '여성' }, [products[2], products[3]]);
  expect(route.mode).toBe('tool');
  expect(route.toolCall.arguments.exclude_ids).toEqual([3, 4]);
});
