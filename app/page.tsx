'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import Footer from '@/components/Footer';

// Define the structure of our messages
interface Messages {
  [key: string]: string | Messages;
}

export default function HomePage() {
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

  // If messages are not loaded yet, show a loading state
  if (!messages.HomePage) {
    return <div>Loading...</div>;
  }

  const t = (key: string): string => {
    // Simple translation function
    const keys = key.split('.');
    let value: string | Messages = messages;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Messages)[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    return typeof value === 'string' ? value : key;
  };

  const mathGames = [
    {
      title: "Number Sense",
      description: "Build number sense with simple addition games. Cool math games for kids to learn counting and number recognition.",
      color: "bg-blue-100 border-blue-200",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
      icon: "🔢",
      href: "/number-sense"
    },
    {
      title: "Addition Practice",
      description: "Practice addition up to 20 with fun math games. Free and fun addition games online for kids.",
      color: "bg-green-100 border-green-200",
      buttonColor: "bg-green-500 hover:bg-green-600",
      icon: "➕",
      href: "/addition"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      <main>
        {/* Hero Section - Compact */}
        <section className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                {t('HomePage.welcome')}
              </h2>
              <p className="text-gray-700 text-lg mb-4">
                {t('HomePage.description')}
              </p>
              <div className="flex justify-center gap-3 mb-2">
                <span className="text-3xl animate-bounce">🎯</span>
                <span className="text-3xl animate-bounce delay-100">🎮</span>
                <span className="text-3xl animate-bounce delay-200">🏆</span>
              </div>
            </div>
          </div>
        </section>

        {/* Math Games Grid - All 5 games visible */}
        <section className="container mx-auto px-4 pb-6">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('HomePage.chooseAdventure')}</h3>
            <p className="text-gray-600">{t('HomePage.pickGame')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-7xl mx-auto">
            {mathGames.map((game, index) => (
              <div
                key={index}
                className={`${game.color} border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group flex flex-col rounded-lg`}
              >
                <div className="p-6 text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{game.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{game.description}</p>
                  <div className="mt-4">
                    <button 
                      onClick={() => window.location.href = game.href }
                      className={`${game.buttonColor} text-white font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all text-sm`}
                    >
                      {t('HomePage.startGame')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-700 text-lg mb-4">
              {t('HomePage.exploreGames')}
            </p>
            <p className="text-gray-700 text-lg mb-4">{t('HomePage.varietyGames')}</p>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {t('HomePage.platformDescription')}
            </p>
          </div>
        </section>

        {/* Educational Content Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('HomePage.whyImportant')}</h3>
            <p className="text-gray-700 mb-6">
              {t('HomePage.engagementDesc')}
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">{t('HomePage.engagement')}</h4>
                <p className="text-gray-700">{t('HomePage.engagementDesc')}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-2">{t('HomePage.feedback')}</h4>
                <p className="text-gray-700">{t('HomePage.feedbackDesc')}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-800 mb-2">{t('HomePage.understanding')}</h4>
                <p className="text-gray-700">{t('HomePage.understandingDesc')}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-800 mb-2">{t('HomePage.problemSolving')}</h4>
                <p className="text-gray-700">{t('HomePage.problemSolvingDesc')}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              {t('HomePage.educationalDesign')}
            </p>
            
            <h4 className="text-xl font-semibold text-gray-800 mb-4">{t('HomePage.onlineBenefits')}</h4>
            <p className="text-gray-700 mb-4">
              {t('HomePage.onlineBenefitsDesc')}
            </p>
            <p className="text-gray-700">
              {t('HomePage.research')}
            </p>
          </div>
        </section>

        {/* Fun Stats Section */}
        <section className="bg-white/50 backdrop-blur-sm py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              <div className="group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600">Problems Solved</div>
              </div>
              <div className="group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">👨‍👩‍👧‍👦</div>
                <div className="text-3xl font-bold text-green-600 mb-2">5,000+</div>
                <div className="text-gray-600">Happy Families</div>
              </div>
              <div className="group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🏆</div>
                <div className="text-3xl font-bold text-purple-600 mb-2">50,000+</div>
                <div className="text-gray-600">Achievements Earned</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* <Footer /> */}
    </div>
  );
}
