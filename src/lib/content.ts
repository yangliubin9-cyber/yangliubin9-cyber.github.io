import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale, SeriesSlug } from '../data/site';

export type PostEntry = CollectionEntry<'posts'>;

function sortPosts(entries: PostEntry[]) {
  return [...entries].sort(
    (left, right) => right.data.publishedAt.getTime() - left.data.publishedAt.getTime()
  );
}

export async function getPosts(locale: Locale) {
  const posts = await getCollection('posts', ({ data }) => data.locale === locale);
  return sortPosts(posts);
}

export async function getFeaturedPosts(locale: Locale) {
  const posts = await getPosts(locale);
  return posts.filter((item) => item.data.featured);
}

export async function getPostBySlug(locale: Locale, slug: string) {
  const posts = await getCollection(
    'posts',
    ({ data }) => data.locale === locale && data.pathSlug === slug
  );
  return posts[0];
}

export async function getPostsBySeries(locale: Locale, seriesSlug: SeriesSlug) {
  const posts = await getCollection(
    'posts',
    ({ data }) => data.locale === locale && data.series === seriesSlug
  );
  return sortPosts(posts);
}

export async function getRelatedPosts(locale: Locale, seriesSlug: SeriesSlug, slug: string) {
  const posts = await getPostsBySeries(locale, seriesSlug);
  return posts.filter((item) => item.data.pathSlug !== slug).slice(0, 3);
}

export function formatPublishDate(locale: Locale, value: Date) {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(value);
}

export function getReadingLabel(locale: Locale, minutes: number) {
  return locale === 'zh' ? `${minutes} 分钟阅读` : `${minutes} min read`;
}
