import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      greeting: 'مرحباً بك في شام تشيس!'
    }
  },
  en: {
    translation: {
      greeting: 'Welcome to ShamChess!'
    }
  }
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'ar',
  fallbackLng: 'ar',
  supportedLngs: ['ar', 'en'],
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
