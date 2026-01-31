import React, { createContext, useContext, useState, useEffect } from 'react';
import frTranslations from '../translations/fr';
import enTranslations from '../translations/en';

const translations = {
  fr: frTranslations,
  en: enTranslations,
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { language, translations: t } = useLanguage();
  
  const translate = (key) => {
    const keys = key.split('.');
    let value = t;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
  
  return { t: translate, language };
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to French
    const savedLanguage = localStorage.getItem('language');
    // If Arabic is saved, reset to French (Arabic is no longer supported)
    if (savedLanguage === 'ar') {
      localStorage.setItem('language', 'fr');
      return 'fr';
    }
    return savedLanguage || 'fr';
  });

  useEffect(() => {
    // Save language to localStorage whenever it changes
    localStorage.setItem('language', language);
    // Update HTML lang attribute
    document.documentElement.lang = language;
    // Set direction to LTR (no RTL needed without Arabic)
    document.documentElement.dir = 'ltr';
    // Remove RTL class if it exists
    document.body.classList.remove('rtl');
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage, 
      translations: translations[language] || translations.fr,
      isRTL: false
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
