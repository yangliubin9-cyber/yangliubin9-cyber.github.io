import { defaultLocale, locales, type Locale } from '../data/site';

const basePrefix = (() => {
  const raw = import.meta.env.BASE_URL ?? '/';
  return raw === '/' ? '' : raw.replace(/\/$/, '');
})();

export function withBase(path: string) {
  const normalized = path === '/' ? '/' : `/${path.replace(/^\/+/, '')}`;
  return basePrefix ? `${basePrefix}${normalized}` : normalized;
}

export function localePath(locale: Locale, segment = '') {
  const clean = segment.replace(/^\/+|\/+$/g, '');
  const target = clean ? `/${locale}/${clean}/` : `/${locale}/`;
  return withBase(target);
}

export function rootPath() {
  return localePath(defaultLocale);
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'zh' ? 'en' : 'zh';
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
