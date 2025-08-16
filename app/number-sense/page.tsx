



import Script from "next/script";
import React from "react";
import Link from "next/link";
import { GameCard } from "@/components/game-card"
import { FloatingElements } from "@/components/floating-elements"
import { Metadata } from "@/components/Metadata"

const pageMetadata = {
  title: "Number Sense - Kids Math Games",
  description: "Build number sense with fun and engaging math games for kids. Practice counting, matching, sequencing, patterns, comparison, and estimation.",
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
      "Number Sequences",
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

export default function NumberSensePage() {
  const gameCategories = [
    {
      id: "number-games",
      title: "Number Games",
      description: "Build your child's number sense through fun interactive games",
      icon: "🎮",
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      games: [
        { name: "Counting Games", icon: "🔢", href: "/number-sense/games/counting" },
        { name: "Number Matching", icon: "🎯", href: "/number-sense/games/matching" },
        { name: "Number Sequence", icon: "📊", href: "/number-sense/games/sequence" },
      ],
    },
    {
      id: "number-patterns",
      title: "Number Patterns",
      description: "Discover patterns and relationships between numbers to develop logical thinking",
      icon: "🔍",
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      games: [
        { name: "Odd & Even", icon: "⚡", href: "/number-sense/patterns/odd-even" },
        // { name: "Skip Counting", icon: "🦘", href: "/number-sense/patterns/skip-counting" },
        { name: "Number Sequences", icon: "🔗", href: "/number-sense/patterns/sequences" },
      ],
    },
    {
      id: "math-basics",
      title: "Math Basics",
      description: "Learn fundamental math concepts and practice thinking skills through games",
      icon: "⭐",
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      games: [
        { name: "Size Comparison", icon: "⚖️", href: "/number-sense/basics/comparison" },
        { name: "Quantity Estimation", icon: "🎲", href: "/number-sense/basics/estimation" },
      ],
    },
  ];
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
              Number Sense - Kids Math Games
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Help children build number concepts and develop mathematical thinking through fun interactive games
            </p>
          </div>

          {/* Game Card Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {gameCategories.map((category, index) => (
              <GameCard key={category.id} category={category} delay={index * 0.2} />
            ))}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <Link href="/" className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-colors">
              🏠 Back to Home
            </Link>
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
