import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AppLocale, ObjectDef } from './types';
import { L_EN, L as LKo } from './labels';
import type { AppLabels } from './labels';
import { getObjects } from './menuData';
import type { PointSchemeId } from './pointColorSchemes';

export type { AppLocale } from './types';
export type { PointSchemeId } from './pointColorSchemes';

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
  toggleLocale: () => void;
  objects: ObjectDef[];
  L: AppLabels;
  pointScheme: PointSchemeId;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('ko');
  const pointScheme: PointSchemeId = 'unified';

  const objects = useMemo(() => getObjects(locale), [locale]);
  const L = locale === 'en' ? L_EN : LKo;

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'ko' ? 'en' : 'ko'));
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      objects,
      L,
      pointScheme,
    }),
    [locale, setLocale, toggleLocale, objects, L, pointScheme],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
