# Frontend Mastery

A 12-week advanced program for **HTML, CSS, SCSS, JavaScript, React and Redux**, built with [Astro](https://astro.build). It contains lessons, timed quizzes, graded coding challenges, a capstone project and a final mock exam.

## What's inside

| Phase | Weeks | Lessons | Assessment |
| --- | --- | --- | --- |
| 1. Advanced HTML, CSS & SCSS | 1–2 | 4 | Quiz + dashboard challenge |
| 2. Advanced JavaScript | 3–5 | 4 | Quiz + utility belt + type-ahead challenges |
| 3. React | 6–8 | 4 | Quiz + debugging + feature-build challenges |
| 4. Redux | 9–10 | 3 | Quiz + RTK refactor + RTK Query challenges |
| 5. Capstone & Final Exam | 11–12 | 2 | 40-question mock exam (Section A) + Sections B & C |

- **Quizzes** have two modes: *Practice* (instant feedback) and *Exam* (timed, results recorded). Questions and options are shuffled on every attempt. The final exam draws 40 random questions from every quiz.
- **Progress** (completed lessons, quiz best scores, passed challenges) is stored in `localStorage` and shown on `/progress`.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview
```

## Adding content

| Content | Location | Format |
| --- | --- | --- |
| Lessons | `src/content/lessons/<phase-folder>/*.md` | Frontmatter: `title, phase, week, order, summary, duration, resources[]` |
| Quizzes | `src/content/quizzes/*.yaml` | `title, phase, passMark, timeLimitMinutes, questions[{ q, code?, options[], answer, explain }]` |
| Challenges | `src/content/challenges/*.md` | Frontmatter: `title, phase, order, difficulty (Medium/Hard/Expert), timeLimit, summary` |

`answer` is the zero-based index of the correct option. Inline code in quiz text uses backticks. Phases are configured in `src/data/phases.ts`.

## Deploy

**GitHub Pages:** push to `main`, then in the repo go to **Settings → Pages → Source: GitHub Actions**. The workflow in `.github/workflows/deploy.yml` sets the correct base path automatically.

**Netlify / Vercel:** import the repo. The build command is `npm run build` and the output folder is `dist`.
