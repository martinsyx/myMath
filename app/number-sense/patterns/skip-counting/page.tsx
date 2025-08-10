"use client";

import Head from "next/head";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Question {
  sequence: number[];
  pattern: number;
  missingIndex: number;
  userAnswer: number | null;
  isCorrect: boolean | null;
}

export default function SkipCountingGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
      <Head>
        <link rel="canonical" href="https://kids-math.com/number-sense/patterns/skip-counting" />
      </Head>
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');

  const generateQuestion = (): Question => {
    const patterns = [2, 3, 5, 10];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const start = Math.floor(Math.random() * 10) + 1;
    const sequence = [];
    
    for (let i = 0; i < 5; i++) {
      sequence.push(start + i * pattern);
    }
    
    const missingIndex = Math.floor(Math.random() * 3) + 1; // 1, 2, 3
    const correctAnswer = sequence[missingIndex];
    
    // 创建带缺失数字的序列
    const displaySequence = [...sequence];
    // displaySequence[missingIndex] = null;
    
    return {
      sequence: displaySequence,
      pattern,
      missingIndex,
      userAnswer: null,
      isCorrect: null
    };
  };

  const generateQuestions = () => {
    const newQuestions: Question[] = [];
    for (let i = 0; i < 10; i++) {
      newQuestions.push(generateQuestion());
    }
    return newQuestions;
  };

  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  const handleAnswer = (answer: number) => {
    const currentQ = questions[currentQuestion];
    const correctAnswer = currentQ.sequence[0] + currentQ.pattern * currentQ.missingIndex;
    const isCorrect = answer === correctAnswer;
    
    const newQuestions = [...questions];
    newQuestions[currentQuestion] = {
      ...currentQ,
      userAnswer: answer,
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
    }, 1500);
  };

  const resetGame = () => {
    setQuestions(generateQuestions());
    setCurrentQuestion(0);
    setScore(0);
    setGameState('playing');
  };

  const currentQ = questions[currentQuestion];

  const renderSequence = (sequence: (number | null)[]) => {
    return sequence.map((num, index) => (
      <div key={index} className="w-16 h-16 border-2 rounded-lg flex items-center justify-center text-xl font-bold">
        {num !== null ? num : '?'}
      </div>
    ));
  };

  return (
    <>
      <Head>
        <link rel="canonical" href="https://kids-math.com/number-sense/patterns/skip-counting" />
      </Head>
    <div className="max-w-4xl mx-auto mt-12 bg-white rounded shadow p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Skip Counting Patterns - Kids Math Game</h1>
        <p className="text-gray-600">Find the missing number in the sequence!</p>
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
          <div className="mb-8">
            <div className="text-lg mb-4">What number should replace the question mark?</div>
            <div className="flex justify-center space-x-4">
              {renderSequence(currentQ.sequence)}
            </div>
          </div>

          <div className="mb-8">
            <div className="text-lg mb-4">Choose your answer:</div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleAnswer(num)}
                  disabled={currentQ.userAnswer !== null}
                  className={`w-16 h-16 border-2 rounded-lg text-xl font-bold transition-colors ${
                    currentQ.userAnswer === num
                      ? currentQ.isCorrect
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-red-600 text-white border-red-600'
                      : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {currentQ.userAnswer !== null && (
            <div className="mt-6">
              {currentQ.isCorrect ? (
                <div className="text-2xl text-green-600 font-bold">✓ Correct!</div>
              ) : (
                <div className="text-2xl text-red-600 font-bold">
                  ✗ Incorrect! The correct answer is {currentQ.sequence[0] + currentQ.pattern * currentQ.missingIndex}
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