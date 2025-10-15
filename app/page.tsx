'use client';

import Script from "next/script";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FloatingElements } from "@/components/floating-elements"
import { Metadata } from "@/components/Metadata"
import { Header } from '@/components/header';

const pageMetadata = {
  title: "Kids Math Games - Free Online Math Practice for Children",
  description: "Free online math games for kids! Practice addition, subtraction, multiplication, division, counting, patterns, and number sense. Fun and educational games for children ages 5-12.",
  path: "/",
  canonical: "https://kids-math.com",
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
    description: "Match numbers with corresponding quantities",
    image: "/images/matching-game.png"
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
  {
    name: "Addition Practice",
    href: "/addition",
    description: "Master addition with fun interactive problems",
    image: "/images/addition-game.svg"
  },
  {
    name: "Subtraction Practice",
    href: "/subtraction",
    description: "Learn subtraction through engaging exercises",
    image: "/images/subtraction-game.svg"
  },
  {
    name: "Multiplication Practice",
    href: "/multiplication",
    description: "Practice multiplication tables and skills",
    image: "/images/multiplication-game.svg"
  },
  {
    name: "Division Practice",
    href: "/division",
    description: "Develop division skills with interactive games",
    image: "/images/division-game.svg"
  },
  {
    name: "Number Visualization",
    href: "/number-sense/basics/visualization",
    description: "Visualize numbers and their relationships",
    image: "/images/visualization-game.svg"
  },
];

export default function HomePage() {
  const [imageErrors, setImageErrors] = React.useState<Record<number, boolean>>({});

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
        <Header />
        <FloatingElements />

      <div className="relative z-10">
        <main className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-4 bounce-gentle">
              Kids Math Games - Free Online Practice
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Master math skills with fun interactive games! Practice addition, subtraction, multiplication, division, counting, patterns, and more.
            </p>
          </div>

          {/* Game Cards Grid - Four per Row */}
          <div className="max-w-7xl mx-auto mb-12">
            <div className="grid grid-cols-4 gap-6">
              {games.map((game, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <Link href={game.href} className="flex flex-col h-full">
                    {/* Game Image */}
                    <div className="w-full p-4 flex justify-center">
                      {imageErrors[index] ? (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center text-gray-500 text-xs">
                          Game Image
                        </div>
                      ) : (
                        <Image
                          src={game.image}
                          alt={game.name}
                          width={128}
                          height={128}
                          className="rounded-xl w-32 h-32 object-cover border-2 border-gray-200"
                          onError={() =>
                            setImageErrors(prev => ({ ...prev, [index]: true }))
                          }
                        />
                      )}
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

          {/* Educational Content Section */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Complete Math Skills Development</h2>
            <p className="text-gray-700 mb-6">
              Our comprehensive collection of math games helps children master essential mathematical skills from basic number sense to advanced operations. Each game is designed to make learning fun and engaging while building strong foundational skills. From counting and patterns to addition, subtraction, multiplication, and division, children can practice all core math concepts in an interactive environment that encourages exploration and builds confidence.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Math Skills Covered:</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Number Sense & Counting</h4>
                <p className="text-gray-700">Build foundational understanding with counting games, number matching, sequencing, and visualization. Learn to recognize numbers, understand quantities, and develop numerical relationships through interactive activities.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-2">Patterns & Logic</h4>
                <p className="text-gray-700">Master skip counting, odd and even numbers, and number patterns. These games help children identify mathematical patterns and develop logical thinking skills essential for higher-level mathematics.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-800 mb-2">Basic Operations</h4>
                <p className="text-gray-700">Practice addition and subtraction with customizable difficulty levels. Build computational fluency and mental math skills through unlimited practice problems that adapt to your child&apos;s learning pace.</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-800 mb-2">Advanced Operations</h4>
                <p className="text-gray-700">Develop multiplication and division skills with engaging practice games. Master times tables, understand division concepts, and build confidence in more complex mathematical operations.</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Our complete collection of math games provides a comprehensive learning path from basic counting to advanced operations. Each game is carefully designed to make learning enjoyable while building essential mathematical skills. These educational math games for kids offer immediate feedback, unlimited practice opportunities, and engaging challenges that keep children motivated to learn.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Benefits of Our Math Games:</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Comprehensive coverage of essential math skills from counting to division</li>
              <li>Interactive games that make learning fun and engaging for children</li>
              <li>Customizable difficulty levels to match each child&apos;s learning pace</li>
              <li>Immediate feedback to help children learn from mistakes</li>
              <li>Build confidence and positive attitudes toward mathematics</li>
              <li>Strengthen problem-solving and critical thinking abilities</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">How Parents Can Support Math Learning:</h3>
            <p className="text-gray-700 mb-4">
              Parents play a crucial role in developing their child&#39;s mathematical abilities. Our free math games online provide structured practice opportunities that complement classroom learning. Encourage regular practice sessions, celebrate progress, and help children see math as an exciting challenge rather than a chore.
            </p>
            <p className="text-gray-700">
              Creating a positive attitude toward mathematics starts with making it fun and accessible. Our collection of cool math games for kids transforms traditional math practice into engaging activities that children look forward to. Regular practice helps reinforce concepts, build confidence, and develop the strong mathematical foundation needed for academic success.
            </p>
          </div>
        </main>
      </div>
    </div>
    </>
  );
}



