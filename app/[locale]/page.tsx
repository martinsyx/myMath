import Script from "next/script";
import React from "react";
import Link from "next/link";
import { FloatingElements } from "@/components/floating-elements"
import { Metadata } from "@/components/Metadata"
import { getTranslations } from 'next-intl/server';

// Define all individual games
const games = [
  { 
    name: "Counting Games", 
    href: "/number-sense/games/counting",
    description: "Learn to count numbers through fun interactive games",
    image: "/images/counting-game.png"
  },
  {
    name: "Number Matching",
    href: "/number-sense/games/matching",
    description: "Count and match numbers with colorful themes",
    image: "/images/matching-game.svg"
  },
  { 
    name: "Number Sequence", 
    href: "/number-sense/games/sequence",
    description: "Arrange numbers in the correct order",
    image: "/images/sequence-game.png"
  },
  { 
    name: "Odd & Even", 
    href: "/number-sense/patterns/odd-even",
    description: "Identify odd and even numbers",
    image: "/images/odd-even-game.png"
  },
  { 
    name: "Skip Counting", 
    href: "/number-sense/patterns/skipcountinggame",
    description: "Practice counting by 2s, 5s, and 10s",
    image: "/images/skip-counting-game.png"
  },
  { 
    name: "Size Comparison", 
    href: "/number-sense/basics/comparison",
    description: "Compare sizes and quantities",
    image: "/images/comparison-game.png"
  },
  { 
    name: "Quantity Estimation", 
    href: "/number-sense/basics/estimation",
    description: "Estimate quantities without counting",
    image: "/images/estimation-game.png"
  },
];

export default async function HomePage() {
  const t = await getTranslations('HomePage');

  const pageMetadata = {
    title: t('title'),
    description: t('description'),
    path: "/number-sense",
    canonical: "https://kids-math.com/number-sense",
    schemaData: {
      "@type": ["WebPage", "LearningResource"],
      "alternateType": "EducationalApplication",
      "applicationCategory": "EducationalApplication",
      "gamePlatform": ["Web Browser", "Mobile Web"],
      "educationalUse": ["Practice", "Assessment"],
      "interactivityType": "Interactive",
      "learningResourceType": "Game",
      "skillLevel": ["Beginner", "Intermediate"],
      "educationalAlignment": {
        "@type": "AlignmentObject",
        "alignmentType": "teaches",
        "educationalFramework": "Mathematics",
        "targetName": "Number Sense"
      },
      "audience": {
        "@type": "EducationalAudience",
        "educationalRole": "student",
        "ageRange": "5-12"
      },
      "teaches": [
        "Number Sense",
        "Counting",
        "Number Recognition",
        "Skip Counting",
        "Number Patterns",
        "Estimation"
      ],
      "publisher": {
        "@type": "Organization",
        "name": "EasyMath"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  };

  return (
    <>
      <Metadata
        title={pageMetadata.title}
        description={pageMetadata.description}
        path={pageMetadata.path}
        schemaData={pageMetadata.schemaData}
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
      <div className="min-h-screen relative overflow-hidden">
        <FloatingElements />

      <div className="relative z-10">
        <main className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-4 bounce-gentle">
              {t('title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>

          {/* Game Cards Grid - Four per Row */}
          <div className="max-w-7xl mx-auto mb-12">
            <div className="grid grid-cols-4 gap-6">
              {games.map((game, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <Link href={game.href} className="flex flex-col h-full">
                    {/* Game Image */}
                    <div className="w-full p-2">
                      <img
                        src={game.image}
                        alt={game.name}
                        className="rounded-xl w-full h-48 object-cover border-2 border-gray-200"
                        onError={(e) => {
                          // 如果图片加载失败，显示默认的占位符
                          e.currentTarget.onerror = null;
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerHTML = '<div class="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center text-gray-500 text-sm">Game Image</div>';
                          }
                        }}
                      />
                    </div>

                    {/* Game Info */}
                    <div className="flex-1 p-4 pt-0 text-center">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{game.name}</h3>
                      <p className="text-sm text-gray-600">{game.description}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <Link href="/" className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-colors">
              🏠 Back to Home
            </Link>
          </div>

          {/* Educational Content Section */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('understandingTitle')}</h2>
            <p className="text-gray-700 mb-6">
              {t('understandingDesc')}
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('keyComponents')}</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">{t('countingCardinality')}</h4>
                <p className="text-gray-700">{t('countingCardinalityDesc')}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-2">{t('numberRelationships')}</h4>
                <p className="text-gray-700">{t('numberRelationshipsDesc')}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-800 mb-2">{t('baseTenSystem')}</h4>
                <p className="text-gray-700">{t('baseTenSystemDesc')}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-800 mb-2">{t('operationsEstimation')}</h4>
                <p className="text-gray-700">{t('operationsEstimationDesc')}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              {t('gamesDesc')}
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('benefitsTitle')}</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>{t('benefit1')}</li>
              <li>{t('benefit2')}</li>
              <li>{t('benefit3')}</li>
              <li>{t('benefit4')}</li>
              <li>{t('benefit5')}</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('supportTitle')}</h3>
            <p className="text-gray-700 mb-4">
              {t('supportDesc1')}
            </p>
            <p className="text-gray-700">
              {t('supportDesc2')}
            </p>
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
