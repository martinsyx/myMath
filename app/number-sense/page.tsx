// import Script from "next/script";
// import Head from "next/head";
// import React from "react";
// import Link from "next/link";

// const schemaData = {
//   "@context": "https://schema.org",
//   "@type": "EducationalWebPage",
//   "name": "Number Sense - Kids Math Games",
//   "description": "Build number sense with fun and engaging math games for kids. Practice counting, matching, sequencing, patterns, comparison, and estimation.",
//   "inLanguage": "en",
//   "about": {
//     "@type": "EducationalAudience",
//     "educationalRole": "student",
//     "ageRange": "5-12"
//   },
//   "publisher": {
//     "@type": "Organization",
//     "name": "KidsMath"
//   }
// };

// export default function NumberSensePage() {
//   const [target, setTarget] = React.useState(Math.floor(Math.random() * 8) + 3); // 3~10
//   const [status, setStatus] = React.useState<'playing' | 'wrong' | 'correct'>('playing');
//   const [question, setQuestion] = React.useState(1);

//   const handleAppleClick = (idx: number) => {
//     if (status !== 'playing') return;
//     if (idx + 1 === target) {
//       setStatus('correct');
//       setTimeout(() => {
//         setTarget(Math.floor(Math.random() * 8) + 3);
//         setStatus('playing');
//         setQuestion(q => q + 1);
//       }, 1000);
//     } else {
//       setStatus('wrong');
//       setTimeout(() => {
//         setTarget(Math.floor(Math.random() * 8) + 3);
//         setStatus('playing');
//         setQuestion(q => q + 1);
//       }, 1000);
//     }
//   };

//   return (
//     <>
//       <Head>
//         <link rel="canonical" href="https://kids-math.com/number-sense" />
//       </Head>
//       <div className="max-w-xl mx-auto mt-12 bg-white rounded shadow p-8">
//         <h1 className="text-3xl font-bold mb-8 text-blue-700 text-center">Apple Click Game - Kids Math</h1>
//         <div className="text-center mb-6 text-lg">Question {question}</div>
//         <div className="text-center mb-6 text-xl font-bold text-green-700">Click the <span className="underline">{target}th</span> apple!</div>
//         <div className="flex justify-center gap-4 mb-8">
//           {[...Array(10)].map((_, idx) => (
//             <button
//               key={idx}
//               onClick={() => handleAppleClick(idx)}
//               className={`w-12 h-12 text-3xl rounded-full border-2 flex items-center justify-center transition-colors
//                 ${status === 'playing' ? 'border-gray-300 bg-white hover:bg-yellow-100' :
//                   idx + 1 === target && status === 'correct' ? 'border-green-500 bg-green-100' :
//                   idx + 1 === target && status === 'wrong' ? 'border-red-500 bg-red-100' :
//                   'border-gray-300 bg-white'}`}
//               disabled={status !== 'playing'}
//             >🍎</button>
//           ))}
//         </div>
//         {status === 'correct' && (
//           <div className="text-center text-green-600 font-bold text-xl mb-4">Correct!</div>
//         )}
//         {status === 'wrong' && (
//           <div className="text-center text-red-600 font-bold text-xl mb-4">Wrong! Try the next one.</div>
//         )}
//       </div>
//     </>
//   );
// }




import Script from "next/script";
import Head from "next/head";
import React from "react";
import Link from "next/link";
import { GameCard } from "@/components/game-card"
import { FloatingElements } from "@/components/floating-elements"

  const schemaData = {
  "@context": "https://schema.org",
  "@type": ["EducationalWebPage", "WebPage"],
  "name": "Number Sense - Kids Math Games",
  "description": "Build number sense with fun and engaging math games for kids. Practice counting, matching, sequencing, patterns, comparison, and estimation.",
  "inLanguage": "en",
  "learningResourceType": "Game",
  "educationalLevel": "Elementary",
  "keywords": "number sense, counting games, number matching, number sequences, math games for kids",
  "about": {
    "@type": "EducationalAudience",
    "educationalRole": "student",
    "ageRange": "5-12"
  },
  "publisher": {
    "@type": "Organization",
    "name": "KidsMath",
    "url": "https://kids-math.com"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};export default function NumberSensePage() {
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
        { name: "Skip Counting", icon: "🦘", href: "/number-sense/patterns/skip-counting" },
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
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-4 bounce-gentle">
              Number Sense - Kids Math Games
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Help children build number concepts and develop mathematical thinking through fun interactive games
            </p>
          </div>

          {/* 游戏卡片网格 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {gameCategories.map((category, index) => (
              <GameCard key={category.id} category={category} delay={index * 0.2} />
            ))}
          </div>

          {/* 返回按钮 */}
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