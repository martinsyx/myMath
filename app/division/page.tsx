import Script from "next/script";
import Head from "next/head";
import React from "react";

// Generate 10 division questions
function generateDivisionQuestions(count = 10) {
  const questions = [];
  while (questions.length < count) {
    const a = Math.floor(Math.random() * 100) + 10; // 10-109
    const b = Math.floor(Math.random() * 12) + 1; // 1-12
    // 确保能整除
    const result = Math.floor(a / b);
    const dividend = result * b;
    questions.push({ a: dividend, b });
  }
  return questions;
}

const schemaData = {
  "@context": "https://schema.org",
  "@type": "EducationalWebPage",
  name: "Division Practice - Kids Math Game",
  description: "Practice division with fun math games for kids.",
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    name: "KidsMath",
  },
};

export default function DivisionPage() {
  const questions = generateDivisionQuestions(10);
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <link rel="canonical" href="https://kids-math.com/division" />
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
        <h1 className="text-2xl font-bold mb-6 text-blue-700">
          Division Practice - Kids Math Game
        </h1>
        
        {/* Educational Content Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Learning Division</h2>
          <p className="text-gray-700 mb-4">
            Division is one of the fundamental operations in mathematics. It involves splitting a number into equal parts or groups. 
            Practicing division helps children develop number sense and builds a foundation for more advanced math concepts like fractions and ratios.
          </p>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Division Tips:</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Start with smaller numbers and gradually work your way up to larger ones</li>
            <li>Use visual aids like sharing objects equally to help understand the concept</li>
            <li>Practice regularly to build fluency and speed</li>
            <li>Remember that division is the inverse of multiplication</li>
            <li>Look for patterns, like dividing by one (any number divided by one equals itself)</li>
          </ul>
          <p className="text-gray-700">
            Our division practice game generates random problems to help reinforce these concepts. 
            The more you practice, the better you'll become at division!
          </p>
        </div>

        <ul className="space-y-4">
          {questions.map((q, idx) => (
            <li key={idx} className="flex items-center text-lg">
              <span className="mr-2">{idx + 1}.</span>
              <span className="mr-2">{q.a}</span>
              <span className="mr-2">÷</span>
              <span className="mr-2">{q.b}</span>
              <span className="mx-2">=</span>
              <input
                type="text"
                className="border-b-2 border-blue-200 focus:border-blue-500 outline-none w-16 text-center text-blue-700 bg-transparent"
                placeholder="Your answer"
              />
            </li>
          ))}
        </ul>

        {/* Why Practice Division Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-green-800 mb-4">Why Practice Division?</h2>
          <p className="text-gray-700 mb-4">
            Division is a fundamental math skill that children use throughout their lives. 
            Whether they're sharing snacks equally among friends, calculating unit prices at the store, or determining rates and ratios, 
            division is an essential skill that builds confidence in mathematical thinking.
          </p>
          <p className="text-gray-700 mb-4">
            Regular practice with division helps children:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Develop mental math skills for quick calculations</li>
            <li>Build a strong foundation for more complex math operations</li>
            <li>Improve problem-solving abilities</li>
            <li>Gain confidence in their mathematical abilities</li>
          </ul>
          <p className="text-gray-700">
            Our interactive division game makes learning fun and engaging. Keep practicing, and you'll see 
            improvement in your math skills!
          </p>
        </div>
      </div>
    </>
  );
}
