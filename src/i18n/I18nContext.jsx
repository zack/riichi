import { createContext, useState, useContext, useEffect } from 'react';

import enTranslations from './translations/en.json';
import jaTranslations from './translations/ja.json';
import koTranslations from './translations/ko.json';
import zh_cnTranslations from './translations/zh_cn.json';

const I18nContext = createContext();

// Available languages
export const LANGUAGES = {
  en: { code: 'en', name: 'English', flag: '🇬🇧' },
  ja: { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ko: { code: 'ko', name: '한국어', flag: '🇰🇷' },
  zh_cn: { code: 'zh_cn', name: '简体中文', flag: '🇨🇳' },
};

const translations = {
  en: enTranslations,
  ja: jaTranslations,
  ko: koTranslations,
  zh_cn: zh_cnTranslations,
};

const LANGUAGE_STORAGE_KEY = 'mahjong-language';
const DEFAULT_LANGUAGE = 'en';

// This is at module level instead of in the provider because the React Compiler
// skips any component with a condition inside of a try
function getStartingLanguage() {
  let saved;

  // Reading localStorage throws when the browser blocks it for the site. This
  // runs before the first render, so it would take the whole page down.
  try {
    saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    saved = null;
  }

  return saved && LANGUAGES[saved] ? saved : DEFAULT_LANGUAGE;
}

export function I18nProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(getStartingLanguage);

  useEffect(() => {
    document.documentElement.lang = currentLanguage.replace('_', '-');
  }, [currentLanguage]);

  const changeLanguage = (languageCode) => {
    if (LANGUAGES[languageCode]) {
      setCurrentLanguage(languageCode);

      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      } catch {
        // localStorage is blocked. The language still lasts until the page is
        // closed.
      }
    }
  };

  // Get nested translation value using dot notation (e.g., "quiz.han")
  const t = (key, fallback = key) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];

    // Navigate through nested object
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Try English as fallback
        let fallbackValue = translations['en'];
        for (const fk of keys) {
          if (
            fallbackValue
            && typeof fallbackValue === 'object'
            && fk in fallbackValue
          ) {
            fallbackValue = fallbackValue[fk];
          } else {
            return fallback;
          }
        }
        return fallbackValue;
      }
    }

    return value || fallback;
  };

  const tEveryLanguage = (key) =>
    Object.values(translations)
      .map((language) =>
        key.split('.').reduce((memo, k) => memo?.[k], language),
      )
      .filter((label) => typeof label === 'string');

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    tEveryLanguage,
    languages: LANGUAGES,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// Custom hook to use translations
export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
