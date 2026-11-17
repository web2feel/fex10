---
title: Refactor a Prop-Drilled App to Redux Toolkit
phase: 4
order: 1
difficulty: Hard
timeLimit: 75 min
summary: Move tangled useState + prop drilling into RTK slices with memoised selectors, without changing behaviour.
---

## Starting point

```jsx
function App() {
  const [cart, setCart] = useState([]);           // [{ id, title, price, qty }]
  const [coupon, setCoupon] = useState(null);     // { code, percent } | null
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    setStatus('loading');
    fetch('/api/products').then((r) => r.json())
      .then((p) => { setProducts(p); setStatus('done'); })
      .catch(() => setStatus('error'));
  }, []);

  const addToCart = (p) => setCart((c) => {
    const found = c.find((i) => i.id === p.id);
    return found ? c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
                 : [...c, { ...p, qty: 1 }];
  });
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0) * (1 - (coupon?.percent ?? 0) / 100);

  return (
    <Layout cartCount={cart.length} total={total}>
      <ProductGrid products={products} status={status} onAdd={addToCart} />
      <CartDrawer cart={cart} setCart={setCart} coupon={coupon} setCoupon={setCoupon} total={total} />
    </Layout>
  );
}
```

## Requirements

1. A `productsSlice` using `createEntityAdapter` + `createAsyncThunk` (`fetchProducts`) with a status enum.
2. A `cartSlice` with event-named actions: `itemAdded`, `itemRemoved`, `quantityChanged`, `couponApplied`, `cartCleared`. Store **only `{ id, qty }`** in the cart, not copies of the product data.
3. Memoised selectors: `selectCartItemsDetailed` (joins the cart with product entities), `selectCartCount` (the total quantity, not the line count), `selectSubtotal` and `selectTotal`.
4. Components read from the store with `useAppSelector`. **No prop drilling** of cart or product data.
5. Persist the cart to `localStorage` using **listener middleware**, debounced by 300 ms.
6. Tests: reducer tests for each cart action; a selector test showing `selectTotal` returns a cached result when unrelated state changes (check `selectTotal.recomputations()`); and one integration test with `renderWithProviders`.

## Rubric (100)

Slice design & action naming (20) · normalisation & entity adapter (15) · selectors & memoisation proof (25) · listener middleware persistence (15) · components free of drilling (10) · tests (15).

<details class="solution">
<summary>Key selector</summary>

```js
const selectCart = (s) => s.cart.items;            // [{ id, qty }]
const selectCoupon = (s) => s.cart.coupon;
const { selectEntities: selectProductEntities } = productsAdapter.getSelectors((s) => s.products);

export const selectCartItemsDetailed = createSelector(
  [selectCart, selectProductEntities],
  (items, products) => items.map(({ id, qty }) => ({ ...products[id], qty }))
);
export const selectSubtotal = createSelector([selectCartItemsDetailed], (items) =>
  items.reduce((sum, i) => sum + i.price * i.qty, 0)
);
export const selectTotal = createSelector([selectSubtotal, selectCoupon], (sub, c) =>
  Math.round(sub * (1 - (c?.percent ?? 0) / 100) * 100) / 100
);
```

</details>
