import { getCollection } from 'astro:content';

export async function getLessons(phase?: number) {
  const all = await getCollection('lessons');
  return all
    .filter((l) => phase === undefined || l.data.phase === phase)
    .sort((a, b) => a.data.phase - b.data.phase || a.data.order - b.data.order);
}

export async function getChallenges(phase?: number) {
  const all = await getCollection('challenges');
  return all
    .filter((c) => phase === undefined || c.data.phase === phase)
    .sort((a, b) => a.data.phase - b.data.phase || a.data.order - b.data.order);
}

export async function getQuizzes() {
  return (await getCollection('quizzes')).sort((a, b) => a.data.phase - b.data.phase);
}
