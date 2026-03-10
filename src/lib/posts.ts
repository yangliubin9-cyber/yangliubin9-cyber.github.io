import type { CollectionEntry } from 'astro:content';
import type { Locale } from './site';

export function sortPosts(posts: CollectionEntry<'posts'>[]) {
  return [...posts].sort(
    (left, right) => right.data.publishedAt.getTime() - left.data.publishedAt.getTime()
  );
}

export function formatDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function findTranslation(
  posts: CollectionEntry<'posts'>[],
  translationKey: string,
  locale: Locale
) {
  return posts.find((post) => post.data.translationKey === translationKey && post.data.locale === locale);
}
