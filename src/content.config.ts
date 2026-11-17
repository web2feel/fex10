import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    phase: z.number(),
    week: z.number(),
    order: z.number(),
    summary: z.string(),
    duration: z.string().default('60 min'),
    resources: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  }),
});

const quizzes = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/quizzes' }),
  schema: z.object({
    title: z.string(),
    phase: z.number(),
    passMark: z.number().default(80),
    timeLimitMinutes: z.number().default(20),
    questions: z.array(
      z.object({
        q: z.string(),
        code: z.string().optional(),
        options: z.array(z.string()),
        answer: z.number(),
        explain: z.string(),
      })
    ),
  }),
});

const challenges = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/challenges' }),
  schema: z.object({
    title: z.string(),
    phase: z.number(),
    order: z.number(),
    difficulty: z.enum(['Medium', 'Hard', 'Expert']),
    timeLimit: z.string(),
    summary: z.string(),
  }),
});

export const collections = { lessons, quizzes, challenges };
