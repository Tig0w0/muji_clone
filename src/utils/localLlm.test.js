import { buildInstantAnswer, cleanModelReason, shouldUseLocalLlm } from './localLlmPolicy';

const product = {
  product_name: '남성 사이드 심리스 이중가제 긴소매 파자마',
  sell_price: 59900,
};

test('uses the local model only for recommendation-style questions', () => {
  expect(shouldUseLocalLlm('남성 파자마 추천해줘')).toBe(true);
  expect(shouldUseLocalLlm('5만원 이하 남성 셔츠 찾아줘')).toBe(false);
});

test('builds an immediate grounded answer without model inference', () => {
  expect(buildInstantAnswer([product])).toBe('남성 사이드 심리스 이중가제 긴소매 파자마 — 59,900원 상품을 찾았습니다.');
});

test('removes repeated product names and prices from model reasons', () => {
  const reason = cleanModelReason(
    '남성 사이드 심리스 이중가제 긴소매 파자마, 59,900원 편안한 잠옷으로 추천합니다.',
    [{ name: product.product_name, price: product.sell_price }],
  );
  expect(reason).toBe('편안한 잠옷으로 추천합니다');
});

test('explains WebGPU adapter failures without blaming the network', async () => {
  const { describeLocalLlmError } = await import('./localLlmPolicy');
  expect(describeLocalLlmError({ code: 'WEBGPU_ADAPTER_UNAVAILABLE' }))
    .toContain('WebGPU 어댑터');
});

test('keeps product search available after GPU memory failures', async () => {
  const { describeLocalLlmError } = await import('./localLlmPolicy');
  expect(describeLocalLlmError({ code: 'GPU_MEMORY_OR_DEVICE_LOST' }))
    .toContain('상품 검색은 계속 사용할 수 있습니다');
});
