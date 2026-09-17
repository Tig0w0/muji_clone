// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';
import { hydrateData } from './data/catalog';
import products from './json/products_info.json';
import plans from './json/main_plan.json';
import banners from './json/main_banner_and_products.json';
import belts from './json/main_top_belt.json';

// React Router 7 uses these browser APIs; CRA's older jsdom does not provide them.
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

hydrateData({
  topBelt: belts.data?.['1_DISPLAY_MAIN_TOP_BELT'] || [],
  mainBannersPC: banners.data?.['1_BANNER_MAIN_TOP_PC'] || [],
  mainBannersMO: banners.data?.['1_BANNER_MAIN_TOP_MO'] || [],
  highlightBanners: banners.data?.['1_BANNER_HIGHLIGHT_BAR_PC'] || [],
  mainCategoryProducts: banners.data?.['1_DISPLAY_MAIN_PRODUCT'] || {},
  mainPlans: plans.data?.['1_PLAN_0'] || [],
  fromMujiPlans: plans.data?.['1_PLAN_1'] || [],
  productDetailsList: products.data?.rows || [],
});
