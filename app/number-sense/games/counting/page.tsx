"use client";
import React, { useState } from "react";
import Link from "next/link";
import Head from "next/head";

export default function CountingGame() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(5);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'success' | 'failed'>('playing');

  const handleCount = () => {
    const newCount = count + 1;
    setCount(newCount);
    
    if (newCount === target) {
      setGameState('success');
      setScore(score + 10);
    } else if (newCount > target) {
      setGameState('failed');
    }
  };

  const resetGame = () => {
    setCount(0);
    setTarget(Math.floor(Math.random() * 10) + 1);
    setGameState('playing');
  };

  const nextLevel = () => {
    setCount(0);
    setTarget(Math.floor(Math.random() * 10) + 1);
    setGameState('playing');
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded shadow p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Counting Game - Kids Math</h1>
        <p className="text-gray-600">Click the button to count up to the target number!</p>
      </div>

      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-blue-500 mb-4">{count}</div>
        <div className="text-xl text-gray-600 mb-4">
          Target: <span className="font-bold text-green-600">{target}</span>
        </div>
        <div className="text-lg text-purple-600 mb-6">
          Score: <span className="font-bold">{score}</span>
        </div>
      </div>

      {gameState === 'playing' && (
        <div className="text-center">
          <button
            onClick={handleCount}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Count
          </button>
        </div>
      )}

      {gameState === 'success' && (
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">Awesome!</h2>
          <p className="text-gray-600 mb-6">You counted up to {target}!</p>
          <div className="space-x-4">
            <button
              onClick={nextLevel}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Next Level
            </button>
            <button
              onClick={resetGame}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Restart
            </button>
          </div>
        </div>
      )}

      {gameState === 'failed' && (
        <div className="text-center">
          <div className="text-4xl mb-4">😅</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-6">You counted past the target! The target was {target}.</p>
          <button
            onClick={resetGame}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Restart
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link 
          href="/number-sense"
          className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Number Sense
        </Link>
      <Head>
        <link rel="canonical" href="https://kids-math.com/number-sense/games/counting" />
      </Head>
      </div>
    </div>
  );
} 