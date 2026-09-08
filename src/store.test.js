import { addItem, cartItemKey, CART_STORAGE_KEY, createCartStore, getCartLines, getCartTotals, normalizeCartItems, updateItem } from './store';

const pajama = { productId: 1005355, optionId: 426331, quantity: 1 };

test('duplicate additions merge and never exceed stock, while other options stay separate', () => {
  const store = createCartStore(null);
  store.dispatch(addItem({ ...pajama, quantity: 5 }));
  store.dispatch(addItem({ ...pajama, quantity: 5 }));
  store.dispatch(addItem({ ...pajama, optionId: 426332 }));
  expect(store.getState().cart.items.map(item => item.quantity)).toEqual([7, 1]);
  store.dispatch(addItem({ ...pajama, optionId: 426335 }));
  store.dispatch(addItem({ ...pajama, quantity: -1 }));
  store.dispatch(addItem({ ...pajama, quantity: 1.5 }));
  expect(store.getState().cart.items).toHaveLength(2);
});

test('changing into an existing option merges lines without double-counting', () => {
  const store = createCartStore(null);
  store.dispatch(addItem({ ...pajama, quantity: 2 }));
  store.dispatch(addItem({ ...pajama, optionId: 426332, quantity: 3 }));
  store.dispatch(updateItem({ key: cartItemKey(pajama.productId, 426332), optionId: 426331, quantity: 3 }));
  expect(store.getState().cart.items).toEqual([{ ...pajama, quantity: 5, selected: true }]);
});

test('persists minimal identifiers and restores quantities and selections', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const first = createCartStore(storage);
  first.dispatch(addItem({ ...pajama, quantity: 2 }));
  expect(JSON.parse(values.get(CART_STORAGE_KEY))).toEqual([{ ...pajama, quantity: 2, selected: true }]);
  const restored = createCartStore(storage);
  expect(restored.getState().cart.items).toEqual(first.getState().cart.items);
  expect(getCartTotals(getCartLines(restored.getState().cart.items)).total).toBe(119800);
});

test('invalid saved data is ignored, stale quantities are clamped, and storage errors do not crash', () => {
  expect(createCartStore({ getItem: () => '{broken', setItem: jest.fn() }).getState().cart.items).toEqual([]);
  expect(normalizeCartItems([null, { ...pajama, quantity: 0 }, { ...pajama, productId: 999999 }, { ...pajama, quantity: 100 }]))
    .toEqual([{ ...pajama, quantity: 7, selected: true }]);
  const blocked = createCartStore({ getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('blocked'); } });
  expect(() => blocked.dispatch(addItem(pajama))).not.toThrow();
  expect(blocked.getState().cart.items).toHaveLength(1);
});

test.each([
  ['DELIVERY', 29999, 3500], ['DELIVERY', 30000, 0],
  ['INSTALL', 499999, 50000], ['INSTALL', 500000, 0],
])('applies %s free-shipping threshold for %i', (deliveryType, unitPrice, shipping) => {
  expect(getCartTotals([{ available: true, quantity: 1, unitPrice, originalPrice: unitPrice, deliveryType }]).shipping).toBe(shipping);
});

test('discounts, separate shipping groups and sold-out exclusions produce the correct payable total', () => {
  const totals = getCartTotals([
    { available: true, quantity: 2, unitPrice: 10000, originalPrice: 15000, deliveryType: 'DELIVERY' },
    { available: true, quantity: 1, unitPrice: 100000, originalPrice: 120000, deliveryType: 'INSTALL' },
    { available: false, quantity: 4, unitPrice: 900000, originalPrice: 900000, deliveryType: 'DELIVERY' },
  ]);
  expect(totals).toEqual({ quantity: 3, subtotal: 120000, original: 150000, discount: 30000, shipping: 53500, total: 173500 });
  expect(getCartTotals([]).total).toBe(0);
});
