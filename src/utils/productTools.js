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
const VIRTUAL_PRODUCT_GROUPS = [
  {
    id: 'underwear',
    pattern: /속옷|이너웨어|언더웨어|브라|캐미솔|브리프|쇼츠|팬티/i,
    keyword_any: ['속옷', '이너웨어', '언더웨어', '브라', '캐미솔', '브리프', '쇼츠', '팬티'],
  },
  {
    id: 'socks',
    pattern: /양말|삭스|socks?/i,
    keyword_any: ['양말', '삭스'],
  },
  {
    id: 'shoes',
    pattern: /신발|슈즈|운동화|스니커즈|슬리퍼|샌들|구두/i,
    keyword_any: ['신발', '슈즈', '운동화', '스니커즈', '슬리퍼', '샌들', '구두'],
  },
  {
    id: 'hats',
    pattern: /모자|캡|버킷햇|비니/i,
    keyword_any: ['모자', '캡', '버킷햇', '비니'],
  },
  {
    id: 'bedding',
    pattern: /침구|이불|베개|베갯잇|패드|시트|매트리스/i,
    category_any: ['패브릭', '생활용품'],
    keyword_any: ['침구', '이불', '베개', '베갯잇', '패드', '시트', '매트리스'],
  },
  {
    id: 'storage',
    pattern: /수납|정리함|수납함|박스|바구니|바스켓|케이스/i,
    category_any: ['수납/정리', '생활용품'],
    keyword_any: ['수납', '정리함', '수납함', '박스', '바구니', '바스켓', '케이스'],
  },
  {
    id: 'cleaning',
    pattern: /청소|클리너|브러시|걸레|먼지|빗자루|스퀴지/i,
    category_any: ['생활용품'],
    keyword_any: ['청소', '클리너', '브러시', '걸레', '먼지', '빗자루', '스퀴지'],
  },
];

const getVirtualProductGroup = query =>
  VIRTUAL_PRODUCT_GROUPS.find(group => group.pattern.test(String(query || ''))) || null;

const getPrice = product => Number(product?.sell_price ?? product?.retail_price ?? 0);
const FOLLOWUP_PATTERN = /그중|그거|그걸|이거|저거|첫\s*번째|두\s*번째|세\s*번째|[123]번|다른\s*(?:거|것|걸|상품)|더\s*(?:싼|저렴|비싼)|좀\s*더/i;

const productId = product => Number(product?.product_id ?? product?.id);
const productCategories = product => Array.isArray(product?.categories) ? product.categories : [];

const inferSharedGender = products => {
  if (!products.length) return '';
  return ['여성', '남성', '아동'].find(gender =>
    products.every(product =>
      productCategories(product).includes(gender)
      || String(product?.product_name || product?.name || '').includes(gender)
    )
  ) || '';
};

const enrichIntentFromSession = (intent = {}, products = []) => {
  if (intent.gender) return intent;
  const inferredGender = inferSharedGender(products);
  return inferredGender ? { ...intent, gender: inferredGender } : intent;
};

const ordinalIndex = text => {
  if (/(?:첫\s*번째|1번|첫\s*상품|맨\s*처음)/.test(text)) return 0;
  if (/(?:두\s*번째|2번|둘째)/.test(text)) return 1;
  if (/(?:세\s*번째|3번|셋째)/.test(text)) return 2;
  return -1;
};

const referencedIndexes = text => {
  const indexes = [];
  if (/(?:첫\s*번째|1번|첫\s*상품)/.test(text)) indexes.push(0);
  if (/(?:두\s*번째|2번|둘째)/.test(text)) indexes.push(1);
  if (/(?:세\s*번째|3번|셋째)/.test(text)) indexes.push(2);
  return [...new Set(indexes)];
};

export const summarizeProductsForContext = products => (products || []).slice(0, 3).map((product, index) => ({
  position: index + 1,
  id: productId(product),
  name: product.product_name || product.name || '',
  price: getPrice(product),
  categories: productCategories(product),
}));

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
    keyword_any: Array.isArray(args.keyword_any) ? args.keyword_any : [],
    exclude_ids: Array.isArray(args.exclude_ids) ? args.exclude_ids.map(Number).filter(Boolean) : [],
    min_price: args.min_price ?? null,
    max_price: args.max_price ?? null,
    colors: Array.isArray(args.colors) ? args.colors : [],
    keywords: Array.isArray(args.keywords) ? args.keywords : [],
    purpose: args.purpose || '',
    style: args.style || '',
  };
  const merged = mergeShoppingIntent(previousIntent, parsed, deterministic, query);

  const categoryAny = Array.isArray(args.category_any) ? args.category_any.filter(Boolean) : [];
  const keywordAny = Array.isArray(args.keyword_any) ? args.keyword_any.filter(Boolean) : [];
  const excludeIds = Array.isArray(args.exclude_ids) ? args.exclude_ids.map(Number).filter(Boolean) : [];
  return {
    tool: 'search_products',
    arguments: {
      ...merged,
      category_any: categoryAny,
      keyword_any: keywordAny,
      exclude_ids: excludeIds,
      query: String(args.query || query || '').trim(),
      limit: clampLimit(args.limit),
    },
  };
};

