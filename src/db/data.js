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
// 메인 페이지 노출용 기획전 (1_PLAN_0)
export const mainPlans = planData.data?.["1_PLAN_0"] || [];

// 메인 페이지 탭별 카테고리 상품 리스트 
// 구조: { A: { name: "남성", products: [...] }, B: { name: "여성", products: [...] }, ... }
export const mainCategoryProducts = bannerData.data?.["1_DISPLAY_MAIN_PRODUCT"] || {};

// 상품 상세 데이터 (product_id로 모든 상세 옵션과 갤러리 이미지 확인 가능)
export const productDetailsList = productDetailData.data?.rows || [];

/**
 * 특정 상품 ID로 100% 리얼 원본 상세 데이터를 가져오는 유틸리티 함수
 * (옵션, 갤러리이미지 10장, 재고 등 완벽 포함)
 */
export const getProductById = (productId) => {
    return productDetailsList.find(p => p.product_id === Number(productId)) || null;
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
