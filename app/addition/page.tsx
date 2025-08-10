import Script from "next/script";
import Head from "next/head";
import React from "react";

// Generate 10 addition questions within 20
function generateAdditionQuestions(count = 10) {
  const questions = [];
  while (questions.length < count) {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    questions.push({ a, b });
  }
  return questions;
}

const schemaData = {
  "@context": "https://schema.org",
  "@type": "EducationalWebPage",
  name: "Addition Practice - Kids Math Game",
  description: "Practice addition up to 20 with fun math games for kids.",
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    name: "EasyMath",
  },
};

export default function AdditionPage() {
  const questions = generateAdditionQuestions(10);
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <link rel="canonical" href="https://kids-math.com/addition" />
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
        <h1 className="text-2xl font-bold mb-6 text-blue-700">
          Addition Practice - Kids Math Game
        </h1>
        <ul className="space-y-4">
          {questions.map((q, idx) => (
            <li key={idx} className="flex items-center text-lg">
              <span className="mr-2">{idx + 1}.</span>
              <span className="mr-2">{q.a}</span>
              <span className="mr-2">+</span>
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