---
title: Performance, Context & Component Patterns
phase: 3
week: 7
order: 3
summary: memo/useMemo/useCallback (and when not to), the React Compiler, context performance, useReducer, composition and compound components.
duration: 90 min
resources:
  - label: react.dev — memo
    url: https://react.dev/reference/react/memo
  - label: react.dev — Scaling up with Reducer and Context
    url: https://react.dev/learn/scaling-up-with-reducer-and-context
  - label: React Compiler
    url: https://react.dev/learn/react-compiler
---

## Measure first

Use the React DevTools **Profiler** ("Highlight updates when components render") and the browser Performance panel. Most re-renders are cheap. Optimise the ones that are slow *and* frequent.

## Cheap wins before memoisation

1. **Move state down** into the component that uses it.
2. **Lift content up**: pass expensive subtrees as `children`. Children created by the parent don't re-render when the wrapper's state changes.

```jsx
function ScrollTracker({ children }) {
  const [y, setY] = useState(0);
  // ...updates y on scroll
  return <div data-y={y}>{children}</div>; // children don't re-render on scroll
}
<ScrollTracker><ExpensiveTree /></ScrollTracker>
```

## memo, useMemo, useCallback

- **`memo(Component)`** skips re-rendering if every prop is `Object.is`-equal to last time.
- **`useMemo(fn, deps)`** caches a **computed value**.
- **`useCallback(fn, deps)`** caches a **function identity**. It's the same as `useMemo(() => fn, deps)`.

They only help **together**: `useCallback` is pointless unless the function goes to a `memo`'d child or into a dependency array.

```jsx
const Row = memo(function Row({ item, onSelect }) { /* … */ });

function List({ items }) {
  const [selected, setSelected] = useState(null);
  const handleSelect = useCallback((id) => setSelected(id), []);
  const sorted = useMemo(() => items.toSorted(byName), [items]);
  return sorted.map((i) => <Row key={i.id} item={i} onSelect={handleSelect} />);
}
```

> **Trap:** `<Row style={{ color: 'red' }} />` or `<Row onClick={() => …} />` creates new props every render, which defeats `memo`.

### The React Compiler

The React Compiler (stable since late 2025) auto-memoises components and values at build time, so new code rarely needs manual `useMemo` or `useCallback`. Assessments still expect you to understand *why* memoisation works.

## Context

Context passes values deep without prop drilling. **Every consumer re-renders when the context value changes** (by `Object.is`), and `memo` doesn't block that.

```jsx
// ✗ new object each render, so every consumer re-renders
<AuthContext value={{ user, login, logout }}>

// ✓ stable value
const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
<AuthContext value={value}>
```

In React 19 you can render `<Context>` directly as a provider. `<Context.Provider>` still works.

Context performance strategies:

- **Split contexts**: separate state from dispatch, and separate fast-changing values from slow ones.
- Keep provider values stable.
- For high-frequency global state, use a store with **selector subscriptions** (Redux, Zustand) instead.

## useReducer

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'added': return [...state, { id: action.id, text: action.text, done: false }];
    case 'toggled': return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case 'deleted': return state.filter((t) => t.id !== action.id);
    default: throw new Error(`Unknown action: ${action.type}`);
  }
}
const [todos, dispatch] = useReducer(reducer, []);
```

`dispatch` is **stable**, so it's safe to pass down through context without memoisation. Reducers are pure and easy to unit-test, which makes them a natural step towards Redux.

## Composition patterns

### Compound components

```jsx
const TabsContext = createContext(null);

function Tabs({ children, defaultValue }) {
  const [active, setActive] = useState(defaultValue);
  return <TabsContext value={{ active, setActive }}>{children}</TabsContext>;
}
Tabs.Trigger = function Trigger({ value, children }) {
  const { active, setActive } = use(TabsContext);
  return (
    <button role="tab" aria-selected={active === value} onClick={() => setActive(value)}>
      {children}
    </button>
  );
};
Tabs.Panel = function Panel({ value, children }) {
  const { active } = use(TabsContext);
  return active === value ? <div role="tabpanel">{children}</div> : null;
};
```

### Other patterns

- **Render props**: pass a function as `children` or a prop. Custom hooks have mostly replaced them.
- **Slots via props**: `<Card header={…} footer={…} />`
- **Controlled/uncontrolled components**: accept an optional `value`/`onChange`, falling back to internal state.

## Lists at scale

Virtualise long lists (TanStack Virtual, react-window). Use `useTransition` or `useDeferredValue` to keep typing responsive while expensive filtering renders.

```jsx
const deferredQuery = useDeferredValue(query);
const results = useMemo(() => filter(items, deferredQuery), [items, deferredQuery]);
```

## Practice

1. Profile a 1,000-row table, find the unnecessary re-renders, and fix them with the fewest changes.
2. Build an accessible compound `<Accordion>` with keyboard support.
3. Build a theme and auth system with split contexts plus `useReducer`.