export const routeAssistantQuery = (query, previousIntent = {}, previousProducts = []) => {
  const text = String(query || '').trim();
  const sessionIntent = enrichIntentFromSession(previousIntent, previousProducts);
  const previousSummary = summarizeProductsForContext(previousProducts);

  if (GREETING_PATTERN.test(text)) {
    return {
      mode: 'chat',
      text: '안녕하세요. 찾는 상품이나 용도, 예산을 말씀해주시면 현재 상품 목록에서 같이 찾아볼게요.',
    };
  }

  const deterministic = extractDeterministicIntent(text);
  const virtualGroup = getVirtualProductGroup(text);

  if (previousSummary.length && /비교/.test(text)) {
    const indexes = referencedIndexes(text);
    const selected = (indexes.length >= 2 ? indexes : [0, 1])
      .map(index => previousSummary[index]?.id)
      .filter(Boolean);
    if (selected.length >= 2) {
      return {
        mode: 'tool',
        toolCall: { tool: 'compare_products', arguments: { product_ids: selected } },
      };
    }
  }

  if (previousSummary.length && /(자세히|상세|정보|어때|알려)/.test(text)) {
    const index = ordinalIndex(text);
    if (index >= 0 && previousSummary[index]?.id) {
      return {
        mode: 'tool',
        toolCall: { tool: 'get_product', arguments: { product_id: previousSummary[index].id } },
      };
    }
  }

  if (previousSummary.length && /(더\s*(?:싼|저렴)|가격\s*(?:낮|내려)|좀\s*더\s*저렴)/.test(text)) {
    const prices = previousSummary.map(product => product.price).filter(price => price > 0);
    const maxPrice = prices.length ? Math.max(0, Math.min(...prices) - 1) : sessionIntent.max_price;
    return {
      mode: 'tool',
      toolCall: {
        tool: 'search_products',
        arguments: {
          ...sessionIntent,
          max_price: maxPrice ?? null,
          exclude_ids: previousSummary.map(product => product.id),
          query: text,
          limit: 6,
        },
      },
    };
  }

  if (previousSummary.length && /다른\s*(?:거|것|걸|상품)|다른\s*걸로/.test(text)) {
    return {
      mode: 'tool',
      toolCall: {
        tool: 'search_products',
        arguments: {
          ...sessionIntent,
          exclude_ids: previousSummary.map(product => product.id),
          query: text,
          limit: 6,
        },
      },
    };
  }
  const hasExplicitShoppingSignal = Boolean(
    deterministic.gender
    || deterministic.category
    || virtualGroup
    || deterministic.min_price !== null
    || deterministic.max_price !== null
    || /추천|찾아|보여|비교|상품|제품|선물|사고|구매|입을|쓸|필요/.test(text)
    || (previousSummary.length && FOLLOWUP_PATTERN.test(text))
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
          ...mergeShoppingIntent(sessionIntent, {}, deterministic, text),
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

  if (virtualGroup) {
    // A virtual group is usually a refinement (e.g. "속옷 종류로"). Keep useful
    // constraints such as gender/budget, but replace stale category/keyword filters.
    const cleanIntent = mergeShoppingIntent(sessionIntent, {}, deterministic, text);
    return {
      mode: 'tool',
      toolCall: {
        tool: 'search_products',
        arguments: {
          ...cleanIntent,
          category: '',
          keywords: [],
          purpose: deterministic.purpose || cleanIntent.purpose || '',
          category_any: virtualGroup.category_any || [],
          keyword_any: virtualGroup.keyword_any || [],
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
  const keywordAny = Array.isArray(args.keyword_any) ? args.keyword_any.filter(Boolean) : [];
  const excludeIds = new Set((args.exclude_ids || []).map(Number).filter(Boolean));
  let products = categoryAny.length
    ? categoryAny
        .flatMap(category => searchProductsByIntent(
          catalogProducts,
          { ...nextIntent, category, keyword_any: keywordAny },
          clampLimit(args.limit),
        ))
        .filter((product, index, array) => array.findIndex(item => Number(item.product_id) === Number(product.product_id)) === index)
        .slice(0, clampLimit(args.limit))
    : searchProductsByIntent(catalogProducts, { ...nextIntent, keyword_any: keywordAny }, clampLimit(args.limit));
  if (excludeIds.size) {
    products = products.filter(product => !excludeIds.has(Number(product.product_id)));
  }
  if (!products.length && args.query && !keywordAny.length && !excludeIds.size) {
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
