---
title: Functional Patterns & Advanced Built-ins
phase: 2
week: 5
order: 4
summary: Immutability, reduce/compose/curry, debounce & throttle, iterators & generators, Proxy/Reflect, WeakMap and structuredClone.
duration: 100 min
resources:
  - label: javascript.info — Generators
    url: https://javascript.info/generators
  - label: MDN — Proxy
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
  - label: MDN — Array methods (non-mutating)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods
---

## Immutability

React and Redux rely on **reference equality** to detect change, so you need to know which operations mutate.

| Mutates ✗ | Non-mutating ✓ |
| --- | --- |
| `push`, `pop`, `shift`, `unshift` | `[...arr, x]`, `arr.slice()` |
| `splice` | `toSpliced()`, `filter` |
| `sort`, `reverse` | `toSorted()`, `toReversed()` |
| `arr[i] = x` | `arr.with(i, x)` |
| `Object.assign(obj, …)` | `{ ...obj, key: v }` |

Spread is **shallow**. Nested objects must be copied at every level you change:

```js
const next = {
  ...state,
  user: { ...state.user, address: { ...state.user.address, city: 'Pune' } },
};
```

For deep copies use `structuredClone(obj)`. It handles Maps, Sets, Dates and cycles, but not functions or DOM nodes.

## Higher-order utilities

```js
const compose = (...fns) => (x) => fns.reduceRight((acc, f) => f(acc), x);
const pipe    = (...fns) => (x) => fns.reduce((acc, f) => f(acc), x);

function curry(fn) {
  return function curried(...args) {
    return args.length >= fn.length
      ? fn.apply(this, args)
      : (...more) => curried.apply(this, [...args, ...more]);
  };
}
const add3 = curry((a, b, c) => a + b + c);
add3(1)(2)(3) === add3(1, 2)(3); // true

// groupBy is now built in
Object.groupBy(users, (u) => u.role); // { admin: [...], user: [...] }
```

## Debounce & throttle

- **Debounce** waits until calls stop for `ms`, then fires once. Use it for search input and resize-end.
- **Throttle** fires at most once per `ms`. Use it for scroll and pointermove.

```js
function debounce(fn, ms) {
  let id;
  function debounced(...args) {
    clearTimeout(id);
    id = setTimeout(() => fn.apply(this, args), ms);
  }
  debounced.cancel = () => clearTimeout(id);
  return debounced;
}

function throttle(fn, ms) {
  let last = 0, timer;
  return function (...args) {
    const now = Date.now();
    const remaining = ms - (now - last);
    if (remaining <= 0) {
      clearTimeout(timer); timer = null;
      last = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => { last = Date.now(); timer = null; fn.apply(this, args); }, remaining);
    }
  };
}
```

## Iterators & generators

Any object with a `[Symbol.iterator]()` method that returns `{ next() }` works with `for…of`, spread and destructuring.

```js
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) yield i;
}
[...range(0, 10, 3)]; // [0, 3, 6, 9]

function* take(iter, n) {
  for (const x of iter) { if (n-- <= 0) return; yield x; }
}
function* naturals() { let n = 0; while (true) yield n++; }
[...take(naturals(), 3)]; // [0, 1, 2]: lazy, so the infinite source is fine

// Async iteration: paginated APIs
async function* pages(url) {
  while (url) {
    const res = await fetch(url).then((r) => r.json());
    yield res.items;
    url = res.next;
  }
}
for await (const items of pages('/api/items')) render(items);
```

## Proxy & Reflect

```js
function observable(target, onChange) {
  return new Proxy(target, {
    set(obj, key, value, receiver) {
      const old = obj[key];
      const ok = Reflect.set(obj, key, value, receiver);
      if (ok && old !== value) onChange(key, value, old);
      return ok;
    },
  });
}
const state = observable({ count: 0 }, (k, v) => console.log(`${k} → ${v}`));
state.count++; // "count → 1"
```

Proxies power Vue's reactivity and Immer, which Redux Toolkit uses.

## WeakMap, WeakSet, WeakRef

Keys are held **weakly**: when nothing else references the key object, the entry can be garbage-collected. WeakMaps aren't iterable. Use them for private data, caches keyed by DOM nodes or objects, and memoising on object identity.

```js
const cache = new WeakMap();
function expensive(obj) {
  if (!cache.has(obj)) cache.set(obj, compute(obj));
  return cache.get(obj);
}
```

## Equality

- `===` is strict equality.
- `Object.is` is like `===`, except `Object.is(NaN, NaN)` is true and `Object.is(0, -0)` is false. **React uses `Object.is`** to compare state.
- Use `Number.isNaN(x)`, never `x === NaN`.

## Practice

1. Implement `deepEqual`, `deepClone` (with cycles), `flatten(arr, depth)`, `get(obj, 'a.b[0].c')` and `pipe`.
2. Implement `debounce` with `leading`/`trailing` options and `cancel`/`flush` methods.
3. Write an immutable `updateIn(obj, path, updater)` helper and test that unchanged branches keep the same references.
