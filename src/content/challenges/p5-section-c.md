---
title: "Final Exam: Section C (React + Redux Feature)"
phase: 5
order: 2
difficulty: Expert
timeLimit: 90 min
summary: In a provided starter, add a "Team Workload" feature end to end with RTK Query, memoised selectors, accessible UI and tests.
---

> Set a 90-minute timer. Use your capstone repo as the starter.

## Brief

Add a **Team Workload** page at `/team` to your capstone Taskboard.

1. **The API** adds an endpoint `GET /api/members` → `{ id, name, avatar, capacity }[]`, injected into your API slice with `injectEndpoints`.
2. **The page** shows a table: member, assigned tasks (across all projects), points in progress, capacity, and a utilisation bar. Sort by any column with accessible header buttons that update `aria-sort`.
3. **Derived data**: a single memoised selector factory `makeSelectWorkload()` combines member data and task data. Prove it doesn't recompute when an unrelated slice (theme) changes.
4. **Reassign**: each over-capacity member (>100%) gets a "Rebalance" button. It opens a `<dialog>` listing their tasks with a select to reassign each one. Saving fires `updateTask` mutations **optimistically**, and the table updates instantly.
5. **Responsive**: below 700px, the table becomes stacked cards using a container query on the page wrapper, not a media query.
6. **Tests**:
   - The table renders sorted by utilisation, descending by default.
   - Sorting by name toggles `aria-sort`.
   - Rebalancing moves a task and the utilisation updates.
   - A failed reassignment rolls back.

## Marking (100)

| Area | Pts |
| --- | --- |
| Works end to end | 25 |
| RTK Query integration (inject, tags, optimistic) | 20 |
| Selectors & memoisation proof | 15 |
| Accessibility (table semantics, `aria-sort`, dialog focus) | 15 |
| Responsive with a container query | 10 |
| Tests | 15 |

**Pass: ≥ 80**, alongside Section A ≥ 80% and Section B ≥ 80%.
