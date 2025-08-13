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
      <div className="max-w-xl mx-auto mt-12 bg-white rounded shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-blue-700">Subtraction Practice - Kids Math Game</h1>
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
      </div>
    </>
  );
}