import { configureStore, createSlice } from '@reduxjs/toolkit';
import { getProductById, getProductImage, getProductVariants, isOptionAvailable } from './db/data';

export const CART_STORAGE_KEY = 'muji.cart.v1';
export const cartItemKey = (productId, optionId) => `${productId}:${optionId}`;

export const getCartOption = (productId, optionId) => {
  const product = getProductById(productId);
  if (!product) return null;
  for (const variant of getProductVariants(product)) {
    const option = variant.choices.find(item => Number(item.product_option_id) === Number(optionId));
    if (option) return { product, variant, option };
  }
  return null;
};

export const getCartLines = items => items.map(item => {
  const match = getCartOption(item.productId, item.optionId);
  if (!match) return null;
  const { product, variant, option } = match;
  const unitPrice = Number(product.sell_price) + Number(option.adjust_price || 0);
  return { ...item, key: cartItemKey(item.productId, item.optionId), product, variant, option,
    image: variant.images[0] || getProductImage(product), unitPrice,
    originalPrice: Math.max(unitPrice, Number(product.retail_price || product.sell_price) + Number(option.adjust_price || 0)),
    available: isOptionAvailable(option, product),
    deliveryType: product.shipping_type === 'INSTALL' ? 'INSTALL' : 'DELIVERY',
  };
}).filter(Boolean);

// JSON의 판매가를 사용하며, 배송 종류별로 무료 배송 기준을 각각 적용합니다.
export const getCartTotals = lines => {
  const available = lines.filter(line => line.available);
  const subtotal = available.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const original = available.reduce((sum, line) => sum + line.originalPrice * line.quantity, 0);
  const shipping = ['DELIVERY', 'INSTALL'].reduce((sum, type) => {
    const group = available.filter(line => line.deliveryType === type);
    if (!group.length) return sum;
    const amount = group.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
    return sum + (type === 'INSTALL' ? (amount >= 500000 ? 0 : 50000) : (amount >= 30000 ? 0 : 3500));
  }, 0);
  return { subtotal, original, discount: original - subtotal, shipping, total: subtotal + shipping,
    quantity: available.reduce((sum, line) => sum + line.quantity, 0) };
};

export const normalizeCartItems = value => {
  if (!Array.isArray(value)) return [];
  const normalized = new Map();
  value.forEach(item => {
    if (!item || !Number.isInteger(item.quantity) || item.quantity < 1) return;
    const match = getCartOption(item.productId, item.optionId);
    if (!match) return;
    const key = cartItemKey(match.product.product_id, match.option.product_option_id);
    const existing = normalized.get(key);
    const quantity = Math.min((existing?.quantity || 0) + item.quantity, Math.max(1, Number(match.option.stock) || 0));
    normalized.set(key, { productId: match.product.product_id, optionId: match.option.product_option_id, quantity,
      selected: (existing?.selected || item.selected !== false) && isOptionAvailable(match.option, match.product) });
  });
  return [...normalized.values()];
};

const cartSlice = createSlice({
  name: 'cart', initialState: { items: [] },
  reducers: {
    addItem(state, { payload }) {
      const match = getCartOption(payload.productId, payload.optionId);
      if (!match || !isOptionAvailable(match.option, match.product) || !Number.isInteger(payload.quantity) || payload.quantity < 1) return;
      const existing = state.items.find(item => cartItemKey(item.productId, item.optionId) === cartItemKey(payload.productId, payload.optionId));
      const quantity = Math.min((existing?.quantity || 0) + payload.quantity, Number(match.option.stock));
      if (existing) { existing.quantity = quantity; existing.selected = true; }
      else state.items.push({ productId: match.product.product_id, optionId: match.option.product_option_id, quantity, selected: true });
    },
    updateItem(state, { payload }) {
      const index = state.items.findIndex(item => cartItemKey(item.productId, item.optionId) === payload.key);
      if (index < 0 || !Number.isInteger(payload.quantity) || payload.quantity < 1) return;
      const current = state.items[index];
      const match = getCartOption(current.productId, payload.optionId);
      if (!match || !isOptionAvailable(match.option, match.product)) return;
      const target = state.items.find(item => item.productId === current.productId && Number(item.optionId) === Number(payload.optionId));
      if (target && target !== current) {
        target.quantity = Math.min(target.quantity + payload.quantity, Number(match.option.stock));
        target.selected = target.selected || current.selected;
        state.items.splice(index, 1);
      } else {
        current.optionId = match.option.product_option_id;
        current.quantity = Math.min(payload.quantity, Number(match.option.stock));
      }
    },
    removeItems(state, { payload: keys }) { state.items = state.items.filter(item => !keys.includes(cartItemKey(item.productId, item.optionId))); },
    setSelected(state, { payload }) {
      state.items.forEach(item => {
        if (!payload.keys.includes(cartItemKey(item.productId, item.optionId))) return;
        const match = getCartOption(item.productId, item.optionId);
        item.selected = Boolean(payload.selected && match && isOptionAvailable(match.option, match.product));
      });
    },
  },
});

export const { addItem, updateItem, removeItems, setSelected } = cartSlice.actions;

const browserStorage = () => { try { return window.localStorage; } catch { return null; } };
export const createCartStore = (storage = browserStorage()) => {
  let items = [];
  try { items = normalizeCartItems(JSON.parse(storage?.getItem(CART_STORAGE_KEY) || '[]')); } catch { /* 잘못된 저장 데이터는 빈 장바구니로 복구합니다. */ }
  const store = configureStore({ reducer: { cart: cartSlice.reducer }, preloadedState: { cart: { items } } });
  store.subscribe(() => { try { storage?.setItem(CART_STORAGE_KEY, JSON.stringify(store.getState().cart.items)); } catch { /* 저장이 차단되어도 현재 탭의 장바구니는 사용할 수 있습니다. */ } });
  return store;
};

export const store = createCartStore();
