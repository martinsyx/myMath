"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";

interface Question {
  number: number;
  isOdd: boolean;
  userAnswer: boolean | null;
  isCorrect: boolean | null;
}

export default function OddEvenGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');

  const generateQuestions = () => {
    const newQuestions: Question[] = [];
    for (let i = 0; i < 10; i++) {
      const number = Math.floor(Math.random() * 50) + 1;
      newQuestions.push({
        number,
        isOdd: number % 2 === 1,
        userAnswer: null,
        isCorrect: null
      });
    }
    return newQuestions;
  };

  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  const handleAnswer = (isOdd: boolean) => {
    const currentQ = questions[currentQuestion];
    const isCorrect = isOdd === currentQ.isOdd;
    
    const newQuestions = [...questions];
    newQuestions[currentQuestion] = {
      ...currentQ,
      userAnswer: isOdd,
      isCorrect
    };
    setQuestions(newQuestions);

    if (isCorrect) {
      setScore(score + 10);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setGameState('completed');
      }
    }, 1000);
  };

  const resetGame = () => {
    setQuestions(generateQuestions());
    setCurrentQuestion(0);
    setScore(0);
    setGameState('playing');
  };

  const currentQ = questions[currentQuestion];

  return (
    <>
      <Head>
        <link rel="canonical" href="https://kids-math.com/number-sense/patterns/odd-even" />
      </Head>
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded shadow p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-4">Odd & Even Patterns - Kids Math Game</h1>
          <p className="text-gray-600">Decide if the number is odd or even!</p>
        </div>

        <div className="flex justify-center space-x-8 mb-8">
          <div className="text-lg">
            Score: <span className="font-bold text-green-600">{score}</span>
          </div>
          <div className="text-lg">
            Question: <span className="font-bold text-blue-600">{currentQuestion + 1}/10</span>
          </div>
        </div>

        {gameState === 'playing' && currentQ && (
          <div className="text-center">
            <div className="text-8xl font-bold text-blue-600 mb-8">{currentQ.number}</div>
            
            <div className="text-xl mb-6">Is this number:</div>
            
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => handleAnswer(true)}
                disabled={currentQ.userAnswer !== null}
                className={`px-8 py-4 rounded-lg text-xl font-bold transition-colors ${
                  currentQ.userAnswer === true
                    ? currentQ.isCorrect
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Odd
              </button>
              <button
                onClick={() => handleAnswer(false)}
                disabled={currentQ.userAnswer !== null}
                className={`px-8 py-4 rounded-lg text-xl font-bold transition-colors ${
                  currentQ.userAnswer === false
                    ? currentQ.isCorrect
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                Even
              </button>
            </div>

            {currentQ.userAnswer !== null && (
              <div className="mt-6">
                {currentQ.isCorrect ? (
                  <div className="text-2xl text-green-600 font-bold">✓ Correct!</div>
                ) : (
                  <div className="text-2xl text-red-600 font-bold">
                    ✗ Incorrect! {currentQ.number} is {currentQ.isOdd ? 'Odd' : 'Even'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {gameState === 'completed' && (
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Game Complete!</h2>
            <p className="text-gray-600 mb-6">Your final score: {score}/100</p>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Review:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {questions.map((q, index) => (
                  <div key={index} className={`p-3 rounded ${
                    q.isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <div className="font-bold">{q.number}</div>
                    <div>{q.isOdd ? 'Odd' : 'Even'}</div>
                    <div className={q.isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {q.isCorrect ? '✓' : '✗'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={resetGame}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={resetGame}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            Restart
          </button>
          <Link 
            href="/number-sense"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Number Sense
          </Link>
        </div>
      </div>
    </>
  );
}