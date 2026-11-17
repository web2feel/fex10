---
title: SCSS Architecture
phase: 1
week: 2
order: 4
summary: The module system (@use/@forward), maps, mixins vs functions vs placeholders, control flow, and organising a scalable codebase.
duration: 80 min
resources:
  - label: Sass documentation
    url: https://sass-lang.com/documentation/
  - label: Sass — The module system
    url: https://sass-lang.com/documentation/at-rules/use/
  - label: Sass Guidelines (7-1 pattern)
    url: https://sass-guidelin.es/#architecture
---

## The module system: `@use` and `@forward`

`@import` is **deprecated** and will be removed in Dart Sass 3.0. Use the module system:

```scss
// abstracts/_tokens.scss
$brand: #c2410c !default;
$radius: 8px !default;

// abstracts/_index.scss
@forward 'tokens';
@forward 'mixins';

// components/_button.scss
@use '../abstracts' as a;
.btn { border-radius: a.$radius; background: a.$brand; }

// Configure defaults when loading
@use '../abstracts/tokens' with ($brand: #2563eb);
```

Key differences from `@import`:

- **Namespaced** members (`a.$radius`), so there are no global collisions.
- Each module is **loaded once**, so CSS isn't duplicated.
- Members starting with `-` or `_` are **private**.
- `!default` plus `with (...)` is how a module exposes configuration.

## Maps and loops

```scss
@use 'sass:map';

$breakpoints: (sm: 640px, md: 768px, lg: 1024px, xl: 1280px);
$colors: (primary: #c2410c, success: #1f7a4d, danger: #b42318);

@mixin up($bp) {
  @media (min-width: map.get($breakpoints, $bp)) { @content; }
}

@each $name, $value in $colors {
  .text-#{$name} { color: $value; }
  .bg-#{$name}   { background: $value; }
}

.sidebar {
  display: none;
  @include up(md) { display: block; }
}
```

## Mixins vs functions vs placeholders

| Tool | Returns | Use for |
| --- | --- | --- |
| `@mixin` | Declarations / rules | Reusable blocks of CSS, accepts `@content` |
| `@function` | A value | Calculations (`rem()`, colour maths) |
| `%placeholder` + `@extend` | Shared selector | Grouping selectors. Use sparingly: it can't cross media queries and it bloats selectors |

```scss
@use 'sass:math';

@function rem($px, $base: 16px) {
  @return math.div($px, $base) * 1rem;
}

@mixin focus-ring($color: currentColor) {
  outline: 2px solid $color;
  outline-offset: 2px;
}

.input:focus-visible { @include focus-ring(#2563eb); padding: rem(12px); }
```

> **Note:** `/` for division is deprecated. Use `math.div()`. Colour functions like `darken()` are being replaced by `color.adjust()` and `color.scale()` from `sass:color`.

## Nesting & BEM

```scss
.card {
  padding: 1rem;
  &__title { font-weight: 700; }      // .card__title
  &--featured { border-width: 2px; }  // .card--featured
  &:hover { translate: 0 -2px; }
  .theme-dark & { background: #222; } // .theme-dark .card
}
```

Keep nesting **≤ 3 levels**. Deep nesting produces high-specificity selectors that are hard to override.

## Sass variables vs CSS custom properties

Sass variables are resolved at **compile time**. Custom properties are live at **runtime** and cascade. A common pattern is to generate custom properties from a Sass map:

```scss
:root {
  @each $name, $value in $colors {
    --color-#{$name}: #{$value};
  }
}
```

## 7-1 architecture

```
scss/
  abstracts/   tokens, functions, mixins (no CSS output)
  base/        reset, typography
  layout/      header, grid, footer
  components/  button, card, modal
  pages/       home, checkout
  themes/      dark
  vendors/
  main.scss    @use everything
```

## Practice

1. Convert a project using `@import` to `@use`/`@forward` with a configurable token module.
2. Generate a spacing utility scale (`.m-1`…`.m-8`, `.p-*`) from a map with `@each`.
3. Write a `fluid($min, $max)` function that outputs a `clamp()` value.
