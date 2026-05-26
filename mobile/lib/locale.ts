import * as Localization from 'expo-localization';

/** Device locale tag (e.g. 'pt-BR', 'en-US', 'fa-IR') — cached */
let _cached: string | null = null;

export const getDeviceLocale = (): string => {
  if (!_cached) {
    _cached = Localization.getLocales()?.[0]?.languageTag ?? 'pt-BR';
  }
  return _cached;
};

/** Format a date string respecting the user's locale */
export const formatDate = (
  dateStr: string | Date,
  opts?: Intl.DateTimeFormatOptions,
): string =>
  new Date(dateStr).toLocaleDateString(getDeviceLocale(), opts);

/** Format a date string to time (HH:mm) respecting locale */
export const formatTime = (
  dateStr: string | Date,
  opts?: Intl.DateTimeFormatOptions,
): string =>
  new Date(dateStr).toLocaleTimeString(
    getDeviceLocale(),
    opts ?? { hour: '2-digit', minute: '2-digit' },
  );

/** Format a number respecting locale (e.g. 1.234 vs 1,234) */
export const formatNumber = (n: number): string =>
  n.toLocaleString(getDeviceLocale());
