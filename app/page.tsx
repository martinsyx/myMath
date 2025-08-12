
import Script from "next/script";
import Head from "next/head";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "../components/Metadata";

const pageMetadata = {
  title: "Kids Math Game - Fun Interactive Math Games for Children",
  description: "A fun and interactive platform designed for kids to learn math through games and activities. Practice number sense, addition, subtraction, multiplication, and division.",
  path: "/",
  schemaData: {
    "@type": ["WebSite", "WebApplication"],
    "alternateType": "EducationalApplication",
    "applicationCategory": "Education",
    "gamePlatform": ["Web Browser", "Mobile Web"],
    "educationalUse": ["Practice", "Assessment"],
    "interactivityType": "Interactive",
    "learningResourceType": "Game",
    "skillLevel": ["Beginner", "Intermediate"],
    "educationalAlignment": {
      "@type": "AlignmentObject",
      "alignmentType": "teaches",
      "educationalFramework": "Mathematics",
      "targetName": "Early Mathematics"
    }
  }
};

export default function HomePage() {
  const mathGames = [
    {
      title: "Number Sense",
      description: "Build number sense with simple addition games",
      color: "bg-blue-100 border-blue-200",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
      icon: "🔢",
      href: "/number-sense"
    },
    {
      title: "Addition Practice",
      description: "Practice addition up to 20 with fun math games",
      color: "bg-green-100 border-green-200",
      buttonColor: "bg-green-500 hover:bg-green-600",
      icon: "➕",
      href: "/addition"
    },
    {
      title: "Subtraction Practice",
      description: "Learn subtraction skills with interactive games",
      color: "bg-orange-100 border-orange-200",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
      icon: "➖",
      href: "/subtraction"
    },
    {
      title: "Multiplication Mastery",
      description: "Master multiplication tables with kids math games",
      color: "bg-purple-100 border-purple-200",
      buttonColor: "bg-purple-500 hover:bg-purple-600",
      icon: "✖️",
      href: "/multiplication"
    },
    {
      title: "Division Practice",
      description: "Discover division through fun and engaging activities",
      color: "bg-red-100 border-red-200",
      buttonColor: "bg-red-500 hover:bg-red-600",
      icon: "➗",
      href: "/division"
    },
  ];

  return (
    <>
      <Head>
        <Metadata {...pageMetadata} />
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">

        {/* Hero Section - Compact */}
        <section className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                Welcome to Kids Math!
              </h2>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Math Adventure</h3>
            <p className="text-gray-600">Pick a game and start your mathematical journey!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
            {mathGames.map((game, index) => (
              <Card
                key={index}
                className={`${game.color} border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group`}
              >
                <CardHeader className="text-center pb-3">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{game.icon}</div>
                  <CardTitle className="text-lg font-bold text-gray-800 mb-2">{game.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">{game.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <Link href={game.href}>
                    <Button
                      className={`${game.buttonColor} text-white font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all text-sm`}
                    >
                      Start Game
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              A fun and interactive platform designed for kids to learn math through exciting games and activities!
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

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center text-white font-bold text-xs">
                +
              </div>
              <span className="text-lg font-bold">Kids Math Game</span>
            </div>
            <p className="text-gray-400">Making math fun for kids everywhere!</p>
          </div>
        </footer>
      </div>
    </>
  );
}