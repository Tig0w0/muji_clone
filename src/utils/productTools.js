import {
  extractDeterministicIntent,
  mergeShoppingIntent,
  searchProducts,
  searchProductsByIntent,
} from './productSearch';

const clampLimit = value => Math.max(1, Math.min(8, Number(value) || 6));
const getPrice = product => Number(product?.sell_price ?? product?.retail_price ?? 0);

export const getCatalogCategoryNames = mainCategoryProducts =>
  [...new Set(Object.values(mainCategoryProducts || {}).map(category => category?.name).filter(Boolean))];

export const normalizeProductToolCall = (call, query, previousIntent = {}) => {
  const raw = call && typeof call === 'object' ? call : {};
  const tool = ['search_products', 'list_categories', 'get_product', 'compare_products'].includes(raw.tool)
    ? raw.tool
    : 'search_products';
  const args = raw.arguments && typeof raw.arguments === 'object' ? raw.arguments : {};

  if (tool !== 'search_products') return { tool, arguments: args };

  const deterministic = extractDeterministicIntent(query);
  const parsed = {
    gender: args.gender || '',
    category: args.category || '',
    min_price: args.min_price ?? null,
    max_price: args.max_price ?? null,
    colors: Array.isArray(args.colors) ? args.colors : [],
    keywords: Array.isArray(args.keywords) ? args.keywords : [],
    purpose: args.purpose || '',
    style: args.style || '',
  };
  const merged = mergeShoppingIntent(previousIntent, parsed, deterministic, query);

  return {
    tool: 'search_products',
    arguments: {
      ...merged,
      query: String(args.query || query || '').trim(),
      limit: clampLimit(args.limit),
    },
  };
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
  let products = searchProductsByIntent(catalogProducts, nextIntent, clampLimit(args.limit));
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
