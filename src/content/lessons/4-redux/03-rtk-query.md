---
title: RTK Query
phase: 4
week: 10
order: 3
summary: Defining an API slice, queries and mutations, cache lifetime, tag invalidation, optimistic updates, and testing Redux apps.
duration: 100 min
resources:
  - label: RTK Query overview
    url: https://redux-toolkit.js.org/rtk-query/overview
  - label: Redux Essentials — RTK Query basics
    url: https://redux.js.org/tutorials/essentials/part-7-rtk-query-basics
  - label: Writing tests for Redux
    url: https://redux.js.org/usage/writing-tests
---

## Why RTK Query?

Hand-written thunks for every endpoint repeat the same work: loading flags, caching, de-duplication, refetching and invalidation. RTK Query is a **server-state cache** built into RTK. It generates hooks and handles all of that for you.

## Defining an API

```js
// services/api.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Post'],
  endpoints: (build) => ({
    getPosts: build.query({
      query: () => '/posts',
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Post', id })),
        { type: 'Post', id: 'LIST' },
      ],
    }),
    getPost: build.query({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    addPost: build.mutation({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
    updatePost: build.mutation({
      query: ({ id, ...patch }) => ({ url: `/posts/${id}`, method: 'PATCH', body: patch }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
    }),
  }),
});

export const { useGetPostsQuery, useGetPostQuery, useAddPostMutation, useUpdatePostMutation } = api;
```

```js
// store
configureStore({
  reducer: { [api.reducerPath]: api.reducer, auth: authReducer },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});
```

## Using the hooks

```jsx
function PostsList() {
  const { data: posts = [], isLoading, isFetching, isError, error, refetch } = useGetPostsQuery();
  if (isLoading) return <Spinner />;               // first load, no data yet
  if (isError) return <ErrorMsg error={error} />;
  return (
    <ul style={{ opacity: isFetching ? 0.6 : 1 }}> {/* background refetch */}
      {posts.map((p) => <li key={p.id}>{p.title}</li>)}
    </ul>
  );
}

function AddPost() {
  const [addPost, { isLoading }] = useAddPostMutation();
  async function onSubmit(values) {
    try { await addPost(values).unwrap(); }
    catch (err) { /* show error */ }
  }
}
```

- `isLoading` means the first fetch, with no data yet. `isFetching` means *any* request in flight, including refetches.
- Use `skip: !id` or `skipToken` for conditional queries.
- Options: `pollingInterval`, `refetchOnMountOrArgChange`, `refetchOnFocus` (requires `setupListeners`).
- Use `selectFromResult` to subscribe to only part of the result and avoid re-renders.

## Cache behaviour

- Each **endpoint + serialised argument** is one cache entry.
- Multiple components using the same query share **one request and one entry**, so requests are de-duplicated.
- When the last subscriber unmounts, the entry is removed after `keepUnusedDataFor` (default **60 seconds**).
- **Tags**: a query `provides` tags and a mutation `invalidates` them. Any active query with an invalidated tag **refetches automatically**.

## Optimistic updates

```js
updatePost: build.mutation({
  query: ({ id, ...patch }) => ({ url: `/posts/${id}`, method: 'PATCH', body: patch }),
  async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
    const patchResult = dispatch(
      api.util.updateQueryData('getPost', id, (draft) => {
        Object.assign(draft, patch);      // Immer draft
      })
    );
    try {
      await queryFulfilled;
    } catch {
      patchResult.undo();                  // roll back on failure
    }
  },
}),
```

*Pessimistic* updates follow the same shape, but call `updateQueryData` **after** `await queryFulfilled`, using the server's response.

## Code-splitting endpoints

```js
const extendedApi = api.injectEndpoints({
  endpoints: (build) => ({ getUsers: build.query({ query: () => '/users' }) }),
});
```

## Testing Redux apps

The Redux team recommends **integration tests** that render components with a **real store** and mock the network with MSW:

```jsx
export function renderWithProviders(ui, { preloadedState = {}, store = setupStore(preloadedState) } = {}) {
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

test('shows posts', async () => {
  renderWithProviders(<PostsList />);
  expect(await screen.findByText('First post')).toBeInTheDocument();
});
```

- Reducers and selectors are pure functions, so unit test them directly.
- Don't test the internals of `createSlice` or RTK Query. Test what the user sees.

## Redux vs. alternatives

| Need | Good fit |
| --- | --- |
| Server data caching | RTK Query / TanStack Query |
| Small amounts of shared UI state | Context + `useReducer`, Zustand |
| Large app, complex client state, DevTools, strict patterns | Redux Toolkit |

## Practice

1. Convert a thunk-based posts feature to RTK Query with list and item tags.
2. Add an optimistic "like" mutation that rolls back on error. Simulate the failure with MSW.
3. Write integration tests for the list, add and update flows using `renderWithProviders`.
