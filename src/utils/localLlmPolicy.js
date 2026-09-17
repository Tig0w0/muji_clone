export const shouldUseLocalLlm = query => /추천|비교|어울|선물|좋은|편한|어떤|왜|고민/.test(String(query || ''));

export const buildInstantAnswer = products => {
  const first = products[0];
  if (!first) return '조건에 맞는 상품을 찾지 못했습니다.';
  const price = Number(first.sell_price ?? first.retail_price ?? 0).toLocaleString('ko-KR');
  return `${first.product_name} — ${price}원 상품을 찾았습니다.`;
};

const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const cleanModelReason = (text, products = []) => {
  let value = String(text || '').replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\/?think>/gi, '').trim();
  products.forEach(product => {
    const name = product?.name || product?.product_name;
    const price = Number(product?.price ?? product?.sell_price ?? product?.retail_price ?? 0);
    if (name) value = value.replace(new RegExp(escapeRegex(name), 'gi'), '');
    if (price) {
      [`${price.toLocaleString('ko-KR')}원`, `${price}원`, price.toLocaleString('ko-KR'), String(price)]
        .forEach(item => { value = value.replace(new RegExp(escapeRegex(item), 'g'), ''); });
    }
  });
  return value.replace(/^[\s,.:;\-—]+|[\s,.:;\-—]+$/g, '').replace(/\s{2,}/g, ' ').trim();
};
