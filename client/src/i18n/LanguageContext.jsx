import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations, LANGUAGES } from './translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'krishi_lang';

function interpolate(template, params) {
  if (!params || typeof params !== 'object') return template;
  return String(template).replace(/\{(\w+)\}/g, (match, key) =>
    key in params ? String(params[key]) : match
  );
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && translations[saved]) return saved;
    } catch (e) { /* noop */ }
    return 'en';
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* noop */ }
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = useCallback((key, fallbackOrParams, options) => {
    const dict = translations[lang] || {};
    const fallbackDict = translations.en || {};

    let template = dict[key] ?? fallbackDict[key];
    let params = options;

    if (typeof fallbackOrParams === 'string') {
      if (!template) template = fallbackOrParams;
    } else if (typeof fallbackOrParams === 'object' && fallbackOrParams !== null) {
      params = fallbackOrParams;
    }

    if (!template) template = key;

    return interpolate(template, params);
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, languages: LANGUAGES }), [lang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
