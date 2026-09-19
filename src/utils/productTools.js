import {
  extractDeterministicIntent,
  mergeShoppingIntent,
  searchProducts,
  searchProductsByIntent,
} from './productSearch';

const clampLimit = value => Math.max(1, Math.min(8, Number(value) || 6));
const ALLOWED_TOOLS = new Set(['search_products', 'list_categories', 'get_product', 'compare_products']);
const GREETING_PATTERN = /^(안녕(?:하세요)?|반가워|ㅎㅇ|하이|hello|hi)[!?.~\s]*$/i;
const FOOD_BROAD_PATTERN = /맛있|먹을\s*(?:거|것)|먹거리|뭐\s*먹|간식|과자|스낵|디저트/i;
const BATHROOM_PATTERN = /욕실|욕실용품|목욕|세면|샤워|배스|bath/i;
const getPrice = product => Number(product?.sell_price ?? product?.retail_price ?? 0);

export const getCatalogCategoryNames = mainCategoryProducts =>
  [...new Set(Object.values(mainCategoryProducts || {}).map(category => category?.name).filter(Boolean))];

export const normalizeProductToolCall = (call, query, previousIntent = {}) => {
  const raw = call && typeof call === 'object' ? call : {};
  const tool = ALLOWED_TOOLS.has(raw.tool) ? raw.tool : 'search_products';
  const args = raw.arguments && typeof raw.arguments === 'object' ? raw.arguments : {};

  if (tool !== 'search_products') return { tool, arguments: args };

  const deterministic = extractDeterministicIntent(query);
  const parsed = {
    gender: args.gender || '',
    category: args.category || '',
    category_any: Array.isArray(args.category_any) ? args.category_any : [],
    min_price: args.min_price ?? null,
    max_price: args.max_price ?? null,
    colors: Array.isArray(args.colors) ? args.colors : [],
    keywords: Array.isArray(args.keywords) ? args.keywords : [],
    purpose: args.purpose || '',
    style: args.style || '',
  };
  const merged = mergeShoppingIntent(previousIntent, parsed, deterministic, query);

  const categoryAny = Array.isArray(args.category_any) ? args.category_any.filter(Boolean) : [];
  return {
    tool: 'search_products',
    arguments: {
      ...merged,
      category_any: categoryAny,
      query: String(args.query || query || '').trim(),
      limit: clampLimit(args.limit),
    },
  };
};

export const routeAssistantQuery = (query, previousIntent = {}) => {
  const text = String(query || '').trim();

  if (GREETING_PATTERN.test(text)) {
    return {
      mode: 'chat',
      text: '안녕하세요. 찾는 상품이나 용도, 예산을 말씀해주시면 현재 상품 목록에서 같이 찾아볼게요.',
    };
  }

  const deterministic = extractDeterministicIntent(text);
  const hasExplicitShoppingSignal = Boolean(
    deterministic.gender
    || deterministic.category
    || deterministic.min_price !== null
    || deterministic.max_price !== null
    || /추천|찾아|보여|비교|상품|제품|선물|사고|구매|입을|쓸|필요/.test(text)
    || FOOD_BROAD_PATTERN.test(text)
  );

  if (!hasExplicitShoppingSignal) {
    return {
      mode: 'chat',
      text: '상품 상담을 도와드릴 수 있어요. 찾는 종류나 용도, 예산을 편하게 말씀해주세요.',
    };
  }

  if (FOOD_BROAD_PATTERN.test(text) && !deterministic.category) {
    return {
      mode: 'tool',
      toolCall: {
        tool: 'search_products',
        arguments: {
          ...mergeShoppingIntent(previousIntent, {}, deterministic, text),
          category_any: ['스낵', '간편조리'],
          query: text,
          limit: 6,
        },
      },
    };
  }

  if (BATHROOM_PATTERN.test(text)) {
    const cleanIntent = mergeShoppingIntent({}, {}, deterministic, text);
    return {
      mode: 'tool',
      toolCall: {
        tool: 'search_products',
        arguments: {
          ...cleanIntent,
          gender: '',
          category: '',
          purpose: '',
          category_any: ['생활용품', '뷰티'],
          query: text,
          limit: 6,
        },
      },
    };
  }

  return { mode: 'tool', toolCall: null };
};

export const buildToolFallbackAnswer = ({ products = [], result = {} } = {}) => {
  if (Array.isArray(result.categories) && result.categories.length) {
    return `현재 카테고리는 ${result.categories.slice(0, 8).join(', ')} 등이 있어요. 어느 쪽을 보고 싶으신가요?`;
  }
  if (!products.length) {
    return '현재 상품 목록에서는 조건에 맞는 상품을 찾지 못했어요. 예산이나 종류를 조금 바꿔볼까요?';
  }
  if (products.length === 1) {
    return '현재 상품 목록에서 조건에 맞는 상품을 하나 찾았어요. 비슷한 상품도 같이 볼까요?';
  }
  return `현재 상품 목록에서 조건에 맞는 후보 ${Math.min(products.length, 3)}개를 골랐어요. 가격이나 스타일 기준으로 더 좁혀볼까요?`;
};

const minimalProduct = product => ({
  id: Number(product.product_id),
  name: product.product_name,
  price: getPrice(product),
  categories: product.categories || [],
  colors: product.options?.color || [],
  sizes: product.options?.size || [],
  stock: Number(product.total_stock || 0),
  sale_state: product.sale_state,
});

export const executeProductTool = ({
  toolCall,
  query,
  previousIntent = {},
  catalogProducts,
  mainCategoryProducts,
  getProductById,
}) => {
  const call = normalizeProductToolCall(toolCall, query, previousIntent);
  const args = call.arguments || {};

  if (call.tool === 'list_categories') {
    const categories = getCatalogCategoryNames(mainCategoryProducts);
    return {
      toolCall: call,
      products: [],
      result: { categories },
      nextIntent: previousIntent,
    };
  }

  if (call.tool === 'get_product') {
    const product = getProductById?.(args.product_id);
    return {
      toolCall: call,
      products: product ? [product] : [],
      result: { product: product ? minimalProduct(product) : null },
      nextIntent: previousIntent,
    };
  }

  if (call.tool === 'compare_products') {
    const ids = Array.isArray(args.product_ids) ? args.product_ids.slice(0, 4) : [];
    const products = ids.map(id => getProductById?.(id)).filter(Boolean);
    return {
      toolCall: call,
      products,
      result: { products: products.map(minimalProduct) },
      nextIntent: previousIntent,
    };
  }

  const nextIntent = args;
  const categoryAny = Array.isArray(args.category_any) ? args.category_any.filter(Boolean) : [];
  let products = categoryAny.length
    ? categoryAny
        .flatMap(category => searchProductsByIntent(catalogProducts, { ...nextIntent, category }, clampLimit(args.limit)))
        .filter((product, index, array) => array.findIndex(item => Number(item.product_id) === Number(product.product_id)) === index)
        .slice(0, clampLimit(args.limit))
    : searchProductsByIntent(catalogProducts, nextIntent, clampLimit(args.limit));
  if (!products.length && args.query) {
    products = searchProducts(catalogProducts, args.query, clampLimit(args.limit));
  }

  return {
    toolCall: call,
    products,
    result: {
      count: products.length,
      products: products.map(minimalProduct),
    },
    nextIntent,
  };
};

export const fallbackProductToolCall = (query, previousIntent = {}) => ({
  tool: 'search_products',
  arguments: {
    ...mergeShoppingIntent(previousIntent, {}, extractDeterministicIntent(query), query),
    query,
    limit: 6,
  },
});
