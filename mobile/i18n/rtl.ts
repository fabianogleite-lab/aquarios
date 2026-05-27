import { I18nManager } from 'react-native';

const RTL_LOCALES = ['fa', 'fa-IR', 'he', 'he-IL', 'ar'];

export function applyRTL(locale: string): boolean {
  const isRTL = RTL_LOCALES.some(l => locale.startsWith(l));
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
  return isRTL;
}

export function isRTLLocale(locale: string): boolean {
  return RTL_LOCALES.some(l => locale.startsWith(l));
}
