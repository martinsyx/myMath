"use client";
import React, { useState } from "react";
import Link from "next/link";
import Head from "next/head";

export default function CountingGame() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(5);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'success' | 'failed'>('playing');
  const [balloons, setBalloons] = useState(Array(10).fill(true)); // Track balloon states

  const popBalloon = (index: number) => {
    if (balloons[index] && gameState === 'playing') {
      // Update balloon state
      const newBalloons = [...balloons];
      newBalloons[index] = false;
      setBalloons(newBalloons);
      
      // Increase count
      const newCount = count + 1;
      setCount(newCount);
    }
  };

  const handleCheck = () => {
    if (count === target) {
      setGameState('success');
      setScore(score + 10);
    } else {
      setGameState('failed');
    }
  };

  const resetGame = () => {
    setCount(0);
    setTarget(Math.floor(Math.random() * 10) + 1);
    setGameState('playing');
    setBalloons(Array(10).fill(true)); // Reset all balloons
  };

  const nextLevel = () => {
    setCount(0);
    setTarget(Math.floor(Math.random() * 10) + 1);
    setGameState('playing');
    setBalloons(Array(10).fill(true)); // Reset all balloons
  };

  // Generate balloon elements
  const balloonElements = [];
  for (let i = 0; i < 10; i++) {
    balloonElements.push(
      <div
        key={i}
        onClick={() => popBalloon(i)}
        className={`cursor-pointer text-5xl transition-all duration-300 ${
          balloons[i] 
            ? 'hover:scale-110 transform' 
            : 'scale-0 opacity-0'
        }`}
        style={{
          position: 'absolute',
          left: `${(i % 5) * 20 + 10}%`,
          top: `${Math.floor(i / 5) * 30 + 10}%`,
          transition: 'all 0.3s ease'
        }}
      >
        {balloons[i] ? '🎈' : '💥'}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded shadow p-8 relative">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Balloon Pop Math Game - Counting Game for Kids</h1>
        {/* <p className="text-gray-600">Play this fun <span className="font-bold">balloon popping game for kids</span>! Pop the balloons to reach the target number. This is a great way to practice <span className="font-bold">maths counting games</span> and improve number recognition!</p> */}
      </div>

      <div className="text-center mb-2">
        <div className="flex justify-center items-center gap-10 text-xl text-gray-600 mb-4">
          <div>Target: <span className="font-bold text-green-600 text-2xl">{target}</span></div>
          <div>Score: <span className="font-bold">{score}</span></div>
        </div>
        <div className="text-lg text-blue-600 mb-3">
          Balloons Popped: <span className="font-bold text-2xl">{count}</span>
        </div>
      </div>

      {/* Balloon area */}
      <div className="relative h-50 border-2 border-dashed border-gray-300 rounded-lg mb-4 bg-blue-50">
        {balloonElements}
      </div>

      {gameState === 'playing' && (
        <div className="text-center space-y-4">
          <button
            onClick={handleCheck}
            className="bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-green-700 transition-colors"
          >
            Check Answer
          </button>
        </div>
      )}

      {gameState === 'success' && (
        <div className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Awesome!</h2>
          <p className="text-gray-600 mb-2">You popped exactly {target} balloons!</p>
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
          <div className="text-4xl mb-2">😅</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-2">You popped {count} balloons, but the target was {target}.</p>
          <button
            onClick={resetGame}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
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
          <title>Balloon Pop Math Game - Counting Game for Kids | Easy Math Fun</title>
          <meta name="description" content="Play our fun balloon popping game for kids! This free maths counting game helps children learn to count with easy math activities. Perfect for early learners!" />
          <link rel="canonical" href="https://kids-math.com/number-sense/games/counting" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LearningResource",
                "name": "Balloon Pop Counting Game - Kids Math",
                "description": "Interactive balloon popping game for kids to practice number recognition and counting skills. This fun maths counting game is perfect for easy math learning.",
                "educationalLevel": "Elementary",
                "learningResourceType": "Game",
                "interactivityType": "Interactive",
                "audience": {
                  "@type": "EducationalAudience",
                  "educationalRole": "student",
                  "ageRange": "5-12"
                }
              })
            }}
          />
        </Head>
      </div>
    </div>
  );
}
