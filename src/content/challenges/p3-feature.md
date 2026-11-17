---
title: "Feature Build: Paginated Product Explorer"
phase: 3
order: 2
difficulty: Expert
timeLimit: 120 min
summary: Build a filterable, paginated list with URL state, a detail route, loading and error states, optimistic favourites and RTL tests.
---

## Brief

Build a product explorer with **Vite + React 19 + React Router**, using `https://dummyjson.com/products` as the API.

```
GET /products?limit=12&skip=0&select=title,price,thumbnail,category
GET /products/search?q=phone
GET /products/category/{slug}
GET /products/{id}
GET /products/categories
```

## Requirements

1. **The list route `/`** shows a 12-per-page grid with Prev/Next and a "Page 2 of 17" indicator.
2. **Search** is debounced with a custom `useDebouncedValue` hook. **Category** is a `<select>`. Both, plus the page, live in the URL via `useSearchParams`, so the back button and refresh restore them.
3. **The detail route `/products/:id`** is lazy-loaded with `React.lazy` and has a Suspense fallback.
4. **Data fetching** goes through a custom `useFetch(url)` hook that's race-safe with `AbortController` and returns `{ data, error, status }`. Bonus: swap in TanStack Query.
5. **Favourites** are toggled with ♥, persisted to `localStorage` through a `useLocalStorage` hook, and shared via context. Keep the context value memoised.
6. **States**: skeleton loading, empty results, and an error with retry. Wrap the routes in an error boundary.
7. **Performance**: product cards are `memo`'d; nothing re-renders the grid when only the favourite count in the header changes.
8. **Accessibility**: focus moves to the page `h1` on route change, the pagination is a `nav` with `aria-label`, and the current page has `aria-current="page"`.

## Required tests (Vitest + RTL + MSW)

- Typing in search updates the URL and shows matching products.
- Pagination: "Next" shows page 2 and "Prev" is disabled on page 1.
- An API error shows the error state, and clicking retry recovers.
- Toggling a favourite updates the header count and persists across a re-render.

## Rubric (100)

| Criterion | Pts |
| --- | --- |
| Correct URL state & routing | 15 |
| Custom hooks (debounce, fetch, local storage), race-safe | 20 |
| Suspense, lazy loading & error boundary | 10 |
| Context design & memoisation (verified in the Profiler) | 15 |
| UI states | 10 |
| Accessibility | 10 |
| Tests | 20 |
