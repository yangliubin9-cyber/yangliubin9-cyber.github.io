import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { seriesSlugs } from './data/site';

const slugField = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    locale: z.enum(['zh', 'en']),
    translationKey: slugField,
    pathSlug: slugField,
    title: z.string(),
    summary: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    readingMinutes: z.number().int().positive(),
    series: z.enum(seriesSlugs),
    seriesOrder: z.number().int().positive(),
    featured: z.boolean().default(false),
    tags: z.array(z.string().min(1)).default([])
  })
});

export const collections = {
  posts
};
