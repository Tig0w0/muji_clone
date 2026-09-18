const STOP_WORDS = new Set([
  '상품', '제품', '추천', '추천해줘', '찾아줘', '보여줘', '알려줘', '있어', '있는',
  '하고', '이랑', '에서', '으로', '정도', '만원', '원', '이하', '이상', '미만', '보다',
]);

const normalize = value => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
const getPrice = product => Number(product.sell_price ?? product.retail_price ?? 0);
const isAvailable = product => product.sale_state === 'ON' && Number(product.total_stock) > 0;

const normalizeCatalogText = value => normalize(value)
  .replace(/남성용|남자|맨즈/g, '남성')
  .replace(/여성용|여자|우먼/g, '여성')
  .replace(/잠옷/g, '파자마')
  .replace(/t\s*셔츠|티\s+셔츠/g, '티셔츠');

const canonicalGender = value => {
  const normalized = normalizeCatalogText(value);
  if (/남성/.test(normalized)) return '남성';
  if (/여성/.test(normalized)) return '여성';
  if (/아동|키즈|어린이/.test(normalized)) return '아동';
  return '';
};

const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const stringList = value => (Array.isArray(value) ? value : value ? [value] : [])
  .map(item => normalizeCatalogText(item))
  .filter(Boolean);

const extractPriceRange = query => {
  const normalized = normalize(query);
  const band = normalized.match(/(\d+(?:\.\d+)?)\s*만원대/);
  if (band) {
    const min = Number(band[1]) * 10000;
    return { minPrice: min, maxPrice: min + 9999 };
  }

  const manwon = normalized.match(/(\d+(?:\.\d+)?)\s*만원\s*(이하|미만|이상)?/);
  if (manwon) {
    const value = Number(manwon[1]) * 10000;
    if (manwon[2] === '이상') return { minPrice: value, maxPrice: null };
    return { minPrice: null, maxPrice: value };
  }

  const won = normalized.match(/([\d,]+)\s*원\s*(이하|미만|이상)?/);
  if (won) {
    const value = Number(won[1].replace(/,/g, ''));
    if (won[2] === '이상') return { minPrice: value, maxPrice: null };
    return { minPrice: null, maxPrice: value };
  }
  return { minPrice: null, maxPrice: null };
};

const tokenize = query => normalizeCatalogText(query)
  .replace(/\d+(?:\.\d+)?\s*만원대/g, ' ')
  .replace(/\d+(?:\.\d+)?\s*만원\s*(?:이하|미만|이상)?/g, ' ')
  .replace(/[\d,]+\s*원\s*(?:이하|미만|이상)?/g, ' ')
  .replace(/[^0-9a-zA-Z가-힣\s]/g, ' ')
  .split(/\s+/)
  .filter(token => token.length > 1 && !STOP_WORDS.has(token) && !/^\d+$/.test(token));

const searchableText = product => normalizeCatalogText([
  product.product_name, product.name_ko, product.name_en, product.code,
  ...(product.categories || []), ...(product.options?.color || []), ...(product.options?.size || []),
].flat().join(' '));

export const searchProductsByIntent = (products, intent = {}, limit = 6) => {
  const gender = canonicalGender(intent.gender);
  const category = normalizeCatalogText(intent.category || '');
  const colors = stringList(intent.colors);
  const keywords = stringList(intent.keywords);
  const minPrice = numberOrNull(intent.min_price ?? intent.minPrice);
  const maxPrice = numberOrNull(intent.max_price ?? intent.maxPrice);

  return products
    .filter(isAvailable)
    .map(product => {
      const text = searchableText(product);
      const price = getPrice(product);
      if (gender && !text.includes(gender)) return null;
      if (category && !text.includes(category)) return null;
      if (colors.length && !colors.some(color => text.includes(color))) return null;
      if (minPrice !== null && price < minPrice) return null;
      if (maxPrice !== null && price > maxPrice) return null;

      const keywordMatches = keywords.filter(keyword => text.includes(keyword)).length;
      let score = 1 + keywordMatches * 2;
      if (gender) score += 3;
      if (category) score += 6;
      if (colors.length) score += 2;
      if (minPrice !== null || maxPrice !== null) score += 2;
      return { product, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || getPrice(a.product) - getPrice(b.product))
    .slice(0, limit)
    .map(({ product }) => product);
};

export const searchProducts = (products, query, limit = 6) => {
  const tokens = tokenize(query);
  const { minPrice, maxPrice } = extractPriceRange(query);
  const minMatches = tokens.length > 1 ? 2 : 1;

  return products
    .filter(isAvailable)
    .map(product => {
      const text = searchableText(product);
      const matched = tokens.filter(token => text.includes(token));
      let score = matched.length * 3;
      if (tokens.length && matched.length === tokens.length) score += 4;
      if (minPrice !== null || maxPrice !== null) score += 2;
      return { product, score, matched: matched.length };
    })
    .filter(({ product, score, matched }) => score > 0
      && (tokens.length === 0 || matched >= minMatches)
      && (minPrice === null || getPrice(product) >= minPrice)
      && (maxPrice === null || getPrice(product) <= maxPrice))
    .sort((a, b) => b.score - a.score || getPrice(a.product) - getPrice(b.product))
    .slice(0, limit)
    .map(({ product }) => product);
};

export const formatProductContext = products => products.slice(0, 3).map(product => ({
  name: product.product_name,
  price: getPrice(product),
}));