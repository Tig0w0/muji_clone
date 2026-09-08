// 사용자님이 수집해주신 원본 JSON 데이터 임포트
import productDetailData from '../json/01.json'; // 상세 상품 정보
import planData from '../json/04.json';          // 기획전 리스트
import bannerData from '../json/05.json';        // 메인 배너 및 메인 상품 리스트
import beltData from '../json/06.json';          // 최상단 띠 배너

// -------------------------------------------------------------
// 1. 배너 및 레이아웃 데이터 추출
// -------------------------------------------------------------
// 최상단 띠 배너 ($MUJI APP$ 다운받고...)
export const topBelt = beltData.data?.["1_DISPLAY_MAIN_TOP_BELT"] || [];

// 메인 최상단 롤링 배너 (PC 및 모바일)
export const mainBannersPC = bannerData.data?.["1_BANNER_MAIN_TOP_PC"] || [];
export const mainBannersMO = bannerData.data?.["1_BANNER_MAIN_TOP_MO"] || [];

// 하이라이트 배너 바
export const highlightBanners = bannerData.data?.["1_BANNER_HIGHLIGHT_BAR_PC"] || [];

// -------------------------------------------------------------
// 2. 상품 및 카테고리 데이터 추출
// -------------------------------------------------------------
// 메인 페이지 노출용 기획전 (1_PLAN_0, 1_PLAN_1)
export const mainPlans = planData.data?.["1_PLAN_0"] || [];
export const fromMujiPlans = planData.data?.["1_PLAN_1"] || [];

// plan_id로 기획전 데이터를 바로 조회합니다.
const allPlans = [...mainPlans, ...fromMujiPlans];
const plansById = new Map(allPlans.map(entry => [String(entry.plan.plan_id), entry]));

export const getPlanDetail = (id) => {
  const planId = String(id);
  const found = plansById.get(planId);
  if (found) return found;

  // 메인 슬라이더 기획전(389, 332)이 04.json에 누락되어 있으므로, 
  // 포트폴리오용으로 정상 작동을 보여주기 위해 배너 이미지와 텍스트를 조합한 데이터를 생성합니다.
  if (planId === '389') {
    return {
      plan: { plan_id: 389, name: '자연, 피부에 닿다', plan_thumbnail_image_full: '/images/banner/YryLPkuTA70OYbBZDZUcOOmraMOagw6Y3uuyxYQY.jpg' },
      point: []
    };
  }
  if (planId === '332') {
    return {
      plan: { plan_id: 332, name: '여름의 온도를 낮추는 시원한 패브릭', sub_name: '부드러운 냉감과 산뜻한 서커 침장 시리즈', plan_thumbnail_image_full: '/images/banner/14lpHkMNLfzBwQVfpQ0M1VMV7XA6Aed1bpMMsGlO.jpg' },
      point: []
    };
  }

  return null;
};
// 메인 페이지 탭별 카테고리 상품 리스트
// 구조: { A: { name: "남성", products: [...] }, B: { name: "여성", products: [...] }, ... }
export const mainCategoryProducts = bannerData.data?.["1_DISPLAY_MAIN_PRODUCT"] || {};

// 상품 상세 데이터 (product_id로 모든 상세 옵션과 갤러리 이미지 확인 가능)
export const productDetailsList = productDetailData.data?.rows || [];

// 기획전에도 상품이 있으므로 함께 조회합니다. 메인 목록(05.json)을 최우선으로 사용합니다.
const collectProducts = (value) => {
    if (!value || typeof value !== 'object') return [];
    if (value.product_id && value.product_name) return [value];
    return Object.values(value).flatMap(collectProducts);
};
// 무인양품 원본 이미지가 없거나 다운로드에 실패한 상품 코드 리스트 (페이지에서 완전히 제외)
export const noImageProductCodes = new Set([
  'AC23DA6A', 'BC2O4A6A', 'FCE28A6A', 'MDA90A5A', 'MDA87A5A', 'MDU86A5A', 'MDU85A5A', 'MDU84A5A', 
  'MCL13A5A', 'MCL12A5A', 'MCL11A5A', 'MCL10A5A', 'MCI20A5A', 'D6S4032', '7A59048', 'D2A4085', 
  'D6A4040', 'D6A4039', 'JBAI3A6S', 'JB40CC6S', 'KG15WA4A', 'KG15VA4A', 'KG147A4A', 'KG146A4A', 
  'KG13OA4A', 'KG13HA4A', 'KG13GA4A', 'KG10UA4A', 'KG145A4A', 'KG144A4A', 'KG143A4A', 'XA049A4A', 
  'XA044A4A', 'XA041A4A', 'XA040A4A', 'XA03ZA4A', 'KE37PA4A', 'KE37NA4A', 'KE37MA4A', 'KE2YGA3A', 
  'KE2YFA3A', 'KE2Y6A3A', 'KE2Y5A3A', 'MAJ37A5A', 'MAJ36A5A', 'MAH76A5A', 'LB35CC3S', 'LB14CC3S', 
  'NE62CC2S', 'LAB5CC3S', 'LA1PUA3A', 'C9S1008', 'C4A1005', 'NBE22A3A', 'NBH7CC4S', 'NBH6CC4S', 
  'NBC0CC2S', 'NBB9CC2S', 'NB80CC2S', 'OGB93A5A', 'OGB92A5A', 'OGB91A5A', 'ODA60A6S', 'ODA59A6S', 
  'OAP02A3A', 'OAP01A3A', 'OAO97A3A', 'OAO96A3A', 'OAO95A3A', 'OAO94A3A', 'OAO93A3A', 'OAO92A3A', 
  'OAO23A3A', 'OAO09A3A', '003244', '003046', '8013106', '3039', '595', '557', 
  '2865', '717', '14917', '785364', '785357', '000755', '003251', '000748', 
  '000731', '78967', '61986', '77618', '2988', '2971', '564', '77335', 
  '2926', '2919', '2902', '25675', 
]);

