import Script from "next/script";
import Head from "next/head";
import React from "react";
import Link from "next/link";

const schemaData = {
  "@context": "https://schema.org",
  "@type": "EducationalWebPage",
  "name": "Number Sense - Kids Math Games",
  "description": "Build number sense with fun and engaging math games for kids. Practice counting, matching, sequencing, patterns, comparison, and estimation.",
  "inLanguage": "en",
  "about": {
    "@type": "EducationalAudience",
    "educationalRole": "student",
    "ageRange": "5-12"
  },
  "publisher": {
    "@type": "Organization",
    "name": "EasyMath"
  }
};

export default function NumberSensePage() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </Head>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-9QQG8FQB50" strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9QQG8FQB50');
        `}
      </Script>
      <div className="max-w-4xl mx-auto mt-12 bg-white rounded shadow p-8">
        <h1 className="text-3xl font-bold mb-8 text-blue-700 text-center">Number Sense - Kids Math Games</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Number Games Section */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">🎮</span>
              </div>
              <h2 className="text-xl font-semibold text-blue-800">Number Games</h2>
            </div>
            <p className="text-gray-600 mb-4 text-center">
              Build number sense with fun and engaging math games for kids.
            </p>
            <div className="space-y-3">
              <Link 
                href="/number-sense/games/counting"
                className="block w-full bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700 transition-colors"
              >
                Counting Game
              </Link>
              <Link 
                href="/number-sense/games/matching"
                className="block w-full bg-blue-500 text-white px-4 py-2 rounded text-center hover:bg-blue-600 transition-colors"
              >
                Number Matching
              </Link>
              <Link 
                href="/number-sense/games/sequence"
                className="block w-full bg-blue-400 text-white px-4 py-2 rounded text-center hover:bg-blue-500 transition-colors"
              >
                Number Sequencing
              </Link>
            </div>
          </div>

          {/* Number Patterns Section */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">🔍</span>
              </div>
              <h2 className="text-xl font-semibold text-green-800">Number Patterns</h2>
            </div>
            <p className="text-gray-600 mb-4 text-center">
              Discover patterns and relationships between numbers through interactive games.
            </p>
            <div className="space-y-3">
              <Link 
                href="/number-sense/patterns/odd-even"
                className="block w-full bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700 transition-colors"
              >
                Odd & Even Patterns
              </Link>
              <Link 
                href="/number-sense/patterns/skip-counting"
                className="block w-full bg-green-500 text-white px-4 py-2 rounded text-center hover:bg-green-600 transition-colors"
              >
                Skip Counting
              </Link>
              <Link 
                href="/number-sense/patterns/sequences"
                className="block w-full bg-green-400 text-white px-4 py-2 rounded text-center hover:bg-green-500 transition-colors"
              >
                Number Sequences
              </Link>
            </div>
          </div>

          {/* Math Basics Section */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">🌟</span>
              </div>
              <h2 className="text-xl font-semibold text-purple-800">Math Basics</h2>
            </div>
            <p className="text-gray-600 mb-4 text-center">
              Learn basic math concepts and practice thinking skills with games for kids.
            </p>
            <div className="space-y-3">
              <Link 
                href="/number-sense/basics/comparison"
                className="block w-full bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700 transition-colors"
              >
                Comparison
              </Link>
              <Link 
                href="/number-sense/basics/estimation"
                className="block w-full bg-purple-500 text-white px-4 py-2 rounded text-center hover:bg-purple-600 transition-colors"
              >
                Estimation
              </Link>
              {/* <Link 
                href="/number-sense/basics/visualization"
                className="block w-full bg-purple-400 text-white px-4 py-2 rounded text-center hover:bg-purple-500 transition-colors"
              >
                Visualization
              </Link> */}
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}