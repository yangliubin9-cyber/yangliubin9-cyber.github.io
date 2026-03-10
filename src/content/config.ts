import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    locale: z.enum(['zh', 'en']),
    translationKey: z.string(),
    title: z.string(),
    excerpt: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    readingTime: z.string(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    accent: z.enum(['cyan', 'amber', 'violet']).default('cyan'),
    heroEyebrow: z.string().optional()
  })
});

export const collections = {
  posts
};
