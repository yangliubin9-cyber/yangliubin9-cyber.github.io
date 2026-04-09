import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale, SeriesSlug } from '../data/site';

export type PostEntry = CollectionEntry<'posts'>;
export type SortOrder = 'asc' | 'desc';

function sortPosts(entries: PostEntry[], order: SortOrder) {
  const direction = order === 'asc' ? 1 : -1;
  return [...entries].sort(
    (left, right) =>
      (left.data.publishedAt.getTime() - right.data.publishedAt.getTime()) * direction
  );
}

export async function getPosts(locale: Locale, order: SortOrder = 'desc') {
  const posts = await getCollection('posts', ({ data }) => data.locale === locale);
  return sortPosts(posts, order);
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

export async function getPostsBySeries(
  locale: Locale,
  seriesSlug: SeriesSlug,
  order: SortOrder = 'desc'
) {
  const posts = await getCollection(
    'posts',
    ({ data }) => data.locale === locale && data.series === seriesSlug
  );
  return sortPosts(posts, order);
}

export async function getRelatedPosts(locale: Locale, seriesSlug: SeriesSlug, slug: string) {
  const posts = await getPostsBySeries(locale, seriesSlug);
  return posts.filter((item) => item.data.pathSlug !== slug).slice(0, 3);
}

export function getSeriesNavigation(posts: PostEntry[], slug: string) {
  const currentIndex = posts.findIndex((item) => item.data.pathSlug === slug);

  return {
    currentIndex,
    total: posts.length,
    previousPost: currentIndex > 0 ? posts[currentIndex - 1] : undefined,
    nextPost: currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : undefined
  };
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
