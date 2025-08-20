import Script from "next/script";
import Head from "next/head";
import React from "react";

// Generate 10 multiplication questions
function generateMultiplicationQuestions(count = 10) {
  const questions = [];
  while (questions.length < count) {
    const a = Math.floor(Math.random() * 12) + 1; // 1-12
    const b = Math.floor(Math.random() * 12) + 1; // 1-12
    questions.push({ a, b });
  }
  return questions;
}

const schemaData = {
  "@context": "https://schema.org",
  "@type": "EducationalWebPage",
  name: "Multiplication Practice - Kids Math Game",
  description: "Master multiplication tables with kids math games.",
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    name: "KidsMath",
  },
};

export default function MultiplicationPage() {
  const questions = generateMultiplicationQuestions(10);
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <link rel="canonical" href="https://kids-math.com/multiplication" />
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
          Multiplication Practice - Kids Math Game
        </h1>
        
        {/* Educational Content Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Learning Multiplication</h2>
          <p className="text-gray-700 mb-4">
            Multiplication is one of the fundamental operations in mathematics. It involves adding a number to itself a certain number of times. 
            Practicing multiplication helps children develop number sense and builds a foundation for more advanced math concepts like division and algebra.
          </p>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Multiplication Tips:</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Start with smaller numbers and gradually work your way up to larger ones</li>
            <li>Use visual aids like arrays or groups of objects to help understand the concept</li>
            <li>Practice regularly to build fluency and speed</li>
            <li>Look for patterns, like multiplying by zero (any number times zero equals zero)</li>
            <li>Remember that multiplication is commutative (2×3 equals 3×2)</li>
          </ul>
          <p className="text-gray-700">
            Our multiplication practice game generates random problems to help reinforce these concepts. 
            The more you practice, the better you&#39;ll become at multiplication!
          </p>
        </div>

        <ul className="space-y-4">
          {questions.map((q, idx) => (
            <li key={idx} className="flex items-center text-lg">
              <span className="mr-2">{idx + 1}.</span>
              <span className="mr-2">{q.a}</span>
              <span className="mr-2">×</span>
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

        {/* Why Practice Multiplication Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-green-800 mb-4">Why Practice Multiplication?</h2>
          <p className="text-gray-700 mb-4">
            Multiplication is a fundamental math skill that children use throughout their lives. 
            Whether they&#39;re calculating the total cost of multiple items, determining areas of shapes, or solving complex math problems,
            multiplication is an essential skill that builds confidence in mathematical thinking.
          </p>
          <p className="text-gray-700 mb-4">
            Regular practice with multiplication helps children:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Develop mental math skills for quick calculations</li>
            <li>Build a strong foundation for more complex math operations</li>
            <li>Improve problem-solving abilities</li>
            <li>Gain confidence in their mathematical abilities</li>
          </ul>
          <p className="text-gray-700">
            Our interactive multiplication game makes learning fun and engaging. Keep practicing, and you&#39;ll see
            improvement in your math skills!
          </p>
        </div>
      </div>
    </>
  );
}
