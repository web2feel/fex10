---
title: Effects, Refs & Custom Hooks
phase: 3
week: 6
order: 2
summary: What effects are for, dependency arrays, cleanup, race conditions, stale closures, refs, and extracting custom hooks.
duration: 100 min
resources:
  - label: react.dev — Synchronizing with Effects
    url: https://react.dev/learn/synchronizing-with-effects
  - label: react.dev — You Might Not Need an Effect
    url: https://react.dev/learn/you-might-not-need-an-effect
  - label: react.dev — Reusing Logic with Custom Hooks
    url: https://react.dev/learn/reusing-logic-with-custom-hooks
---

## Effects synchronise with *external systems*

Use `useEffect` to keep React in sync with something **outside** React: a network connection, a browser API, a third-party widget, a subscription. You *don't* need an effect to:

- Transform data for rendering. Compute it during render, or use `useMemo` if it's expensive.
- Respond to a user event. Do it in the event handler.
- Reset state when a prop changes. Use a `key`.
- Notify a parent of a change. Call the parent's callback in the same event handler.

```jsx
// ✗ effect chain + extra render
const [fullName, setFullName] = useState('');
useEffect(() => setFullName(`${first} ${last}`), [first, last]);

// ✓
const fullName = `${first} ${last}`;
```

## Dependencies & cleanup

```jsx
useEffect(() => {
  const conn = createConnection(roomId);
  conn.connect();
  return () => conn.disconnect(); // runs before the next effect and on unmount
}, [roomId]);
```

- **No array**: runs after every render.
- **`[]`**: runs after mount, and cleans up on unmount.
- **`[a, b]`**: runs when `a` or `b` changes, compared with `Object.is`.

In development, **Strict Mode mounts, unmounts and re-mounts** each component, so every effect runs twice. If that breaks your code, your cleanup is missing.

> Dependencies aren't chosen; they're **every reactive value the effect reads**. If you want fewer dependencies, change the code (move objects inside the effect, use updater functions, or use `useEffectEvent`), not the array.

### Objects and functions as dependencies

```jsx
// ✗ `options` is a new object every render, so the effect re-runs every render
const options = { roomId, serverUrl };
useEffect(() => { connect(options); }, [options]);

// ✓ depend on primitives; create the object inside
useEffect(() => { connect({ roomId, serverUrl }); }, [roomId, serverUrl]);
```

## Race conditions in data fetching

```jsx
useEffect(() => {
  let ignore = false;
  const controller = new AbortController();
  setStatus('loading');
  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then((r) => r.json())
    .then((data) => { if (!ignore) { setUser(data); setStatus('success'); } })
    .catch((e) => { if (!ignore && e.name !== 'AbortError') setStatus('error'); });
  return () => { ignore = true; controller.abort(); };
}, [id]);
```

Without the cleanup, a slow response for an *old* `id` can arrive last and overwrite the new data. In production apps, prefer TanStack Query or RTK Query.

## Stale closures

```jsx
function Ticker() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount(count + 1), 1000); // ✗ count is always 0
    return () => clearInterval(id);
  }, []);
  // Fix: setCount(c => c + 1), so the closure no longer needs `count`
}
```

## Refs

`useRef` returns a mutable `{ current }` box that **persists across renders and doesn't trigger a render** when changed. Use refs for:

- DOM nodes (focus, measure, scroll)
- Timer IDs, previous values, instance-like values that aren't shown in the UI

Don't read or write `ref.current` **during render**, except for lazy initialisation.

```jsx
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;
}
```

In React 19, `ref` is a **regular prop** for function components, so `forwardRef` is no longer needed. Ref callbacks can also return a cleanup function.

`useLayoutEffect` runs synchronously after DOM mutation, before paint. Use it only when you must measure layout and re-render before the user sees a flicker.

## Custom hooks

A custom hook is a function starting with `use` that calls other hooks. It shares **logic, not state**: every call gets its own state.

```jsx
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; }
    catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}
```

### Rules of Hooks

1. Only call hooks at the **top level**: never in conditions, loops or after an early `return`.
2. Only call hooks from React function components or other custom hooks.

The exception: React 19's `use()` *can* be called conditionally.

## Practice

1. Audit a component with five `useEffect`s and delete the ones that aren't needed.
2. Build `useFetch(url)` with abort, race-condition safety and `{ data, error, status }`.
3. Build `useInterval(callback, delay)` that always calls the *latest* callback without resetting the interval.
