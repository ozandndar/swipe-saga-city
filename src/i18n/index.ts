import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
  en: { translation: require('../locales/en').default },
  tr: { translation: require('../locales/tr').default },
  es: { translation: require('../locales/es').default },
  fr: { translation: require('../locales/fr').default },
  de: { translation: require('../locales/de').default },
  it: { translation: require('../locales/it').default },
  pt: { translation: require('../locales/pt').default },
  ja: { translation: require('../locales/ja').default },
  zh: { translation: require('../locales/zh').default },
  ru: { translation: require('../locales/ru').default },
  hi: { translation: require('../locales/hi').default },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.locale.split('-')[0] || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  } as const);

export default i18n; 