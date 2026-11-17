---
title: Type-ahead Search with Cancellation
phase: 2
order: 2
difficulty: Expert
timeLimit: 90 min
summary: A vanilla JS search box with debouncing, request cancellation, caching, keyboard navigation and an accessible combobox.
---

## Brief

Build a country search box in **vanilla JavaScript** (no frameworks) against this API:

```
GET https://restcountries.com/v3.1/name/{query}?fields=name,flags,cca3
```

## Requirements

1. **Debounce** input by 250 ms. Don't search for queries shorter than 2 characters.
2. **Cancel stale requests** with `AbortController`. Only the latest query's results may render.
3. **Cache** results per normalised query (`trim().toLowerCase()`) in a `Map`, with a max of 50 entries and LRU eviction.
4. Show distinct states: idle, loading, results, "No matches" (404) and error with a retry button.
5. **Accessible combobox** (WAI-ARIA APG pattern):
   - `input[role=combobox][aria-expanded][aria-controls][aria-activedescendant]`
   - `ul[role=listbox] > li[role=option][aria-selected]`
   - <kbd>↓</kbd>/<kbd>↑</kbd> move the active option, <kbd>Enter</kbd> selects, <kbd>Esc</kbd> closes
   - A polite live region announces "5 results"
6. Highlight the matched substring with `<mark>`, building DOM nodes rather than using `innerHTML` with user input.
7. Write the logic as a **class** `Typeahead` with `constructor(rootEl, { fetcher, delay })` and a `destroy()` method that removes all listeners and aborts in-flight requests.

## Hints

```js
class LRU {
  #max; #map = new Map();
  constructor(max) { this.#max = max; }
  get(k) {
    if (!this.#map.has(k)) return undefined;
    const v = this.#map.get(k);
    this.#map.delete(k); this.#map.set(k, v); // move to newest
    return v;
  }
  set(k, v) {
    this.#map.delete(k);
    this.#map.set(k, v);
    if (this.#map.size > this.#max) this.#map.delete(this.#map.keys().next().value);
  }
}
```

Inject the `fetcher` so you can unit test the class with a fake one that resolves after a controllable delay. Prove the race-condition handling works by resolving the requests out of order.

## Rubric (100)

| Criterion | Pts |
| --- | --- |
| Debounce + min length | 10 |
| Cancellation; no stale renders (demonstrated with a test) | 20 |
| LRU cache | 15 |
| All UI states | 10 |
| Combobox semantics & keyboard support | 25 |
| Safe highlighting (no XSS) | 10 |
| `destroy()` cleans up everything | 10 |
