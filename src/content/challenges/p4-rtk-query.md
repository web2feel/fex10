---
title: RTK Query Kanban with Optimistic Moves
phase: 4
order: 2
difficulty: Expert
timeLimit: 90 min
summary: Build a three-column board on RTK Query with tag invalidation, optimistic updates with rollback, and MSW-backed tests.
---

## Brief

Using MSW as the backend, build a board where cards move between **To do / Doing / Done**.

```
GET    /api/cards           → Card[]   { id, title, column, order }
POST   /api/cards           → Card
PATCH  /api/cards/:id       → Card     (body: { column?, order?, title? })
DELETE /api/cards/:id       → 204
```

Make the MSW handler for `PATCH` fail with a 500 whenever the title contains `"fail"`, so you can test rollback.

## Requirements

1. A `createApi` slice with `getCards`, `addCard`, `updateCard` and `deleteCard`.
2. **Tags**: `getCards` provides `{type:'Card', id}` for each card plus `{type:'Card', id:'LIST'}`. `addCard` and `deleteCard` invalidate `LIST`.
3. **`updateCard` is optimistic**: patch the `getCards` cache in `onQueryStarted`, and `undo()` on failure. Show a toast on rollback.
4. Columns use `selectFromResult` to subscribe only to their own cards, so moving a card in "To do" must not re-render "Done". Verify this with the React Profiler.
5. Show `isLoading` (first load) as a skeleton and `isFetching` as a subtle spinner in the header.
6. Moves work with keyboard buttons ("Move right →") on each card. Drag-and-drop is a bonus.

## Required tests

- The initial render shows the cards in their columns.
- Moving a card updates the UI immediately, before the server responds.
- A failed move rolls back and shows the toast.
- Adding a card refetches the list.

## Rubric (100)

API slice & tags (20) · optimistic update with rollback (25) · `selectFromResult` render isolation (15) · loading & fetching UX (10) · accessibility of moves (10) · tests (20).

<details class="solution">
<summary>Optimistic update sketch</summary>

```js
updateCard: build.mutation({
  query: ({ id, ...patch }) => ({ url: `/cards/${id}`, method: 'PATCH', body: patch }),
  async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
    const result = dispatch(
      api.util.updateQueryData('getCards', undefined, (draft) => {
        const card = draft.find((c) => c.id === id);
        if (card) Object.assign(card, patch);
      })
    );
    try { await queryFulfilled; }
    catch { result.undo(); dispatch(toastShown('Move failed, so it was reverted')); }
  },
}),
```

```jsx
const { cards } = useGetCardsQuery(undefined, {
  selectFromResult: ({ data }) => ({
    cards: data?.filter((c) => c.column === column) ?? EMPTY,
  }),
});
```

Note: `filter` returns a new array on every call, so for full isolation wrap it in a per-column `createSelector`, or compare shallowly.

</details>
