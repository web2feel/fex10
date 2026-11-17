---
title: Rendering Model & State
phase: 3
week: 6
order: 1
summary: What triggers a render, state as a snapshot, batching, updater functions, keys and reconciliation, and where state should live.
duration: 90 min
resources:
  - label: react.dev — Render and Commit
    url: https://react.dev/learn/render-and-commit
  - label: react.dev — State as a Snapshot
    url: https://react.dev/learn/state-as-a-snapshot
  - label: react.dev — Preserving and Resetting State
    url: https://react.dev/learn/preserving-and-resetting-state
---

## Render → commit

1. **Trigger**: the initial render, or a state update (`setState`, `dispatch`, a context value change).
2. **Render**: React calls your component functions. These must be **pure**: same inputs, same JSX, no side effects.
3. **Commit**: React applies the *minimal* DOM changes, then runs layout effects, then (asynchronously) effects.

When a component re-renders, **all of its children re-render by default**, whether or not their props changed. Props changing doesn't *cause* a render. A parent rendering does.

## State is a snapshot

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    console.log(count); // still 0: this render's snapshot
  }
  // after click: count === 1
}
```

Every `count + 1` reads the same snapshot value, 0. Use an **updater function** to queue on top of the latest pending state:

```jsx
setCount((c) => c + 1);
setCount((c) => c + 1);
setCount((c) => c + 1); // count === 3
```

### Batching

Since React 18, updates inside event handlers, timeouts, promises and native events are **batched automatically** into a single re-render. `flushSync` opts out (rarely needed).

### Bail-out

If the new state `Object.is` the old one, React skips re-rendering the children. This is why you must **never mutate** state:

```jsx
// ✗ same reference, so no re-render
todos.push(newTodo); setTodos(todos);

// ✓
setTodos([...todos, newTodo]);
setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
```

### Lazy initial state

```jsx
const [data, setData] = useState(() => JSON.parse(localStorage.getItem('data') ?? '[]'));
// The function runs only on the first render. Passing the result directly would parse on every render.
```

## Reconciliation & keys

React compares the new tree to the previous one by **element type and position**:

- Same type at the same position → keep the DOM node and **preserve state**, update the props.
- Different type → destroy the subtree, including its state, and mount fresh.
- Lists use `key` to match items across renders.

```jsx
// ✗ index keys: inserting at the top shifts state (input values, focus) to the wrong rows
{items.map((item, i) => <Row key={i} item={item} />)}

// ✓ stable identity
{items.map((item) => <Row key={item.id} item={item} />)}
```

Use `key` to **reset** a component's state deliberately:

```jsx
<ProfileForm key={userId} userId={userId} /> {/* new user means a fresh form */}
```

> **Trap:** defining a component *inside* another component creates a new type every render, so its state resets on every parent render.

## Where should state live?

- **Derive, don't store.** If you can compute it from props or other state, compute it during render.
- **Lift state up** to the closest common parent when siblings need it.
- **Colocate** state as low as possible to limit re-renders.
- **Server data** (fetched) belongs in a cache layer like TanStack Query or RTK Query, not `useState` plus `useEffect`.
- **URL state** (filters, tabs, pagination) belongs in the URL.

```jsx
// ✗ redundant state that can go out of sync
const [items, setItems] = useState([]);
const [visible, setVisible] = useState([]);

// ✓ derived
const visible = items.filter((i) => i.name.includes(query));
```

## Controlled vs uncontrolled

- **Controlled**: React state is the source of truth (`value` + `onChange`).
- **Uncontrolled**: the DOM holds the value. Read it via a ref or `FormData` (`defaultValue`).

Switching between them (for example, `value` going from `undefined` to a string) triggers a warning.

## Practice

1. Predict the result of 8 `setState` puzzles mixing direct values and updaters.
2. Build an editable list where each row has an input. Show the index-key bug, then fix it.
3. Refactor a component with five `useState`s into derived values plus a minimal state set.
