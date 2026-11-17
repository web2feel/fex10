export interface Phase {
  id: number;
  slug: string;
  title: string;
  short: string;
  weeks: string;
  tagline: string;
  color: string;
}

export const phases: Phase[] = [
  { id: 1, slug: 'html-css-scss', short: 'HTML/CSS', title: 'Advanced HTML, CSS & SCSS', weeks: 'Weeks 1–2', tagline: 'Semantics, accessibility, modern layout and scalable Sass architecture.', color: '#e85d3f' },
  { id: 2, slug: 'javascript', short: 'JavaScript', title: 'Advanced JavaScript', weeks: 'Weeks 3–5', tagline: 'Closures, `this`, prototypes, the event loop, async patterns and functional techniques.', color: '#d9a400' },
  { id: 3, slug: 'react', short: 'React', title: 'React', weeks: 'Weeks 6–8', tagline: 'Hooks in depth, rendering, effects, performance, React 19 and testing.', color: '#1f8fbf' },
  { id: 4, slug: 'redux', short: 'Redux', title: 'Redux', weeks: 'Weeks 9–10', tagline: 'Redux Toolkit, async thunks, selectors, normalisation and RTK Query.', color: '#7a4fd1' },
  { id: 5, slug: 'capstone', short: 'Capstone', title: 'Capstone & Final Exam', weeks: 'Weeks 11–12', tagline: 'Bring everything together, then sit a timed mock assessment.', color: '#2e9e6a' },
];

export const phaseById = (id: number) => phases.find((p) => p.id === id)!;
export const phaseBySlug = (slug: string) => phases.find((p) => p.slug === slug);
