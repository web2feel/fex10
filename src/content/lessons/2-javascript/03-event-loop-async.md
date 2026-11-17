---
title: The Event Loop & Async Patterns
phase: 2
week: 4
order: 3
summary: Call stack, task vs microtask queues, Promise combinators, async/await error handling, cancellation and concurrency control.
duration: 100 min
resources:
  - label: Jake Archibald — In The Loop (talk)
    url: https://www.youtube.com/watch?v=cCOL7MC4Pl0
  - label: javascript.info — Microtasks
    url: https://javascript.info/microtask-queue
  - label: MDN — Using promises
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
---

## The model

JavaScript runs on **one thread** with a **call stack**. The event loop repeats this cycle:

1. Run one **task** (macrotask): a script, a `setTimeout` callback, an event handler, a `MessageChannel` message.
2. Drain the **entire microtask queue**: Promise reactions, `queueMicrotask`, `MutationObserver`. Microtasks queued *during* draining also run now.
3. Possibly **render**: `requestAnimationFrame` callbacks → style → layout → paint.
4. Repeat.

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3')).then(() => console.log('4'));
queueMicrotask(() => console.log('5'));
console.log('6');
// 1 6 3 5 4 2
```

Walkthrough: the synchronous logs (1, 6) run first. Then microtasks run in queue order: 3, then 5. The callback that logs 4 was queued when 3's reaction ran, so it comes after 5. Finally the timer task logs 2.

### async/await is Promise sugar

```js
async function run() {
  console.log('A');
  await null;          // everything after this runs as a microtask
  console.log('B');
}
console.log('start');
run();
console.log('end');
// start A end B
```

An `async` function runs **synchronously until its first `await`**.

> **Trap:** an infinite chain of microtasks starves rendering and timers forever. An infinite chain of `setTimeout` calls doesn't.

## Promise combinators

| Method | Resolves when | Rejects when |
| --- | --- | --- |
| `Promise.all` | **all** fulfil (results in order) | **any** rejects (fail-fast) |
| `Promise.allSettled` | all settle | never |
| `Promise.race` | first to **settle** | first to settle, if it's a rejection |
| `Promise.any` | first to **fulfil** | all reject → `AggregateError` |

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let remaining = promises.length;
    if (remaining === 0) return resolve(results);
    promises.forEach((p, i) => {
      Promise.resolve(p).then((value) => {
        results[i] = value;
        if (--remaining === 0) resolve(results);
      }, reject);
    });
  });
}
```

## Error handling

```js
// ✗ sequential when it needn't be
const a = await getA();
const b = await getB();

// ✓ parallel
const [a2, b2] = await Promise.all([getA(), getB()]);

// ✗ forEach doesn't await
items.forEach(async (i) => await save(i));

// ✓ sequential
for (const i of items) await save(i);
```

- A rejection with no handler fires `unhandledrejection`.
- `try/catch` only catches promises you `await`.
- `return await` matters inside `try`. Without `await`, the rejection escapes the `catch`.

## Cancellation with AbortController

```js
let controller;
async function search(q) {
  controller?.abort();               // cancel the previous request
  controller = new AbortController();
  try {
    const res = await fetch(`/api?q=${encodeURIComponent(q)}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') return null; // expected
    throw err;
  }
}

// Timeouts
fetch(url, { signal: AbortSignal.timeout(5000) });
// Combine signals
fetch(url, { signal: AbortSignal.any([userSignal, AbortSignal.timeout(5000)]) });
```

## Concurrency limiting

```js
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
```

## Retry with exponential backoff

```js
async function retry(fn, { retries = 3, base = 200 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try { return await fn(); }
    catch (e) {
      if (attempt >= retries) throw e;
      await new Promise((r) => setTimeout(r, base * 2 ** attempt + Math.random() * 100));
    }
  }
}
```

## Practice

1. Predict the output order of 10 event-loop puzzles.
2. Implement `promiseAll`, `promiseAny`, `promiseAllSettled`, `sleep`, `timeout(promise, ms)` and `mapLimit`.
3. Build a type-ahead search with debounce, cancellation of stale requests, and a results cache.
