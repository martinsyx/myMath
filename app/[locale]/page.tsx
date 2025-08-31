import Script from "next/script";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('HomePage');
  
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
    // {
    //   title: "Subtraction Practice",
    //   description: "Learn subtraction skills with interactive games. Easy math for kids to master subtraction.",
    //   color: "bg-orange-100 border-orange-200",
    //   buttonColor: "bg-orange-500 hover:bg-orange-600",
    //   icon: "➖",
    //   href: "/subtraction"
    // },
    // {
    //   title: "Multiplication Mastery",
    //   description: "Master multiplication tables with kids math games. Fun maths counting games for multiplication practice.",
    //   color: "bg-purple-100 border-purple-200",
    //   buttonColor: "bg-purple-500 hover:bg-purple-600",
    //   icon: "✖️",
    //   href: "/multiplication"
    // },
    // {
    //   title: "Division Practice",
    //   description: "Discover division through fun and engaging activities. Counting game for kids to learn division.",
    //   color: "bg-red-100 border-red-200",
    //   buttonColor: "bg-red-500 hover:bg-red-600",
    //   icon: "➗",
    //   href: "/division"
    // },
  ];

  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": ["WebSite", "WebApplication"],
    "name": t('title'),
    "description": t('description'),
    "inLanguage": "en",
    "applicationCategory": "EducationalApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student",
      "ageRange": "5-12"
    },
    "teaches": [
      "Number Sense",
      "Addition",
      "Subtraction",
      "Multiplication",
      "Division"
    ],
    "publisher": {
      "@type": "Organization",
      "name": "EasyMath"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(defaultSchema)
        }}
      />
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-9QQG8FQB50" strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9QQG8FQB50');
        `}
      </Script>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">

        {/* Hero Section - Compact */}
        <section className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                {t('welcome')}
              </h2>
              <p className="text-gray-700 text-lg mb-4">
                {t('description')}
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
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('chooseAdventure')}</h3>
            <p className="text-gray-600">{t('pickGame')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-7xl mx-auto">
            {mathGames.map((game, index) => (
              <Card
                key={index}
                className={`${game.color} border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group flex flex-col`}
              >
                <CardHeader className="text-center pb-3">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
                  <CardTitle className="text-lg font-bold text-gray-800 mb-2">{game.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">{game.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-0 flex justify-center">
                  <Link href={game.href}>
                    <Button
                      className={`${game.buttonColor} text-white font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all text-sm`}
                    >
                      {t('startGame')}
                    </Button>
                  </Link>
                </CardContent>
                
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-700 text-lg mb-4">
              {t('exploreGames')}
            </p>
            <p className="text-gray-700 text-lg mb-4">{t('varietyGames')}</p>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {t('platformDescription')}
            </p>
          </div>
        </section>

        {/* Educational Content Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('whyImportant')}</h3>
            <p className="text-gray-700 mb-6">
              {t('engagementDesc')}
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">{t('engagement')}</h4>
                <p className="text-gray-700">{t('engagementDesc')}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-2">{t('feedback')}</h4>
                <p className="text-gray-700">{t('feedbackDesc')}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-800 mb-2">{t('understanding')}</h4>
                <p className="text-gray-700">{t('understandingDesc')}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-800 mb-2">{t('problemSolving')}</h4>
                <p className="text-gray-700">{t('problemSolvingDesc')}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              {t('educationalDesign')}
            </p>
            
            <h4 className="text-xl font-semibold text-gray-800 mb-4">{t('onlineBenefits')}</h4>
            <p className="text-gray-700 mb-4">
              {t('onlineBenefitsDesc')}
            </p>
            <p className="text-gray-700">
              {t('research')}
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

       
      </div>
    </>
  );
}
