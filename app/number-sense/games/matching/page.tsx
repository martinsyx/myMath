"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const FRUIT = "🍎";

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface Question {
  count: number;
  userAnswer: number | null;
  isCorrect: boolean | null;
}

export default function FruitMatchingGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');

  // Generate 10 questions, each with 1-10 fruits
  const generateQuestions = () => {
    const newQuestions: Question[] = [];
    for (let i = 0; i < 10; i++) {
      newQuestions.push({
        count: getRandomInt(1, 10),
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
    const isCorrect = answer === currentQ.count;
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
    }, 1000);
  };

  const resetGame = () => {
    setQuestions(generateQuestions());
    setCurrentQuestion(0);
    setScore(0);
    setGameState('playing');
  };

  const currentQ = questions[currentQuestion];

  // Render fruits, always 5 columns per row, overflow to second row
  const renderFruits = (count: number) => {
    const fruits = [];
    for (let i = 0; i < count; i++) {
      fruits.push(
        <div key={i} className="flex items-center justify-center text-4xl w-12 h-12">
          {FRUIT}
        </div>
      );
    }
    // Fill empty spaces to make 5 columns per row
    while (fruits.length < 5) fruits.push(<div key={"empty1-"+fruits.length} className="w-12 h-12" />);
    const firstRow = fruits.slice(0, 5);
    const secondRow = fruits.slice(5);
    while (secondRow.length < 5 && secondRow.length > 0) secondRow.push(<div key={"empty2-"+secondRow.length} className="w-12 h-12" />);
    return (
      <div className="inline-block">
        <div className="flex flex-row justify-center mb-2">{firstRow}</div>
        {secondRow.length > 0 && <div className="flex flex-row justify-center">{secondRow}</div>}
      </div>
    );
  };

  // Generate 9 options, ensure correct answer is included
  const getOptions = (answer: number) => {
    const options = new Set<number>();
    options.add(answer);
    while (options.size < 9) {
      const n = getRandomInt(1, 10);
      options.add(n);
    }
    return Array.from(options).sort((a, b) => a - b);
  };

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white rounded shadow p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Fruit Counting Game - Kids Math</h1>
        <p className="text-gray-600">Count the fruits and choose the correct answer below!</p>
      </div>

      <div className="flex justify-center mb-8">
        {currentQ && renderFruits(currentQ.count)}
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
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-8">
          {getOptions(currentQ.count).map(num => (
            <button
              key={num}
              onClick={() => handleAnswer(num)}
              disabled={currentQ.userAnswer !== null}
              className={`w-20 h-12 rounded-lg text-xl font-bold border-2 transition-colors ${
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
      )}

      {currentQ && currentQ.userAnswer !== null && (
        <div className="text-center mb-8">
          {currentQ.isCorrect ? (
            <div className="text-2xl text-green-600 font-bold">✓ Correct!</div>
          ) : (
            <div className="text-2xl text-red-600 font-bold">
              ✗ Incorrect! The correct answer is {currentQ.count}
            </div>
          )}
        </div>
      )}

      {gameState === 'completed' && (
        <div className="text-center mb-8">
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

      <div className="text-center">
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