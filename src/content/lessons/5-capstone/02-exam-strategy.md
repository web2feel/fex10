---
title: Final Exam Format & Revision Plan
phase: 5
week: 12
order: 2
summary: The structure of the mock exam, a revision checklist for every phase, and tactics for timed coding rounds.
duration: 1 week
resources:
  - label: javascript.info — full tutorial (revision)
    url: https://javascript.info/
  - label: react.dev — Reference
    url: https://react.dev/reference/react
  - label: Redux Toolkit — API reference
    url: https://redux-toolkit.js.org/api/configureStore
---

## Exam format (3 hours)

| Section | Time | Weight | Format |
| --- | --- | --- | --- |
| A: Concepts | 30 min | 25% | 40 multiple-choice questions across all phases ([Final Mock Quiz](/quiz/final/)) |
| B: JavaScript utilities | 60 min | 35% | 4 implementation problems ([challenges](/phase/capstone/)) |
| C: React + Redux feature | 90 min | 40% | Build a feature in a starter repo ([challenge](/phase/capstone/)) |

**Pass mark: 80% overall**, with no section below 60%.

## Revision checklist

Tick these off on the [Progress page](/progress/) as you complete each phase quiz with ≥ 80%.

### HTML, CSS & SCSS
- [ ] Compute specificity for `:is`, `:where`, `:not`, `:has`
- [ ] Explain the cascade order, including layers and `!important` reversal
- [ ] Build a responsive grid with `auto-fill`/`minmax`, without media queries
- [ ] Container queries vs media queries: when to use each
- [ ] Accessible names, landmarks, `<dialog>`, `inert`, `aria-describedby`
- [ ] `@use` vs `@import`, `!default` + `with()`, mixin vs function vs placeholder

### JavaScript
- [ ] Predict output: hoisting, the TDZ, closures in loops
- [ ] The four `this` rules plus arrows; implement `bind`
- [ ] The prototype chain; implement `new` and `instanceof`
- [ ] Event-loop ordering: sync → microtasks → tasks
- [ ] Implement `Promise.all`/`any`/`allSettled`, debounce, throttle, curry, deep clone
- [ ] Mutating vs non-mutating array methods

### React
- [ ] State as a snapshot; updater functions; batching
- [ ] Keys and reconciliation; resetting state with `key`
- [ ] When *not* to use an effect; cleanup; race conditions; stale closures
- [ ] memo/useMemo/useCallback: when they help and when they don't
- [ ] Context re-render behaviour and how to mitigate it
- [ ] React 19: Actions, `useActionState`, `useOptimistic`, `use`
- [ ] RTL query priority; `getBy` vs `queryBy` vs `findBy`

### Redux
- [ ] The three principles; implement `createStore` and a middleware
- [ ] Immer rules (mutate *or* return)
- [ ] `createAsyncThunk` lifecycle; `extraReducers`; `unwrap()`
- [ ] `createSelector` memoisation and its pitfalls
- [ ] Normalisation with `createEntityAdapter`
- [ ] RTK Query: tags, `isLoading` vs `isFetching`, optimistic updates

## Timed-coding tactics

1. **Read the whole brief first** (5 minutes). List the required behaviours as a checklist.
2. **Get to green fast**: a naive, working solution beats an elegant, unfinished one. Refactor after.
3. **Handle the edge cases explicitly**: empty input, a single item, errors, cancellation, `this` binding.
4. **Narrate your trade-offs** in comments: "O(n) lookup; would normalise if the list grew."
5. **Leave 10 minutes** to re-run the tests and re-read the brief.

## Weekly plan

| Day | Activity |
| --- | --- |
| Mon | Retake Phase 1 & 2 quizzes; redo any challenge below 80% |
| Tue | Retake Phase 3 & 4 quizzes; re-implement 5 utilities from memory |
| Wed | Final Mock Quiz (timed) |
| Thu | Section B challenges (timed, 60 min) |
| Fri | Section C challenge (timed, 90 min) |
| Sat | Review mistakes; write a one-page cheat sheet per phase |
| Sun | Rest 🎉 |
