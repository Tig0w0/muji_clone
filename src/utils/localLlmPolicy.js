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

export const describeLocalLlmError = error => {
  const code = error?.code || 'LOCAL_LLM_ERROR';
  const message = String(error?.message || '');
  if (code === 'WEBGPU_UNSUPPORTED') return '이 브라우저에서는 WebGPU 로컬 AI를 사용할 수 없습니다. 상품 검색은 계속 사용할 수 있습니다.';
  if (code === 'WEBGPU_ADAPTER_UNAVAILABLE') return '사용 가능한 WebGPU 어댑터를 찾지 못했습니다. 상품 검색은 계속 사용할 수 있습니다.';
  if (code === 'WEBGPU_COMPATIBILITY_ONLY') return '이 기기는 WebGPU 호환 모드만 사용할 수 있어 현재 AI 모델을 실행할 수 없습니다. 상품 검색은 계속 사용할 수 있습니다.';
  if (code === 'MODEL_DOWNLOAD_FAILED') return 'AI 모델 파일을 다운로드하지 못했습니다. 네트워크를 확인해주세요. 상품 검색은 계속 사용할 수 있습니다.';
  if (code === 'GPU_MEMORY_OR_DEVICE_LOST') return '기기 메모리 또는 GPU 리소스가 부족해 로컬 AI를 시작하지 못했습니다. 상품 검색은 계속 사용할 수 있습니다.';
  if (code === 'WEBGPU_RUNTIME_ERROR') return '이 기기의 WebGPU 환경에서 모델 초기화에 실패했습니다. 상품 검색은 계속 사용할 수 있습니다.';
  if (/fetch|network|http/i.test(message)) return 'AI 모델 파일을 다운로드하지 못했습니다. 네트워크를 확인해주세요. 상품 검색은 계속 사용할 수 있습니다.';
  if (/memory|allocation|buffer|device lost|out of memory/i.test(message)) return '기기 메모리 또는 GPU 리소스가 부족해 로컬 AI를 시작하지 못했습니다. 상품 검색은 계속 사용할 수 있습니다.';
  return `로컬 AI 초기화에 실패했습니다 (${code}). 상품 검색은 계속 사용할 수 있습니다.`;
};
