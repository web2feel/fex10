---
title: "Final Exam: Section B (JavaScript Utilities)"
phase: 5
order: 1
difficulty: Expert
timeLimit: 60 min
summary: Four timed implementation problems covering closures, async control flow, immutability and data structures.
---

> Set a 60-minute timer. No looking at the lessons. Write tests as you go.

## B1: `EventEmitter` (15 min)

Implement `on(event, fn)` (which returns an unsubscribe function), `once`, `off` and `emit(event, ...args)`. Listeners must be called in registration order. Removing a listener *during* `emit` must not skip the others. Listener errors must not stop other listeners; collect them and throw an `AggregateError` at the end.

## B2: `retryWithTimeout(fn, { retries, timeout, backoff })` (15 min)

Call the async `fn(signal)`. Abort and retry any attempt that takes longer than `timeout`. Wait `backoff * 2 ** attempt` ms between attempts. Reject with the last error after `retries` retries. Pass an `AbortSignal` into `fn` so the slow attempt is actually cancelled.

## B3: `updateIn(obj, path, updater)` (15 min)

```js
const state = { users: [{ id: 1, tags: ['a'] }, { id: 2, tags: [] }], meta: {} };
const next = updateIn(state, ['users', 0, 'tags'], (t) => [...t, 'b']);

next.users[0].tags;            // ['a', 'b']
next.meta === state.meta;      // true: untouched branches are shared
next.users[1] === state.users[1]; // true
state.users[0].tags;           // ['a']: original unchanged
```

Create missing intermediate objects or arrays depending on the next key's type (number → array).

## B4: `createStore(reducer)` with `subscribe`, `dispatch`, `getState` and `applyMiddleware` (15 min)

Middleware must support thunks. Dispatching from inside a reducer must throw. Unsubscribing during dispatch must not affect the current notification loop.

## Marking

Each problem: correctness (60%), edge cases (25%), clarity (15%). You need **≥ 80% overall** in this section.
