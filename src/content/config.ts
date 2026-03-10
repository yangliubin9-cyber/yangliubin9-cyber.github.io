import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    locale: z.enum(['zh', 'en']),
    translationKey: z.string(),
    pathSlug: z.string(),
    title: z.string(),
    excerpt: z.string(),
    category: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    accent: z.enum(['yellow', 'cyan', 'violet']).default('yellow'),
    heroEyebrow: z.string().optional()
  })
});

export const collections = {
  posts
};