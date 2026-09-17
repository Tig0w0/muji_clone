const STOP_WORDS = new Set([
  '상품', '제품', '추천', '추천해줘', '찾아줘', '보여줘', '알려줘', '있어', '있는',
  '하고', '이랑', '에서', '으로', '정도', '만원', '원', '이하', '이상', '보다',
]);

const normalize = value => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
const getPrice = product => Number(product.sell_price ?? product.retail_price ?? 0);
const isAvailable = product => product.sale_state === 'ON' && Number(product.total_stock) > 0;

const extractMaxPrice = query => {
  const manwon = query.match(/(\d+(?:\.\d+)?)\s*만원\s*(?:이하|미만)?/);
  if (manwon) return Number(manwon[1]) * 10000;
  const won = query.match(/([\d,]+)\s*원\s*(?:이하|미만)?/);
  return won ? Number(won[1].replace(/,/g, '')) : null;
};

const tokenize = query => normalize(query)
  .replace(/[^0-9a-zA-Z가-힣\s]/g, ' ')
  .split(/\s+/)
  .filter(token => token.length > 1 && !STOP_WORDS.has(token) && !/^\d+$/.test(token) && !/^\d+(?:\.\d+)?만원$/.test(token));

const searchableText = product => normalize([
  product.product_name, product.name_ko, product.name_en, product.code,
  ...(product.categories || []), ...(product.options?.color || []), ...(product.options?.size || []),
].flat().join(' '));export const searchProducts = (products, query, limit = 6) => {
  const tokens = tokenize(query);
  const maxPrice = extractMaxPrice(query);
  const minMatches = tokens.length > 1 ? 2 : 1;

  return products
    .filter(isAvailable)
    .map(product => {
      const text = searchableText(product);
      const matched = tokens.filter(token => text.includes(token));
      let score = matched.length * 3;
      if (tokens.length && matched.length === tokens.length) score += 4;
      if (maxPrice !== null && getPrice(product) <= maxPrice) score += 3;
      return { product, score, matched: matched.length };
    })
    .filter(({ product, score, matched }) => score > 0
      && matched >= minMatches
      && (maxPrice === null || getPrice(product) <= maxPrice))
    .sort((a, b) => b.score - a.score || getPrice(a.product) - getPrice(b.product))
    .slice(0, limit)
    .map(({ product }) => product);
};

export const formatProductContext = products => products.slice(0, 2).map(product => ({
  name: product.product_name,
  price: getPrice(product),
}));