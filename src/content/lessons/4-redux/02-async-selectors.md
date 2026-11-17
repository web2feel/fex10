---
title: Async Thunks, Selectors & Normalised State
phase: 4
week: 9
order: 2
summary: createAsyncThunk lifecycles, extraReducers, memoised selectors with createSelector, createEntityAdapter, and listener middleware.
duration: 100 min
resources:
  - label: Redux Essentials — Async logic
    url: https://redux.js.org/tutorials/essentials/part-5-async-logic
  - label: Deriving data with selectors
    url: https://redux.js.org/usage/deriving-data-selectors
  - label: RTK — createEntityAdapter
    url: https://redux-toolkit.js.org/api/createEntityAdapter
---

## createAsyncThunk

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchPosts = createAsyncThunk(
  'posts/fetchAll',
  async (_, { signal, rejectWithValue }) => {
    const res = await fetch('/api/posts', { signal });
    if (!res.ok) return rejectWithValue({ status: res.status });
    return res.json();                       // becomes action.payload
  },
  {
    // Skip the request if one is already running or data is loaded
    condition: (_, { getState }) => getState().posts.status === 'idle',
  }
);
```

It dispatches **`posts/fetchAll/pending`**, then either **`/fulfilled`** or **`/rejected`**.

```js
const postsSlice = createSlice({
  name: 'posts',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message;
      });
  },
});
```

- `reducers` defines **this slice's own** actions. `extraReducers` responds to actions **defined elsewhere** (thunks, other slices).
- In a component, `await dispatch(fetchPosts()).unwrap()` returns the payload or **throws** the rejection. That's useful for form submissions.
- The returned promise has `.abort()`. Call it in an effect cleanup to cancel the request.
- Model status as an **enum** (`'idle' | 'loading' | 'succeeded' | 'failed'`), not several booleans.

## Memoised selectors

```js
import { createSelector } from '@reduxjs/toolkit';

const selectTodos = (state) => state.todos.items;
const selectFilter = (state) => state.todos.filter;

export const selectVisibleTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) =>
    filter === 'all' ? todos : todos.filter((t) => (filter === 'done' ? t.done : !t.done))
);
```

- Input selectors run every time. The **output selector only re-runs when an input changes by reference**, and otherwise returns the cached result, which keeps `useSelector` stable.
- The default cache holds the most recent arguments. Since Reselect 5, `createSelector` uses `weakMapMemoize`, which can cache several argument sets.
- ✗ An identity output selector (`(x) => x`) is pointless.
- ✗ An input selector that returns a new reference (`state => state.items.map(...)`) breaks memoisation.

```js
// Selector with an argument
const selectTodoById = createSelector(
  [selectTodos, (state, id) => id],
  (todos, id) => todos.find((t) => t.id === id)
);
useSelector((state) => selectTodoById(state, id));
```

## Normalised state

Store each item **once**, keyed by ID, and refer to it by ID everywhere else:

```js
{
  posts: {
    ids: ['p1', 'p2'],
    entities: {
      p1: { id: 'p1', title: '…', authorId: 'u1' },
      p2: { id: 'p2', title: '…', authorId: 'u2' },
    },
  },
}
```

Benefits: O(1) lookups, no duplicated data getting out of sync, and updating one item doesn't create new references for the others.

### createEntityAdapter

```js
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState({ status: 'idle' }),
  reducers: {
    postAdded: postsAdapter.addOne,
    postUpdated: postsAdapter.updateOne,   // payload: { id, changes }
    postRemoved: postsAdapter.removeOne,
  },
  extraReducers: (b) => b.addCase(fetchPosts.fulfilled, postsAdapter.setAll),
});

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state) => state.posts);
```

**Performance pattern:** the list selects only `ids`, and each row is a component that selects its own entity by ID. Updating one post then re-renders one row.

## Listener middleware (reactive side effects)

```js
import { createListenerMiddleware } from '@reduxjs/toolkit';

const listener = createListenerMiddleware();
listener.startListening({
  actionCreator: todoAdded,
  effect: async (action, api) => {
    api.cancelActiveListeners();   // "takeLatest"
    await api.delay(500);          // debounce
    await saveTodos(api.getState().todos.items);
  },
});

configureStore({
  reducer,
  middleware: (getDefault) => getDefault().prepend(listener.middleware),
});
```

## Practice

1. Build a posts feature with `createAsyncThunk`, status handling and `unwrap()` in an add-post form.
2. Normalise a nested API response (posts → comments → authors) with entity adapters.
3. Write a memoised selector for "posts by author, sorted, with a comment count", and prove with a test that it returns the same reference when unrelated state changes.
