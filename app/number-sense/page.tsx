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
        { name: "Skip Counting", icon: "🔗", href: "/number-sense/patterns/skipcountinggame" },
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


          {/* Educational Content Section */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Understanding Number Sense</h2>
            <p className="text-gray-700 mb-6">
              Number sense is the ability to understand numbers and their relationships. It&#39;s a fundamental math skill that helps children make sense of the world around them through quantitative reasoning. Developing strong number sense in early years sets the foundation for future mathematical success. This mathematical intuition allows children to work flexibly with numbers and understand their practical applications in daily life.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Components of Number Sense:</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Counting and Cardinality</h4>
                <p className="text-gray-700">Understanding that the last number counted represents the total quantity of a set. This foundational skill helps children grasp the concept that numbers represent specific amounts, not just recited words in sequence.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-2">Number Relationships</h4>
                <p className="text-gray-700">Recognizing how numbers relate to each other through comparison, ordering, and patterns. Children learn to identify which numbers are greater or lesser, and begin to see numerical sequences and relationships.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-800 mb-2">Base-Ten System</h4>
                <p className="text-gray-700">Understanding place value and how numbers are composed and decomposed. This critical concept helps children work with larger numbers and prepares them for more complex mathematical operations.</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-800 mb-2">Operations and Estimation</h4>
                <p className="text-gray-700">Developing fluency with basic operations and making reasonable estimates. Children learn to perform calculations mentally and develop a sense of whether their answers are reasonable.</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Our number sense games are designed to help children develop these critical skills through interactive and engaging activities. Each game focuses on specific aspects of number sense, making learning both fun and effective. These educational math games for kids provide hands-on experiences that build mathematical understanding in ways that traditional worksheets cannot match.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Benefits of Strong Number Sense:</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Improved problem-solving abilities through better numerical reasoning</li>
              <li>Better understanding of mathematical concepts and their real-world applications</li>
              <li>Increased confidence in math-related activities and academic settings</li>
              <li>Enhanced critical thinking skills that extend beyond mathematics</li>
              <li>Stronger foundation for advanced mathematics including algebra and calculus</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">How Parents Can Support Number Sense Development:</h3>
            <p className="text-gray-700 mb-4">
              Parents play a crucial role in developing their child&#39;s number sense. Simple activities like counting objects during daily routines, discussing quantities in recipes, or playing number-based games can significantly enhance mathematical understanding. Our free math games online provide structured opportunities for children to practice these skills in an engaging environment.
            </p>
            <p className="text-gray-700">
              Creating a positive attitude toward mathematics is equally important. When children see math as fun and accessible through cool math games for kids, they&#39;re more likely to develop the confidence needed for mathematical success. Regular practice with educational games for children helps reinforce concepts learned in school while introducing new challenges in a supportive setting.
            </p>
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
