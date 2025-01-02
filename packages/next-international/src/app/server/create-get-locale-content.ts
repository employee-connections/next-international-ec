import type { BaseLocale, ImportedLocales } from 'international-types';
import { flattenLocale } from '../../common/flatten-locale';
import { getLocaleCache } from './get-locale-cache';

export function createGetLocaleContent<Locales extends ImportedLocales>(locales: Locales) {
  const localeCache = new Map<string, BaseLocale>();

  return async function getLocaleContent() {
    const locale = await getLocaleCache();
    const cached = localeCache.get(locale);
    if (cached) {
      return cached;
    }

    const localeContent = flattenLocale((await locales[locale]()).default);
    localeCache.set(locale, localeContent);

    return localeContent;
  };
}
