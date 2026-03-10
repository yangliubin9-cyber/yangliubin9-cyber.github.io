import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from './site';

export type PostEntry = CollectionEntry<'posts'>;

export async function getPosts(locale: Locale) {
  const posts = await getCollection('posts', ({ data }) => data.locale === locale);
  return sortPosts(posts);
}

export async function getAllPosts() {
  const posts = await getCollection('posts');
  return sortPosts(posts);
}

export function sortPosts(posts: PostEntry[]) {
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

export function findTranslation(posts: PostEntry[], translationKey: string, locale: Locale) {
  return posts.find((post) => post.data.translationKey === translationKey && post.data.locale === locale);
}

export function getCategories(posts: PostEntry[]) {
  return [...new Set(posts.map((post) => post.data.category))].sort();
}

export function getTags(posts: PostEntry[]) {
  return [...new Set(posts.flatMap((post) => post.data.tags))].sort();
}