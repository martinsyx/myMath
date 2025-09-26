'use client';

import { useState, useEffect } from 'react';

export default function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState('en');

  useEffect(() => {
    // Get current locale from localStorage or default to 'en'
    const savedLocale = typeof window !== 'undefined' ? localStorage.getItem('locale') : 'en';
    const locale = savedLocale && (savedLocale === 'en' || savedLocale === 'zh') ? savedLocale : 'en';
    setCurrentLocale(locale);
  }, []);

  const switchLanguage = () => {
    const newLocale = currentLocale === 'en' ? 'zh' : 'en';
    setCurrentLocale(newLocale);
    
    // Save the new locale to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
    
    // Reload the page to apply the new language
    window.location.reload();
  };

  // return (
  //   <button
  //     onClick={switchLanguage}
  //     className="px-3 py-1 text-sm rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
  //   >
  //     {currentLocale === 'en' ? '切换到中文' : 'Switch to English'}
  //   </button>
  // );
}
