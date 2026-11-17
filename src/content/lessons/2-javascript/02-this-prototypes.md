---
title: "`this`, Prototypes & Classes"
phase: 2
week: 3
order: 2
summary: The four binding rules for this, arrow functions, the prototype chain, and what class syntax actually does, including private fields.
duration: 80 min
resources:
  - label: javascript.info — Object methods, "this"
    url: https://javascript.info/object-methods
  - label: javascript.info — Prototypal inheritance
    url: https://javascript.info/prototype-inheritance
  - label: MDN — Classes
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
---

## How `this` is determined

`this` is decided by **how a function is called**, not where it's defined. Arrow functions are the exception. Check the rules in this order:

1. **`new` binding**: `new Foo()` → the freshly created object.
2. **Explicit binding**: `fn.call(obj)`, `fn.apply(obj)`, `fn.bind(obj)` → `obj`.
3. **Implicit binding**: `obj.fn()` → `obj` (whatever is left of the dot *at call time*).
4. **Default**: plain `fn()` → `undefined` in strict mode, `globalThis` in sloppy mode.

**Arrow functions** have no `this` of their own. They use the `this` of the enclosing lexical scope, and `call`/`bind` can't change it.

```js
const user = {
  name: 'Ada',
  regular() { return this?.name; },
  arrow: () => this?.name,
  delayed() { setTimeout(() => console.log(this.name)); },
};

user.regular();           // 'Ada'
const f = user.regular;
f();                      // undefined: lost implicit binding
user.arrow();             // undefined: `this` is module/global scope
user.delayed();           // 'Ada': arrow captures delayed()'s `this`
user.regular.call({ name: 'Grace' }); // 'Grace'
```

### Lost binding in callbacks

```js
class Timer {
  seconds = 0;
  tick() { this.seconds++; }
  start() {
    setInterval(this.tick, 1000);              // ✗ `this` is undefined
    setInterval(() => this.tick(), 1000);      // ✓
    setInterval(this.tick.bind(this), 1000);   // ✓
  }
}
```

Class field arrows (`handle = () => {}`) are bound per instance, at a memory cost of one function per instance.

`bind` is permanent: `fn.bind(a).bind(b)` stays bound to `a`. However, `new` overrides a bound `this`.

## The prototype chain

Every object has an internal `[[Prototype]]` link. Property lookups walk the chain until they find the property or reach `null`.

```js
const animal = { eats: true, walk() { return `${this.name} walks`; } };
const rabbit = Object.create(animal);
rabbit.name = 'Bun';
rabbit.walk();                          // 'Bun walks': found on the prototype, `this` = rabbit
Object.getPrototypeOf(rabbit) === animal; // true
rabbit.hasOwnProperty('eats');          // false
'eats' in rabbit;                       // true
```

- `F.prototype` is the object that becomes `[[Prototype]]` of instances created with `new F()`.
- `obj.__proto__` is a legacy accessor. Use `Object.getPrototypeOf` and `Object.setPrototypeOf` instead.
- **Writes** never go up the chain. Assigning creates an own property, which *shadows* the prototype's.

### What `new` does

```js
function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype);
  const result = Ctor.apply(obj, args);
  return result !== null && (typeof result === 'object' || typeof result === 'function')
    ? result
    : obj;
}
```

## Classes are (mostly) sugar

```js
class Account {
  static #count = 0;            // private static
  #balance = 0;                 // private instance field: hard privacy
  owner;                        // public field

  constructor(owner) { this.owner = owner; Account.#count++; }

  get balance() { return this.#balance; }
  deposit(n) {
    if (n <= 0) throw new RangeError('Positive amounts only');
    this.#balance += n;
    return this;                // chainable
  }
  static get count() { return Account.#count; }
  static isAccount(o) { return #balance in o; } // ergonomic brand check
}

class Savings extends Account {
  constructor(owner, rate) {
    super(owner);               // must call before using `this`
    this.rate = rate;
  }
  deposit(n) { return super.deposit(n * (1 + this.rate)); }
}
```

Differences from constructor functions:

- Classes **must** be called with `new`.
- Class bodies are always strict.
- Class methods are non-enumerable.
- Classes are hoisted but stay in the TDZ until their declaration.
- `#private` fields are invisible to `Object.keys`, `JSON.stringify` and Proxies.

## Composition over inheritance

Deep class hierarchies are brittle. Favour composing small behaviours:

```js
const canFly = (o) => ({ ...o, fly: () => `${o.name} flies` });
const canSwim = (o) => ({ ...o, swim: () => `${o.name} swims` });
const duck = canSwim(canFly({ name: 'Duck' }));
```

## Practice

1. Predict `this` in 12 snippets: callbacks, nested functions, arrows inside methods, `bind` chains.
2. Implement `myNew`, `myBind` (supporting partial application) and `myInstanceOf`.
3. Build an `EventEmitter` class with private listener storage, plus `on`, `off`, `once` and `emit`.
