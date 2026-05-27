import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';
import es from './locales/es.json';

const resources = {
  'pt-BR': { translation: ptBR },
  'pt':    { translation: ptBR },
  'en-US': { translation: enUS },
  'en':    { translation: enUS },
  'es':    { translation: es },
  'es-VE': { translation: es },
  'es-PE': { translation: es },
};

const deviceLocale = Localization.getLocales()?.[0]?.languageTag ?? 'pt-BR';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLocale,
    fallbackLng: 'pt-BR',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });

export default i18n;
export { i18n };
