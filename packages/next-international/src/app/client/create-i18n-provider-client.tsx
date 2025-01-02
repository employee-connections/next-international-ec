import type { BaseLocale, ImportedLocales } from 'international-types';
import { notFound } from 'next/navigation';
import type { Context, ReactNode } from 'react';
import React, { use, useMemo } from 'react';
import { flattenLocale } from '../../common/flatten-locale';
import { error } from '../../helpers/log';
import type { LocaleContext } from '../../types';

type I18nProviderProps = Omit<I18nProviderWrapperProps, 'fallback'> & {
  importLocale: Promise<Record<string, unknown>>;
};

type I18nProviderWrapperProps = {
  locale: string;
  localeContent?: Record<string, unknown>;
  fallback?: ReactNode;
  children: ReactNode;
};

export const localesCache = new Map<string, Record<string, unknown>>();

export function createI18nProviderClient<Locale extends BaseLocale>(
  I18nClientContext: Context<LocaleContext<Locale> | null>,
  locales: ImportedLocales,
  fallbackLocale?: Record<string, unknown>,
) {
  function I18nProvider({ locale, importLocale, children, localeContent }: I18nProviderProps) {
    let clientLocale: Record<string, unknown> | undefined = undefined;
    if (localeContent) {
      clientLocale = localeContent;
    } else {
      clientLocale = (localesCache.get(locale) ?? use(importLocale).default) as Record<string, unknown>;
    }

    if (!localesCache.has(locale)) {
      localesCache.set(locale, clientLocale);
    }

    if (!clientLocale) {
      throw new Error('Failed to load client locale');
    }

    const value = useMemo(
      () => ({
        localeContent: flattenLocale<Locale>(clientLocale),
        fallbackLocale: fallbackLocale ? flattenLocale<Locale>(fallbackLocale) : undefined,
        locale: locale as string,
      }),
      [clientLocale, locale],
    );

    return <I18nClientContext.Provider value={value}>{children}</I18nClientContext.Provider>;
  }

  return function I18nProviderWrapper({ locale, children, localeContent }: I18nProviderWrapperProps) {
    const importFnLocale = locales[locale as keyof typeof locales];

    if (!importFnLocale) {
      error(`The locale '${locale}' is not supported. Defined locales are: [${Object.keys(locales).join(', ')}].`);
      notFound();
    }

    /**
     * Suspense has been disabled here so that we can load the page with JavaScript disabled and not see
     * the fallback which takes over the entire page. We do not use any of the suspense required features
     * such as client side locale switching, therefore we do not need it.
     */
    return (
      // <Suspense fallback={fallback}>
      <I18nProvider locale={locale} importLocale={importFnLocale()} localeContent={localeContent}>
        {children}
      </I18nProvider>
      // </Suspense>
    );
  };
}
