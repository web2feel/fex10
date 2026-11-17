---
title: Redux Principles & Redux Toolkit
phase: 4
week: 9
order: 1
summary: One-way data flow, pure reducers, middleware, then the modern way with configureStore, createSlice, Immer and React-Redux hooks.
duration: 90 min
resources:
  - label: Redux Essentials tutorial
    url: https://redux.js.org/tutorials/essentials/part-1-overview-concepts
  - label: Redux Fundamentals (how it works under the hood)
    url: https://redux.js.org/tutorials/fundamentals/part-1-overview
  - label: Redux Style Guide
    url: https://redux.js.org/style-guide/
---

## Core principles

1. **A single source of truth**: global state lives in one store.
2. **State is read-only**: the only way to change it is to **dispatch an action**, a plain object with a `type`.
3. **Changes are made with pure reducers**: `(state, action) => newState`, with no side effects, no mutation, and nothing random or time-based.

```
UI ──dispatch(action)──▶ middleware ──▶ reducers ──▶ new state ──▶ subscribers re-render
```

## Redux from scratch (to understand it)

```js
function createStore(reducer, preloadedState) {
  let state = preloadedState;
  let listeners = [];
  return {
    getState: () => state,
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach((l) => l());
      return action;
    },
    subscribe(listener) {
      listeners.push(listener);
      return () => { listeners = listeners.filter((l) => l !== listener); };
    },
  };
}

function combineReducers(reducers) {
  return (state = {}, action) => {
    const next = {};
    let changed = false;
    for (const key in reducers) {
      next[key] = reducers[key](state[key], action);
      changed ||= next[key] !== state[key];
    }
    return changed ? next : state;
  };
}
```

### Middleware

Middleware wraps `dispatch` with the signature `store => next => action => …`. It's the place for side effects: async logic, logging, analytics.

```js
const logger = (store) => (next) => (action) => {
  console.log('dispatching', action);
  const result = next(action);
  console.log('next state', store.getState());
  return result;
};

// What redux-thunk is, in full:
const thunk = ({ dispatch, getState }) => (next) => (action) =>
  typeof action === 'function' ? action(dispatch, getState) : next(action);
```

## Redux Toolkit (RTK): the official way

```js
// features/todos/todosSlice.js
import { createSlice, nanoid } from '@reduxjs/toolkit';

const todosSlice = createSlice({
  name: 'todos',
  initialState: { items: [], filter: 'all' },
  reducers: {
    todoAdded: {
      reducer(state, action) {
        state.items.push(action.payload);          // "mutation" is safe: Immer
      },
      prepare(text) {                              // keep reducers pure: generate the id here
        return { payload: { id: nanoid(), text, done: false } };
      },
    },
    todoToggled(state, action) {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) todo.done = !todo.done;
    },
    filterChanged(state, action) {
      state.filter = action.payload;
    },
    todosCleared() {
      return { items: [], filter: 'all' };         // or return a brand-new state
    },
  },
  selectors: {
    selectFilter: (state) => state.filter,
  },
});

export const { todoAdded, todoToggled, filterChanged, todosCleared } = todosSlice.actions;
export const { selectFilter } = todosSlice.selectors;
export default todosSlice.reducer;
```

### Immer rules

- **Either** mutate the draft **or** return a new value. Never both.
- `state = newValue` does nothing, because it only reassigns the local variable. Return it instead.
- Arrow shorthand that returns the result of a mutation is a bug: `(state) => state.items.push(x)` returns a number. Use braces.

## The store

```js
// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import todosReducer from '../features/todos/todosSlice';

export const store = configureStore({
  reducer: { todos: todosReducer },
  // Defaults: redux-thunk, Redux DevTools, and dev-only checks for
  // immutability and serialisability
});
```

## React-Redux hooks

```jsx
import { Provider, useSelector, useDispatch } from 'react-redux';

<Provider store={store}><App /></Provider>

function TodoList() {
  const items = useSelector((state) => state.todos.items);
  const dispatch = useDispatch();
  return items.map((t) => (
    <li key={t.id} onClick={() => dispatch(todoToggled(t.id))}>{t.text}</li>
  ));
}
```

- `useSelector` re-runs after **every dispatched action** and re-renders **only if the returned value changed** (by reference, `===`).
- Returning a new object or array from a selector (`state.todos.items.filter(...)`) makes it re-render on every action. Memoise it (next lesson).
- Select the **smallest** piece of state each component needs.
- With TypeScript, define typed hooks: `useAppSelector`, and `useAppDispatch` built with `useDispatch.withTypes<AppDispatch>()`.

## What goes in Redux?

| Put in Redux | Keep local / elsewhere |
| --- | --- |
| Data shared across many components | Form input in progress (until submit) |
| State that must survive route changes | UI toggles used by one component |
| Complex update logic you want to test | **Server cache** → RTK Query / TanStack Query |
| State you want to time-travel debug | Non-serialisable values (Promises, class instances) |

Name actions as **events** ("todoAdded") rather than setters ("setTodos"). Let many reducers respond to the same event.

## Practice

1. Implement `createStore`, `combineReducers` and `applyMiddleware` from scratch, then run a test suite against them.
2. Build a todos slice with filters and test the reducer with plain `expect(reducer(state, action)).toEqual(...)`.
3. Find and fix five Immer mistakes in a broken slice.
