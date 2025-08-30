import Script from "next/script";
import Head from "next/head";
import React from "react";

// Generate 10 subtraction questions
function generateSubtractionQuestions(count = 10) {
  const questions = [];
  while (questions.length < count) {
    const a = Math.floor(Math.random() * 50) + 10; // 10-59
    const b = Math.floor(Math.random() * a) + 1; // Ensure positive result
    questions.push({ a, b });
  }
  return questions;
}

const schemaData = {
  "@context": "https://schema.org",
  "@type": "EducationalWebPage",
  "name": "Subtraction Practice - Kids Math Game",
  "description": "Learn subtraction skills with interactive games for kids.",
  "inLanguage": "en",
  "publisher": {
    "@type": "Organization",
    "name": "KidsMath"
  }
};

export default function SubtractionPage() {
  const questions = generateSubtractionQuestions(10);
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <link rel="canonical" href="https://kids-math.com/subtraction" />
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
        <h1 className="text-2xl font-bold mb-6 text-blue-700">Subtraction Practice - Kids Math Game</h1>
        
        {/* Educational Content Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Learning Subtraction</h2>
          <p className="text-gray-700 mb-4">
            Subtraction is one of the fundamental operations in mathematics. It involves taking one number away from another to find the difference. 
            Practicing subtraction helps children develop number sense and builds a foundation for more advanced math concepts.
          </p>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Subtraction Tips:</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Start with smaller numbers and gradually work your way up to larger ones</li>
            <li>Use visual aids like fingers or objects to help understand the concept</li>
            <li>Practice regularly to build fluency and speed</li>
            <li>Remember that subtraction is the inverse of addition</li>
            <li>Look for patterns, like subtracting zero (any number minus zero equals itself)</li>
          </ul>
          <p className="text-gray-700">
            Our subtraction practice game generates random problems to help reinforce these concepts. 
            The more you practice, the better you&#39;ll become at subtraction!
          </p>
          <h3 className="text-lg font-semibold text-blue-700 mb-2 mt-4">Understanding Subtraction in Daily Life</h3>
          <p className="text-gray-700 mb-4">
            Subtraction is not just a mathematical concept; it&#39;s a skill we use in our daily lives. From calculating the change we receive at a store to determining how much time is left before an event, subtraction helps us make sense of the world around us.
          </p>
          <p className="text-gray-700 mb-4">
            When children learn subtraction, they&#39;re not just memorizing facts; they&#39;re developing critical thinking skills. They learn to analyze problems, identify what information is needed, and apply logical reasoning to find solutions.
          </p>
        </div>

        <ul className="space-y-4">
          {questions.map((q, idx) => (
            <li key={idx} className="flex items-center text-lg">
              <span className="mr-2">{idx + 1}.</span>
              <span className="mr-2">{q.a}</span>
              <span className="mr-2">-</span>
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

        {/* Why Practice Subtraction Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-green-800 mb-4">Why Practice Subtraction?</h2>
          <p className="text-gray-700 mb-4">
            Subtraction is a fundamental math skill that children use throughout their lives. 
            Whether they&#39;re calculating change from a purchase, measuring ingredients for a recipe, or determining how much time is left,
            subtraction is an essential skill that builds confidence in mathematical thinking.
          </p>
          <p className="text-gray-700 mb-4">
            Regular practice with subtraction helps children:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Develop mental math skills for quick calculations</li>
            <li>Build a strong foundation for more complex math operations</li>
            <li>Improve problem-solving abilities</li>
            <li>Gain confidence in their mathematical abilities</li>
          </ul>
          <p className="text-gray-700">
            Our interactive subtraction game makes learning fun and engaging. Keep practicing, and you&#39;ll see
            improvement in your math skills!
          </p>
        </div>
      </div>
    </>
  );
}
