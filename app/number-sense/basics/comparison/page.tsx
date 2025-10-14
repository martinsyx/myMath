"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";

interface Question {
  num1: number;
  num2: number;
  userAnswer: 'greater' | 'less' | 'equal' | null;
  isCorrect: boolean | null;
}

export default function ComparisonGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');

  const generateQuestions = () => {
    const newQuestions: Question[] = [];
    for (let i = 0; i < 10; i++) {
      const num1 = Math.floor(Math.random() * 50) + 1;
      const num2 = Math.floor(Math.random() * 50) + 1;
      newQuestions.push({
        num1,
        num2,
        userAnswer: null,
        isCorrect: null
      });
    }
    return newQuestions;
  };

  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  const handleAnswer = (answer: 'greater' | 'less' | 'equal') => {
    const currentQ = questions[currentQuestion];
    let isCorrect = false;
    
    if (answer === 'greater' && currentQ.num1 > currentQ.num2) {
      isCorrect = true;
    } else if (answer === 'less' && currentQ.num1 < currentQ.num2) {
      isCorrect = true;
    } else if (answer === 'equal' && currentQ.num1 === currentQ.num2) {
      isCorrect = true;
    }
    
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

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded shadow p-8">
      <Head>
        <link rel="canonical" href="https://kids-math.com/number-sense/basics/comparison" />
      </Head>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">Number Comparison - Kids Math Game</h1>
        <p className="text-gray-600">Compare the size of two numbers</p>
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
            <div className="text-6xl font-bold text-blue-600 mb-4">{currentQ.num1}</div>
            <div className="text-2xl text-gray-600 mb-4">vs</div>
            <div className="text-6xl font-bold text-purple-600 mb-8">{currentQ.num2}</div>
          </div>
          
          <div className="text-xl mb-6">The first number is:</div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleAnswer('greater')}
              disabled={currentQ.userAnswer !== null}
              className={`px-6 py-3 rounded-lg text-lg font-bold transition-colors ${
                currentQ.userAnswer === 'greater'
                  ? currentQ.isCorrect
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {">"}
            </button>
            <button
              onClick={() => handleAnswer('less')}
              disabled={currentQ.userAnswer !== null}
              className={`px-6 py-3 rounded-lg text-lg font-bold transition-colors ${
                currentQ.userAnswer === 'less'
                  ? currentQ.isCorrect
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
                {"<"}
            </button>
            <button
              onClick={() => handleAnswer('equal')}
              disabled={currentQ.userAnswer !== null}
              className={`px-6 py-3 rounded-lg text-lg font-bold transition-colors ${
                currentQ.userAnswer === 'equal'
                  ? currentQ.isCorrect
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
                {"="}
            </button>
          </div>

          {currentQ.userAnswer !== null && (
            <div className="mt-6">
              {currentQ.isCorrect ? (
                <div className="text-2xl text-green-600 font-bold">✓ Correct!</div>
              ) : (
                <div className="text-2xl text-red-600 font-bold">
                  ✗ Incorrect! {currentQ.num1} {currentQ.num1 > currentQ.num2 ? 'is greater than' : currentQ.num1 < currentQ.num2 ? 'is less than' : 'equals'} {currentQ.num2}
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
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Restart
        </button>
      </div>
    </div>
  );
}