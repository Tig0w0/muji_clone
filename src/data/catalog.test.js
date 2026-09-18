import { catalogProducts, hydrateData } from './catalog';
import { searchProductsByIntent } from '../utils/productSearch';

beforeEach(() => {
  hydrateData({
    topBelt: [],
    mainBannersPC: [],
    mainBannersMO: [],
    highlightBanners: [],
    mainPlans: [],
    fromMujiPlans: [],
    productDetailsList: [],
    mainCategoryProducts: {
      A: {
        name: '남성',
        products: [
          {
            product_id: 101,
            product_name: '시원한 UV 컷 와이드 반소매 티셔츠',
            sell_price: 29900,
            sale_state: 'ON',
            total_stock: 5,
            options: {},
          },
        ],
      },
    },
  });
});

test('adds parent category metadata to catalog products for RAG retrieval', () => {
  expect(catalogProducts[0].categories).toContain('남성');

  const result = searchProductsByIntent(catalogProducts, {
    gender: '남성',
    category: '티셔츠',
    min_price: null,
    max_price: null,
    colors: [],
    keywords: [],
  });

  expect(result.map(product => product.product_id)).toEqual([101]);
});
