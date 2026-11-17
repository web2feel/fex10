---
title: Modern Layout — Grid, Flexbox & Container Queries
phase: 1
week: 2
order: 3
summary: Intrinsic layouts with Grid and Flexbox, subgrid, container queries, logical properties and fluid type.
duration: 90 min
resources:
  - label: web.dev — Learn CSS Grid
    url: https://web.dev/learn/css/grid
  - label: MDN — Container queries
    url: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries
  - label: Every Layout
    url: https://every-layout.dev/
---

## Choosing Grid vs Flexbox

- **Flexbox** is one-dimensional and **content-out**: items decide their size and the container distributes leftover space.
- **Grid** is two-dimensional and **layout-in**: the container defines tracks and items are placed into them.

## Grid essentials

```css
.gallery {
  display: grid;
  gap: 1rem;
  /* As many 240px+ columns as fit, stretching to fill */
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
}
```

- `auto-fill` keeps empty tracks. `auto-fit` collapses them, so items stretch.
- `minmax(min(240px, 100%), 1fr)` prevents overflow on narrow screens.
- `fr` distributes **free space** after fixed sizes. `1fr` is really `minmax(auto, 1fr)`, so long content can blow it out. Use `minmax(0, 1fr)` to prevent that.

### Named areas

```css
.page {
  display: grid;
  grid-template:
    "header header" auto
    "nav    main"   1fr
    "footer footer" auto / 220px minmax(0, 1fr);
  min-height: 100dvh;
}
.page > header { grid-area: header; }
@media (width < 700px) {
  .page { grid-template: "header" "main" "nav" "footer" / 1fr; }
}
```

### Subgrid

Subgrid lets nested elements align to the parent's tracks. This is perfect for cards whose titles, bodies and footers should line up across a row.

```css
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.card {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid; /* header / body / footer align across cards */
}
```

## Flexbox essentials

```css
.toolbar { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.toolbar .spacer { margin-inline-start: auto; } /* push the rest to the end */
.item { flex: 1 1 200px; } /* grow, shrink, basis */
```

> **Trap:** flex items have `min-width: auto`, so long words or code blocks overflow. Fix it with `min-width: 0` on the item.

## Container queries

```css
.card-wrap { container: card / inline-size; }

@container card (inline-size > 420px) {
  .card { display: grid; grid-template-columns: 160px 1fr; }
}

/* Container query units */
.card h3 { font-size: clamp(1rem, 4cqi, 1.5rem); }
```

Components now respond to **their slot**, not the viewport, so the same card works in a sidebar and a main column.

## Logical properties

Use `margin-inline`, `padding-block`, `inset-inline-start` and `inline-size` instead of physical left/right/width. Layouts then flip automatically for right-to-left languages and vertical writing modes.

## Fluid type and space

```css
:root {
  --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --step-3: clamp(1.75rem, 1.4rem + 1.8vw, 2.75rem);
}
```

Always combine `vw` with `rem` inside `clamp()` so text still respects user zoom (WCAG 1.4.4).

## Viewport units

`100vh` is wrong on mobile because of browser UI. Use `100dvh` (dynamic), `svh` (smallest) or `lvh` (largest).

## Practice

1. Build a "holy grail" layout with named grid areas that reflows to a single column.
2. Build a card grid using subgrid so card footers align.
3. Build a card component that switches between horizontal and vertical layouts with a container query, then place it in both a sidebar and a main column.
