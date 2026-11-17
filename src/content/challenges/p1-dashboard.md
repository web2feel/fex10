---
title: Responsive Analytics Dashboard
phase: 1
order: 1
difficulty: Hard
timeLimit: 90 min
summary: Rebuild a dashboard layout from a spec using semantic HTML, Grid, container queries and a modular SCSS architecture.
---

## Brief

Build the static shell of an analytics dashboard. No JavaScript is required except for the modal.

```
┌──────────────────────────── header (logo, search, user menu) ───────────────────────────┐
│ nav         │  h1 "Overview"                                    [Export ▾]              │
│ (collapsible│  ┌ KPI ┐ ┌ KPI ┐ ┌ KPI ┐ ┌ KPI ┐   ← auto-fit, min 200px                   │
│  < 900px)   │  ┌──────── Revenue chart (2 cols) ────────┐ ┌── Top products ──┐           │
│             │  └────────────────────────────────────────┘ └──────────────────┘           │
│             │  ┌──────────────── Recent orders table (full width) ──────────────────┐    │
└─────────────┴────────────────────────────────────────────────────────────────────────────┘
```

## Requirements

1. **Semantics**: `header`, `nav` (labelled), `main` with a single `h1`, a `section` per widget with `aria-labelledby` pointing to its heading, and the orders table with `<caption>`, `<th scope>`.
2. **Layout**: the page shell uses named `grid-template-areas`. Below 900px the nav becomes a top bar.
3. **KPI cards**: a `repeat(auto-fit, minmax(min(200px, 100%), 1fr))` grid. Each KPI card uses a **container query** to show a sparkline only when the card is wider than 260px.
4. **Widgets** use `subgrid` so their header and footer rows align across a row.
5. **The table** scrolls horizontally inside its own wrapper on narrow screens, with `tabindex="0"`, `role="region"` and an `aria-label` so keyboard users can scroll it.
6. **SCSS**: the structure is `abstracts/_tokens.scss` (colour, space and radius maps with `!default`), `abstracts/_mixins.scss` (`up($bp)`, `focus-ring`), `components/*`, `layout/*`, and `main.scss` using only `@use`. Generate `--space-*` custom properties from the space map.
7. **Theming**: dark mode via `prefers-color-scheme`, with all colours from custom properties.
8. **An Export menu** that opens a `<dialog>` with focus returning to the trigger.
9. **No `!important`**, nesting depth ≤ 3, logical properties throughout.

## Starter tokens

```scss
// abstracts/_tokens.scss
$space: (1: .25rem, 2: .5rem, 3: .75rem, 4: 1rem, 6: 1.5rem, 8: 2rem) !default;
$breakpoints: (sm: 600px, md: 900px, lg: 1200px) !default;
$radius: 10px !default;
```

## Rubric (100)

| Criterion | Pts |
| --- | --- |
| Semantic structure & landmarks, table a11y | 20 |
| Shell grid with areas & breakpoint reflow | 15 |
| KPI auto-fit grid + container query | 15 |
| Subgrid alignment | 10 |
| SCSS module architecture (`@use`/`@forward`, maps, mixins) | 20 |
| Theming via custom properties + dark mode | 10 |
| Dialog behaviour & focus handling | 10 |

<details class="solution">
<summary>Reference snippets (try first!)</summary>

```scss
// layout/_shell.scss
@use '../abstracts' as a;

.shell {
  display: grid;
  min-block-size: 100dvh;
  grid-template:
    'header header' auto
    'nav    main'   1fr / 220px minmax(0, 1fr);

  @include a.up(md) { /* desktop is default; see below */ }
  @media (width < 900px) {
    grid-template: 'header' auto 'nav' auto 'main' 1fr / 1fr;
  }
}
```

```scss
// components/_kpi.scss
.kpis { display: grid; gap: var(--space-4); grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); }
.kpi { container: kpi / inline-size; }
.kpi__spark { display: none; }
@container kpi (inline-size > 260px) { .kpi__spark { display: block; } }
```

```scss
// base/_root.scss
@use 'sass:map';
@use '../abstracts/tokens' as t;
:root {
  @each $k, $v in t.$space { --space-#{$k}: #{$v}; }
}
```

</details>
