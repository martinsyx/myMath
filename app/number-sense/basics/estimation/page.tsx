"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Question {
  dots: number;
  userAnswer: number | null;
  isCorrect: boolean | null;
}

export default function EstimationGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');

  const generateQuestions = () => {
    const newQuestions: Question[] = [];
    for (let i = 0; i < 10; i++) {
      const dots = Math.floor(Math.random() * 20) + 5; // 5-24个点
      newQuestions.push({
        dots,
        userAnswer: null,
        isCorrect: null
      });
    }
    return newQuestions;
  };

  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  const handleAnswer = (answer: number) => {
    const currentQ = questions[currentQuestion];
    const difference = Math.abs(answer - currentQ.dots);
    const isCorrect = difference <= 2; // 允许2个点的误差
    
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
    }, 2000);
  };

  const resetGame = () => {
    setQuestions(generateQuestions());
    setCurrentQuestion(0);
    setScore(0);
    setGameState('playing');
  };

  const currentQ = questions[currentQuestion];

  const renderDots = (count: number) => {
    const dots = [];
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      dots.push(
        <div
          key={i}
          className="w-4 h-4 bg-red-500 rounded-full"
          style={{
            position: 'absolute',
            left: `${(col / cols) * 100}%`,
            top: `${(row / rows) * 100}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      );
    }
    return dots;
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded shadow p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">Estimation Game - Kids Math</h1>
        <p className="text-gray-600">Quickly estimate the number of dots (within 2 dots of error allowed)</p>
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
            <div className="text-lg mb-4">Estimate how many dots there are:</div>
            <div className="relative w-64 h-64 mx-auto border-2 border-gray-300 rounded-lg bg-gray-50">
              {renderDots(currentQ.dots)}
            </div>
          </div>

          <div className="mb-8">
            <div className="text-lg mb-4">Your estimate:</div>
            <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
              {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map(num => (
                <button
                  key={num}
                  onClick={() => handleAnswer(num)}
                  disabled={currentQ.userAnswer !== null}
                  className={`w-12 h-12 border-2 rounded-lg text-sm font-bold transition-colors ${
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
                <div className="text-2xl text-green-600 font-bold">✓ Correct estimation!</div>
              ) : (
                <div className="text-2xl text-red-600 font-bold">
                  ✗ Incorrect! The actual number of dots is {currentQ.dots}
                </div>
              )}
              <div className="text-gray-600 mt-2">
                Your estimate: {currentQ.userAnswer}, Actual: {currentQ.dots}
              </div>
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
  );
}