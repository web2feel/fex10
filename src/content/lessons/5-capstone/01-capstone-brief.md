---
title: "Capstone Brief: Project Tracker"
phase: 5
week: 11
order: 1
summary: The full specification, architecture and grading rubric for a production-quality React + Redux Toolkit application.
duration: 1 week
resources:
  - label: Vite — Getting started
    url: https://vite.dev/guide/
  - label: MSW — Mock Service Worker
    url: https://mswjs.io/docs/
  - label: Redux — Recommended folder structure
    url: https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic
---

## The brief

Build **Taskboard**, a project-tracking app where a user manages projects and their tasks on a Kanban board. It must use **every** phase of the program.

### Functional requirements

1. **Projects list** (`/`): cards with name, progress bar (% of tasks done) and task count. Create, rename and delete projects.
2. **Board** (`/projects/:id`): three columns (To do / Doing / Done). Create, edit and delete tasks. Move tasks between columns with buttons *and* keyboard; drag-and-drop is optional.
3. **Filters**: search by title, filter by assignee and priority. Filters live **in the URL** (`?q=&assignee=&priority=`).
4. **Task detail dialog**: opened via a `<dialog>`, with an accessible form, validation and restored focus.
5. **Theme**: light/dark, respecting `prefers-color-scheme` and persisted.
6. **Optimistic task moves** that roll back if the API fails.

### Technical requirements

| Area | Requirement |
| --- | --- |
| HTML/a11y | Landmarks, one `h1` per route, labelled controls, visible focus, focus moved to `h1` on route change, Lighthouse a11y ≥ 95 |
| CSS/SCSS | `@use`/`@forward` token module, the 7-1 structure (trimmed), a board built with Grid, cards using container queries, no `!important` |
| JavaScript | Utilities (debounce, `groupBy`-based column grouping) written and unit tested |
| React | Function components and hooks, at least two custom hooks, code-split routes with `lazy` + `Suspense`, an error boundary |
| Redux | RTK store; a `ui` slice (filters panel, theme); **RTK Query** for projects and tasks with tag invalidation; at least one `createSelector` |
| Testing | Vitest + RTL + MSW: ≥ 1 reducer test, ≥ 1 selector test, ≥ 3 integration tests |
| Tooling | Vite, ESLint (`react-hooks` plugin), Prettier, TypeScript *(bonus)* |
| Delivery | Deployed (Vercel/Netlify/GitHub Pages), with a README covering architecture decisions |

### Suggested structure

```
src/
  app/            store.ts, hooks.ts, router.tsx
  services/       api.ts (createApi), mocks/ (MSW handlers + db)
  features/
    projects/     ProjectsPage.tsx, ProjectCard.tsx, projects.test.tsx
    tasks/        Board.tsx, Column.tsx, TaskCard.tsx, TaskDialog.tsx, selectors.ts
    ui/           uiSlice.ts, ThemeToggle.tsx
  hooks/          useDebouncedValue.ts, useUrlFilters.ts
  lib/            debounce.ts, groupBy.ts (+ tests)
  styles/         abstracts/, base/, layout/, components/, main.scss
```

### Mock API

Use MSW in the browser as your backend, so no real server is needed:

```
GET    /api/projects             GET    /api/projects/:id/tasks
POST   /api/projects             POST   /api/projects/:id/tasks
PATCH  /api/projects/:id         PATCH  /api/tasks/:id
DELETE /api/projects/:id         DELETE /api/tasks/:id
```

Add a ~400 ms artificial delay, and a `?fail=1` switch to test error and rollback paths.

## Milestones

| Day | Goal |
| --- | --- |
| 1 | Vite setup, SCSS architecture, layout shell, routing, MSW |
| 2 | RTK store, API slice, projects CRUD |
| 3 | Board, columns, task CRUD, selectors |
| 4 | Filters in URL, dialog, optimistic moves |
| 5 | Tests, accessibility pass, performance pass |
| 6 | Deploy, README, self-review against the rubric |

## Grading rubric (100 pts, pass ≥ 80)

| Criterion | Points |
| --- | --- |
| Functional requirements met | 25 |
| Accessibility & semantic HTML | 15 |
| CSS/SCSS architecture & responsive layout | 10 |
| React architecture (state placement, hooks, no unnecessary effects) | 15 |
| Redux / RTK Query usage (tags, selectors, normalisation) | 15 |
| Tests (meaningful, user-centric) | 10 |
| Code quality, README, deploy | 10 |

> **Self-review tip:** for each file, ask "could I explain every line of this in an interview?" If not, simplify it.
