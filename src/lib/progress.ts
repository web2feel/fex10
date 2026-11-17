/** Client-side progress store, persisted in localStorage. */
export interface QuizResult { best: number; last: number; attempts: number; passed: boolean; date: string }
export interface Progress {
  lessons: Record<string, boolean>;
  quizzes: Record<string, QuizResult>;
  challenges: Record<string, boolean>;
}

const KEY = 'fm-progress-v1';
const empty = (): Progress => ({ lessons: {}, quizzes: {}, challenges: {} });

export function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

export function save(p: Progress) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
  window.dispatchEvent(new CustomEvent('fm-progress', { detail: p }));
}

export function toggle(kind: 'lessons' | 'challenges', id: string): boolean {
  const p = load();
  p[kind][id] = !p[kind][id];
  if (!p[kind][id]) delete p[kind][id];
  save(p);
  return !!p[kind][id];
}

export function recordQuiz(id: string, score: number, passMark: number) {
  const p = load();
  const prev = p.quizzes[id];
  p.quizzes[id] = {
    best: Math.max(prev?.best ?? 0, score),
    last: score,
    attempts: (prev?.attempts ?? 0) + 1,
    passed: (prev?.passed ?? false) || score >= passMark,
    date: new Date().toISOString(),
  };
  save(p);
}

export function reset() {
  try { localStorage.removeItem(KEY); } catch {}
  window.dispatchEvent(new CustomEvent('fm-progress', { detail: empty() }));
}
