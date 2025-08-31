'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';

// Define the structure of our messages
interface Messages {
  [key: string]: string | Messages;
}

export default function Footer() {
  const [locale, setLocale] = useState('en');
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    // Get current locale from localStorage or default to 'en'
    const savedLocale = typeof window !== 'undefined' ? localStorage.getItem('locale') : 'en';
    const currentLocale = savedLocale && (savedLocale === 'en' || savedLocale === 'zh') ? savedLocale : 'en';
    setLocale(currentLocale);
    
    // Load the appropriate messages based on the locale
    import(`../messages/${currentLocale}.json`).then((module) => {
      setMessages(module.default);
    });
  }, []);

  const t = (key: string): string => {
    // Simple translation function
    const keys = key.split('.');
    let value: string | Messages = messages;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    return typeof value === 'string' ? value : key;
  };

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center text-white font-bold text-xs">
                +
              </div>
              <span className="text-lg font-bold">{t('Footer.title')}</span>
            </div>
            <p className="text-gray-400 mt-2">{t('Footer.tagline')}</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
              {t('Navigation.about')}
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
              {t('Navigation.contact')}
            </Link>
            <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
              {t('Navigation.privacy')}
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
              {t('Navigation.terms')}
            </Link>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-6 text-center">
          <p className="text-gray-500">
            {t('Footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
