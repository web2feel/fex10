---
title: The Modern Cascade & Selectors
phase: 1
week: 1
order: 2
summary: Specificity maths, cascade layers, :is/:where/:has, custom properties and inheritance, the rules that decide which style wins.
duration: 70 min
resources:
  - label: MDN — Cascade, specificity and inheritance
    url: https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_and_inheritance
  - label: MDN — @layer
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/@layer
  - label: MDN — :has()
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/:has
---

## The cascade, in order

When two declarations target the same property on the same element, the browser picks a winner by checking these in order:

1. **Origin & importance**: user-agent → user → author; `!important` reverses the order.
2. **Context**: shadow DOM encapsulation.
3. **Element-attached styles**: the `style=""` attribute.
4. **Cascade layers**: later layers win; *unlayered* styles beat all layers.
5. **Specificity**
6. **Order of appearance**: last one wins.

Note that layers are checked **before** specificity. A low-specificity selector in a later layer beats an ID selector in an earlier one.

## Specificity

Specificity is a triple **(A, B, C)**:

- **A**: ID selectors
- **B**: classes, attributes, pseudo-classes
- **C**: type selectors, pseudo-elements

The universal selector `*` and combinators add nothing.

| Selector | Specificity |
| --- | --- |
| `ul li` | (0,0,2) |
| `.nav a:hover` | (0,2,1) |
| `#app .btn` | (1,1,0) |
| `:is(#a, .b) p` | (1,0,1) (takes the **most specific** argument) |
| `:where(#a, .b) p` | (0,0,1) (`:where` is always **zero**) |
| `:not(.x)` | (0,1,0) (takes its argument's specificity) |
| `a::before` | (0,0,2) |

## Cascade layers

```css
@layer reset, base, components, utilities;

@layer reset { * { margin: 0; } }
@layer components { #sidebar .card { padding: 2rem; } }
@layer utilities { .p-0 { padding: 0; } } /* wins over #sidebar .card */
```

- The **first** declaration of the layer order sets precedence.
- For `!important` the order is reversed: `!important` in an **earlier** layer wins.
- Import third-party CSS into a layer: `@import url(lib.css) layer(vendor);`

## Relational & functional pseudo-classes

```css
/* Parent selector: style a card that contains an image */
.card:has(> img) { grid-template-rows: 200px auto; }

/* Form field state bubbling up */
.field:has(input:user-invalid) label { color: crimson; }

/* Quantity query: a list with 5+ items */
ul:has(> li:nth-child(5)) { columns: 2; }

/* Forgiving selector list */
:is(h1, h2, h3):hover { color: var(--accent); }
```

## Custom properties

Custom properties **inherit**, are **resolved at computed-value time**, and can be changed at runtime from JS. That makes them different from Sass variables, which are compiled away.

```css
:root { --space: 1rem; --brand: oklch(62% 0.19 40); }
.card { padding: var(--space); border-color: var(--brand, red); }
.card.compact { --space: .5rem; } /* re-scopes for descendants */
```

`@property` lets you type a custom property, which makes it animatable:

```css
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
.spinner { background: conic-gradient(from var(--angle), red, blue); animation: spin 2s linear infinite; }
@keyframes spin { to { --angle: 360deg; } }
```

> **Trap:** `var(--missing)` with no fallback makes the declaration **invalid at computed-value time**. The property then falls back to `inherit` or `initial`, *not* to the previous declaration in the cascade.

## Inheritance keywords

`inherit`, `initial`, `unset` (inherit if the property is inherited, otherwise initial), `revert` (back to the user-agent style) and `revert-layer` (back to the previous layer).

## Practice

1. Calculate the specificity of 10 selectors, then verify in DevTools.
2. Refactor a stylesheet riddled with `!important` into `@layer`s with no `!important`.
3. Build a form where the submit button is disabled-looking (with CSS only) until all fields are valid, using `:has()`.
