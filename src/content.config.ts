import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { seriesSlugs } from './data/site';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    locale: z.enum(['zh', 'en']),
    pathSlug: z.string(),
    title: z.string(),
    summary: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    readingMinutes: z.number().int().positive(),
    series: z.enum(seriesSlugs),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([])
  })
});

export const collections = {
  posts
};
