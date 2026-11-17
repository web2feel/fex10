---
title: Scope, Hoisting & Closures
phase: 2
week: 3
order: 1
summary: Lexical scope, the TDZ, hoisting rules, and closures, including the classic loop bug and practical patterns.
duration: 80 min
resources:
  - label: javascript.info — Closures
    url: https://javascript.info/closure
  - label: You Don't Know JS Yet — Scope & Closures
    url: https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-closures
  - label: MDN — Closures
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
---

## Lexical scope

Scope is decided by **where code is written**, not where it's called. Lookups walk outward through nested scopes until they reach the global scope.

| Declaration | Scope | Hoisted? | Before declaration |
| --- | --- | --- | --- |
| `var` | Function | Yes, initialised to `undefined` | `undefined` |
| `let` / `const` | Block | Yes, **uninitialised** | `ReferenceError` (TDZ) |
| `function` declaration | Function/block | Yes, **with its body** | Callable |
| `class` | Block | Yes, uninitialised | `ReferenceError` |
| Function expression | Follows its variable | Only the variable | Depends on `var`/`let` |

```js
console.log(a); // undefined
var a = 1;

console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 2;

greet();        // works
function greet() { console.log('hi'); }

hello();        // TypeError: hello is not a function
var hello = () => {};
```

### The Temporal Dead Zone

```js
let x = 'outer';
{
  console.log(x); // ReferenceError, not 'outer'!
  let x = 'inner';
}
```

The inner `x` is hoisted to the top of the block, which shadows the outer one, but it's uninitialised until its declaration line.

## Closures

A closure is a function **plus the environment it was created in**. The function keeps a live reference to the variables, not a copy of them.

```js
function counter() {
  let count = 0;
  return {
    inc: () => ++count,
    get: () => count,
  };
}
const c = counter();
c.inc(); c.inc();
c.get(); // 2: `count` lives on in the closure
```

### The classic loop bug

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));
// 3 3 3: one shared `i` (function scoped)

for (let i = 0; i < 3; i++) setTimeout(() => console.log(i));
// 0 1 2: `let` creates a fresh binding per iteration
```

### Stale closures

Closures capture *the variable*, but in React each render creates *new* variables. A callback created during render 1 sees render 1's values. That's the root of most `useEffect` and `setInterval` bugs you'll meet in Phase 3.

```js
function makeLogger() {
  let msg = 'first';
  const log = () => console.log(msg);
  msg = 'second';
  return log;
}
makeLogger()(); // 'second': live binding, not a snapshot
```

## Practical closure patterns

```js
// Memoisation
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn.apply(this, args));
    return cache.get(key);
  };
}

// once()
function once(fn) {
  let called = false, result;
  return function (...args) {
    if (!called) { called = true; result = fn.apply(this, args); }
    return result;
  };
}

// Module pattern / private state
const bank = (() => {
  let balance = 0;
  return { deposit: (n) => (balance += n), balance: () => balance };
})();
```

## Strict mode and globals

In sloppy mode, assigning to an undeclared variable creates a global. ES modules and classes are **always strict**. At the top level of a script, `var` creates a property on `globalThis`; `let` and `const` don't.

## Practice

1. Predict the output of 10 hoisting snippets, then run them.
2. Implement `memoize`, `once` and a `createStore(reducer)` with private state.
3. Explain, in writing, why the `var` loop prints `3 3 3`, using the term "environment record".
