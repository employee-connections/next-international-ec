'use client';

import type { ReactNode } from 'react';
import { I18nProviderClient } from '../../locales/client';

type ProviderProps = {
  locale: string;
  children: ReactNode;
  localeContent?: Record<string, unknown>;
};

export function Provider({ locale, children, localeContent }: ProviderProps) {
  return (
    <I18nProviderClient locale={locale} fallback={<p>Loading...</p>} localeContent={localeContent}>
      {children}
    </I18nProviderClient>
  );
}
