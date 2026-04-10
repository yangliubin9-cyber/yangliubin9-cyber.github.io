import { getCollection, type CollectionEntry } from 'astro:content';
import { series, type Locale, type Series, type SeriesSlug } from '../data/site';

export type PostEntry = CollectionEntry<'posts'>;
export type SortOrder = 'asc' | 'desc';
export type SeriesTrack = {
  seriesItem: Series;
  posts: PostEntry[];
  startPost: PostEntry;
  featuredPost: PostEntry;
  latestPost: PostEntry;
};

let contentValidated = false;

function sortPostsByPublishDate(entries: PostEntry[], order: SortOrder) {
  const direction = order === 'asc' ? 1 : -1;
  return [...entries].sort(
    (left, right) =>
      (left.data.publishedAt.getTime() - right.data.publishedAt.getTime()) * direction
  );
}

function sortPostsBySeriesOrder(entries: PostEntry[], order: SortOrder) {
  const direction = order === 'asc' ? 1 : -1;
  return [...entries].sort((left, right) => {
    const orderDifference = left.data.seriesOrder - right.data.seriesOrder;

    if (orderDifference !== 0) {
      return orderDifference * direction;
    }

    return (left.data.publishedAt.getTime() - right.data.publishedAt.getTime()) * direction;
  });
}

async function validateContentCollection() {
  if (contentValidated) {
    return;
  }

  const posts = await getCollection('posts');
  const seenLocaleSlug = new Set<string>();
  const seenLocaleTranslationKey = new Set<string>();
  const translations = new Map<string, PostEntry[]>();

  for (const post of posts) {
    const slugKey = `${post.data.locale}:${post.data.pathSlug}`;
    const translationLocaleKey = `${post.data.locale}:${post.data.translationKey}`;

    if (seenLocaleSlug.has(slugKey)) {
      throw new Error(`Duplicate post slug detected: ${slugKey}`);
    }

    if (seenLocaleTranslationKey.has(translationLocaleKey)) {
      throw new Error(`Duplicate translation key detected: ${translationLocaleKey}`);
    }

    seenLocaleSlug.add(slugKey);
    seenLocaleTranslationKey.add(translationLocaleKey);

    const entries = translations.get(post.data.translationKey) ?? [];
    entries.push(post);
    translations.set(post.data.translationKey, entries);
  }

  for (const [translationKey, entries] of translations.entries()) {
    const zhPost = entries.find((item) => item.data.locale === 'zh');
    const enPost = entries.find((item) => item.data.locale === 'en');

    if (!zhPost || !enPost || entries.length !== 2) {
      throw new Error(
        `Translation pair "${translationKey}" must contain exactly one zh post and one en post.`
      );
    }

    if (zhPost.data.pathSlug !== enPost.data.pathSlug) {
      throw new Error(
        `Translation pair "${translationKey}" must use the same pathSlug in zh and en.`
      );
    }

    if (zhPost.data.series !== enPost.data.series) {
      throw new Error(
        `Translation pair "${translationKey}" must stay in the same series in zh and en.`
      );
    }

    if (zhPost.data.seriesOrder !== enPost.data.seriesOrder) {
      throw new Error(
        `Translation pair "${translationKey}" must use the same seriesOrder in zh and en.`
      );
    }
  }

  contentValidated = true;
}

export async function getPosts(locale: Locale, order: SortOrder = 'desc') {
  await validateContentCollection();
  const posts = await getCollection('posts', ({ data }) => data.locale === locale);
  return sortPostsByPublishDate(posts, order);
}

export async function getFeaturedPosts(locale: Locale) {
  const posts = await getPosts(locale);
  return posts.filter((item) => item.data.featured);
}

export async function getPostBySlug(locale: Locale, slug: string) {
  await validateContentCollection();
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
  await validateContentCollection();
  const posts = await getCollection(
    'posts',
    ({ data }) => data.locale === locale && data.series === seriesSlug
  );
  return sortPostsBySeriesOrder(posts, order);
}

export async function getRelatedPosts(locale: Locale, seriesSlug: SeriesSlug, slug: string) {
  const posts = await getPostsBySeries(locale, seriesSlug);
  return posts.filter((item) => item.data.pathSlug !== slug).slice(0, 3);
}

export async function getSeriesTracks(locale: Locale): Promise<SeriesTrack[]> {
  const tracks = await Promise.all(
    series.map(async (seriesItem) => {
      const posts = await getPostsBySeries(locale, seriesItem.slug, 'asc');
      const startPost = posts[0];

      if (!startPost) {
        return undefined;
      }

      const featuredPost = posts.find((item) => item.data.featured) ?? startPost;
      const latestPost = sortPostsByPublishDate(posts, 'desc')[0];

      if (!latestPost) {
        return undefined;
      }

      return {
        seriesItem,
        posts,
        startPost,
        featuredPost,
        latestPost
      };
    })
  );

  return tracks.filter((track): track is SeriesTrack => Boolean(track));
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