export const catalogProducts = [...new Map([
    ...productDetailsList,
    ...collectProducts(planData.data),
    ...Object.values(mainCategoryProducts).flatMap(category => category.products),
].filter(product => !noImageProductCodes.has(product.code)).map(product => [Number(product.product_id), product])).values()];
const productsById = new Map(catalogProducts.map(product => [Number(product.product_id), product]));

export const getProductById = (productId) => productsById.get(Number(productId)) || null;

export const productImageUrl = (src) => {
    if (!src || typeof src !== 'string') return '';
    if (/^https?:\/\//.test(src)) return src;
    if (src.startsWith('//')) return `https:${src}`;
    if (src.startsWith('/images/products/') || src.startsWith('/media/')) return src;
    return `/${src.replace(/^\//, '')}`;
};

// SUB(색상 → 사이즈)와 ONE(단일/선택 옵션)을 화면에서 같은 방식으로 읽도록 정리합니다.
export const getProductVariants = (product) => {
    const options = product.options || {};
    const entries = Object.entries(options.option || options.data || {});
    if (entries.some(([, option]) => Array.isArray(option.sizes))) {
        return entries.map(([key, option]) => ({
            key, name: option.color_name || key,
            chip: productImageUrl(option.image_chip), hex: option.hex,
            images: (option.images || []).map(productImageUrl).filter(Boolean),
            choices: (option.sizes || []).filter(item => item.is_display !== 0).map(item => ({ ...item, label: item.size })),
        }));
    }
    return [{ key: 'default', name: options.option_name || '옵션', chip: '',
        images: [...new Set(entries.flatMap(([, option]) => option.images || []).map(productImageUrl).filter(Boolean))],
        choices: entries.map(([, option]) => ({ ...option, label: option.option || 'FREE' })).filter(item => item.is_display !== 0),
    }];
};

export const getProductImage = (product) => productImageUrl(product.thumbnail_list?.[0])
    || getProductVariants(product).flatMap(variant => variant.images)[0] || '';

export const isOptionAvailable = (option, product) => Boolean(option)
    && product.sale_state === 'ON' && option.sale_state === 'ON' && Number(option.stock) > 0;

export const getProductCategory = (productId) => Object.values(mainCategoryProducts)
    .find(category => category.products.some(product => Number(product.product_id) === Number(productId)));

export const getProductDetail = (productId) => {
    const product = getProductById(productId);
    if (!product) return null;
    const variants = getProductVariants(product);
    const category = getProductCategory(productId);
    return {
        ...product, variants,
        categories: category ? [category.name] : [],
        images: variants[0]?.images.length ? variants[0].images : (product.thumbnail_list || []).map(productImageUrl),
        facts: [
            ['품명 및 모델명', `${product.product_name} / ${product.code}`],
            ...(product.options?.color?.length ? [['색상', product.options.color.join(', ')]] : []),
            ...(product.options?.size?.length ? [['사이즈 / 규격', product.options.size.join(', ')]] : []),
        ],
    };
};

// -------------------------------------------------------------
// Default Export (구조 분해 할당 편의를 위함)
// -------------------------------------------------------------
export default {
    topBelt,
    mainBannersPC,
    mainBannersMO,
    highlightBanners,
    mainPlans,
    mainCategoryProducts,
    productDetailsList,
    getProductById
};

export const deliveryGuide = [
  {
    "title": "배송 정보 안내",
    "text": "[배송 지역]\n- 전국 배송\n[배송 방식]\n- 일반,냉동 상품의 경우 택배회사를 이용해 택배 배송되며, 그 외 설치 가구상품은 MUJI물류센터의 가구배송 차량으로 고객님과 협의된 배송일에 배송됩니다.\n[배송비]\n- 택배배송 일반상품: 3,500원 (3만원이상 구입시 무료배송)\n- 택배배송 냉동상품: 3,500원 (3만원이상 구입시 무료배송)\n- 설치가 필요한 가구: 50,000원 (50만원이상 구입시 무료 설치배송)\n[배송 기간]\n- 일반 택배배송 : 결제일 다음 영업일부터 3일이내 발송(토,일 공휴일제외)\n- 도서 · 산간 지역은 배송기일이 추가적으로 소요 될 수 있으며,상품의 재고상황에 따라 다소 지연될 수도 있습니다.\n- 설치가구 상품배송 : 배송일 협의를 통해 진행(구매일 기준 1개월 이내로 지정)\n- 결제수단이 인터넷뱅킹/무통장입금인 경우 입금확인이 된 후 상품발송을 진행하므로 배송 기간이 다소 늦어질 수 있습니다.\n- 해외배송 가구 상품은 생산지 혹은 수입처로부터 1:1주문형식으로 수입되어 배송되는 상품입니다. 주문일로부터 평균 6주 정도 소요될 수 있으며, 현지 사정에 따라 추가 지연이 발생할 수 있는 점 양해 부탁드립니다.(통관상 배송지연 또는 생산지 혹은 수입처의 일시적인 재고부족으로 주문이 취소될 수도 있사오니 이 점 양해 부탁드립니다)\n[설치 가구 상품 배송]\n- 배송 관련 변경 사항은 영업일 기준 D-3일까지 접수가 가능합니다.\n- 배송일 지정은 가능하나, 시간 지정은 불가합니다.\n- 배송일은 약 1개월 후까지 가능합니다. 수령이 불확실한 경우 임의 배송일 지정이 어렵습니다.\n- 배송 하루 전 구체적인 배송 시간 등의 안내 전화를 드릴 예정입니다.\n- 영업일 기준 배송 D-2 혹은 배송 당일, 배송 상황 관련 변경이 발생할 경우 추가 배송비가 고객님께 청구됩니다.\n- 배송 과정에서 발생하는 추가비용은 고객 부담입니다. (엘리베이터 사용료, 주차료 등) 특히, 입구가 좁아 상품이 들어가기 어렵거나 엘리베이터가 없는 층계 4층 이상 건물의 경우 사다리차가 필수입니다. 배송 차량, 사다리차 진입이 어려운 경우  배송은 불가합니다. 진입 불가로 인한 배송 수수료는 고객 부담이니 사전 확인 부탁드립니다.\n- 사용 중이던  기존 가구의 이동 설치 및 수리, 폐기는 배송 서비스에 포함되지 않습니다. 배송 전 설치 공간을 확보해 주시기 바랍니다.\n- 재배송 사유가 발생한 경우 예약 배송 스케줄에 따라 일정이 지연될 수 있습니다. (통관상의 이유나 일본 양품계획의 재고 부족의 사유로 입고 기간 지연 및 주문 자체가 취소되는 경우가 발생할 수 있습니다.)"
  },
  {
    "title": "교환/환불안내",
    "text": "[교환/반품 안내]\n- 교환/반품 요청은 배송 완료일 기준 7일 이내에만 가능합니다.\n- 취소/교환/반품에 대한 자세한 문의는 [고객센터 1:1 게시판]을 통해 접수해 주시면 정성껏 답변해 드리겠습니다.\n[교환/반품 조건]\n- 상품(구성품 포함)이 사용되었거나, 훼손된 경우 교환/반품이 제한될 수 있습니다.\n- 상품 택(TAG), 보증서, 사은품 등이 누락된 경우 반품이 불가합니다.\n- 식품·위생용품·이너웨어는 상품 특성상 단순 변심 사유로는 교환 또는 환불이 제한됩니다.\n[반품 유의 사항]\n- 반품 시 상품은 1개의 포장으로 보내주시기 바랍니다. 개별 반품 시 추가 배송비가 발생할 수 있습니다.\n- 단순 변심으로 인한 반품 시 왕복 배송비는 고객 부담입니다.\n- 제품 하자 및 오배송 시 판매자가 배송비를 부담합니다.\n[환불 처리 안내]\n- 반품 완료 후 환불까지 영업일 기준 3~5일의 시일이 소요될 수 있습니다.\n- 유효기간이 있는 포인트로 결제한 경우, 환불 시 동일한 유효기간이 적용된 포인트로 재적립됩니다.\n- 유효기간이 만료된 포인트는 복원되지 않으며, 환불이 어려울 수 있습니다.\n[설치 배송 교환/반품 안내]\n- '교환/반품/AS접수'는 관련법 및 소비자분쟁해결기준을 따르며, 구입 시 안내된 주문번호 확인이 필요합니다.\n- 상품이 개봉되어 조립 또는 설치 완료로 재판매가 불가한 상태가 되었다면, 단순 변심에 의한 교환 및 반품이 불가합니다. 주문 전에 상품의 특성과 사이즈 등 정보를 꼼꼼히 확인해 주십시오.\n- 아래의 설명은 천연목의 소재 특성으로, 무인양품의 모든 천연목 가구에서 보일 수 있으며 제품의 하자가 아닙니다.\n→ 나무의 결, 색상, 톤의 차이 / 옹이나 옹이를 메운 자국 / 부분별 변색에 의한 색차가 있을 수 있습니다.\n→ 천연목 가공 과정에서 미세한 패임이나 눌림 등 소재 특성이 남을 수 있으며, 이는 천연 소재의 자연스러움을 유지하기 위한 것입니다.\n→ 천연목 가구의 경우 계절/공간의 온·습도에 따라 수축/팽창이 있을 수 있으며, 이로 인한 갈라짐은 불량 사유가 될 수 없습니다.\n→ 천연목의 특성상 물기가 있거나 뜨거운 물체를 직접 접촉하게 되면 변형/변색이 일어날 수 있으니 주의해 주십시오.\n→ 비닐 제품(염화비닐수지 등) 혹은 화학 걸레를 장시간 접촉하거나, 시너 등의 유기용제나 표백제 등의 약품으로 닦지 마십시오. 변형/변색이 일어나고 표면이 벗겨질 수 있습니다.\n- 자사 매트리스는 침대 패드 사용을 전제로 퀼트 가공을 하지 않았습니다. 상품 보호 및 관리를 위해 침대 패드 사용을 권장합니다.\n- 별도 수입처의 구매 건은 대응이 어렵습니다."
  },
  {
    "title": "AS 안내",
    "text": "AS 규정은 캐리백, 가구 및 부속 일부 상품에만 적용됩니다.\n품질보증기간 이내의 정상적인 사용 상태에서 확인되는 문제에 한해 무상으로 서비스를 받으실 수 있습니다.\n품질보증기간 이내이더라도 다음과 같은 경우에는 유상으로 처리가 됩니다.\n1. 소비자의 취급 부주의로 인한 파손 시\n2. 천재지변(화재,지진,수해,낙뢰 등)으로 인한 파손 시\n제조년월 : 수입되는 제품으로, 입고 시기에 따라 상이하기 때문에 개별 확인이 어렵습니다. 고객센터를 통해 문의 부탁드립니다.\n의류의 착용 및 세탁 시에는 제품에 부착된 택에 표기된 취급 주의사항과 케어라벨의 세탁방법 및 제품 특징을 꼭 확인해 주시기 바랍니다.\n(의류 및 패브릭 류는 반드시 부착된 케어라벨의 세탁표시 사항에 따라 취급해주세요)\n캐리백의 일부 사례(지퍼 레일, 지퍼 몰딩부, 본체의 균열 등) 및 전자제품의 경우 수리 대응이 불가하여, 관련법 및 소비자분쟁해결기준에 따라 대응하고 있습니다.\n(관련 내용은 FAQ 게시판의 제품정보안내 페이지 내에서 확인하실 수 있습니다)\nMUJI KOREA 공식 온라인 스토어에서 구매한 상품의 AS 접수는 온라인 스토어 고객센터를 통해서만 접수 가능합니다.\n오프라인 매장에서 구매한 상품의 경우, 품질보증서(또는 영수증) 지참 후 구입 매장 내방 시 AS 접수 및 안내가 가능합니다.\n※ 품질보증서(또는 영수증)를 분실하신 경우 무인양품 대표번호(02-1551-3780)로 문의 부탁드립니다.\n※ 무인양품 대표 번호 연결 시 음성안내에 따라 오프라인 고객센터로 통화 연결 부탁 드립니다.\n- 오프라인 고객센터: 2번\n- 고객 상담 및 AS 접수 관련 : (E-mail) voc@mujikorea.co.kr\n(단, 경우에 따라 수리가 불가한 경우 소비자분쟁해결기준에 따라 대응될 수 있습니다.)\n품질보증기간이 경과된 이후에는 AS 접수를 위한 의뢰품의 왕복 배송 비용이 유상으로 처리됩니다.\n무인양품의 상품은 가정용을 기준으로 품질보증을 운영하고 있으며, 영업용도 사용의 경우 품질보증기간 및 수리불가 시 감가상각의 적용에 있어서 1/2의 품질보증이 적용됩니다.\nAS 고객센터 전화번호 : MUJI 온라인 스토어 고객센터 02-1551-3780"
  }
];
