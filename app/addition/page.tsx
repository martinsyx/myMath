'use client';
import Script from "next/script";
import Head from "next/head";
import React, { useState, useEffect } from "react";

// Generate addition questions with configurable parameters
function generateAdditionQuestions(count = 10, maxNumber = 20) {
  const questions = [];
  while (questions.length < count) {
    const a = Math.floor(Math.random() * maxNumber) + 1;
    const b = Math.floor(Math.random() * maxNumber) + 1;
    questions.push({ a, b, correctAnswer: a + b });
  }
  return questions;
}

// Define types for our question and answers
type Question = {
  a: number;
  b: number;
  correctAnswer: number;
};

type Answers = {
  [key: number]: string;
};

const schemaData = {
  "@context": "https://schema.org",
  "@type": "EducationalWebPage",
  name: "Addition Practice - Kids Math Game",
  description: "Practice addition up to 20 with fun math games for kids.",
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    name: "KidsMath",
  },
};

export default function AdditionPage() {
  const [questions, setQuestions] = useState<Question[]>(() => generateAdditionQuestions(10, 20));
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [maxNumber, setMaxNumber] = useState<number>(20);
  const [answers, setAnswers] = useState<Answers>({});
  const [score, setScore] = useState<number>(0);

  // Calculate score whenever answers change
  useEffect(() => {
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (answers[index] !== undefined && parseInt(answers[index]) === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
  }, [answers, questions]);

  const handleGenerateQuestions = () => {
    setQuestions(generateAdditionQuestions(questionCount, maxNumber));
    setAnswers({});
    setScore(0);
  };

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const checkAnswer = (userAnswer: string, correctAnswer: number): boolean | null => {
    if (userAnswer === '' || userAnswer === undefined) return null;
    return parseInt(userAnswer) === correctAnswer;
  };

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
      <div className="max-w-xl mx-auto mt-12 bg-white rounded shadow p-8 relative">
        {/* Score display in top right corner */}
        <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
          Score: {score}/{questions.length}
        </div>
        
        <h1 className="text-2xl font-bold mb-6 text-blue-700">
          Addition Practice - Kids Math Game
        </h1>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-gray-700">Generation Settings</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Number of Questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Number Range
              </label>
              <select
                value={maxNumber}
                onChange={(e) => setMaxNumber(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
              >
                <option value={10}>1-10</option>
                <option value={20}>1-20</option>
                <option value={50}>1-50</option>
                <option value={100}>1-100</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleGenerateQuestions}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
          >
            🎲 Generate New Questions
          </button>
        </div>
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
                value={answers[idx] || ''}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                className="border-b-2 border-blue-200 focus:border-blue-500 outline-none w-16 text-center text-blue-700 bg-transparent"
                placeholder="Your answer"
              />
              {/* Feedback display */}
              {answers[idx] !== undefined && answers[idx] !== '' && (
                <span className="ml-2">
                  {checkAnswer(answers[idx], q.correctAnswer) ? (
                    <span className="text-green-600 font-bold">✓ Correct!</span>
                  ) : (
                    <span className="text-red-600 font-bold">✗ Wrong! ({q.correctAnswer})</span>
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
