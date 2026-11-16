'use client';

import React, { createContext, useContext, useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  type HotelLocale,
  HOTEL_LOCALE_COOKIE,
  getHotelUiText,
} from '@/lib/i18n/hotel-locale';

interface HotelLocaleContextValue {
  locale: HotelLocale;
  setLocale: (next: HotelLocale) => void;
  isSwitching: boolean;
  ui: ReturnType<typeof getHotelUiText>;
}

const HotelLocaleContext = createContext<HotelLocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
  isSwitching: false,
  ui: getHotelUiText('en'),
});

export function HotelLocaleProvider({
  initialLocale = 'en',
  children,
}: {
  initialLocale?: HotelLocale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<HotelLocale>(initialLocale);
  const [isSwitching, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: HotelLocale) => {
      if (next === locale) return;
      setLocaleState(next);
      if (typeof document !== 'undefined') {
        document.cookie = `${HOTEL_LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      }
      startTransition(() => {
        router.refresh();
      });
    },
    [locale, router]
  );

  const ui = getHotelUiText(locale);

  return (
    <HotelLocaleContext.Provider value={{ locale, setLocale, isSwitching, ui }}>
      {children}
    </HotelLocaleContext.Provider>
  );
}

export function useHotelLocale() {
  return useContext(HotelLocaleContext);
}
