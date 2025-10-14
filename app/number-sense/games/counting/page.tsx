"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";

const EMOJI_SETS = [
  { name: 'balloons', emoji: '🎈', pop: '💥', color: 'bg-blue-50' },
  { name: 'fruits', emoji: '🍎', pop: '✨', color: 'bg-red-50' },
  { name: 'stars', emoji: '⭐', pop: '💫', color: 'bg-yellow-50' },
  { name: 'hearts', emoji: '❤️', pop: '💖', color: 'bg-pink-50' },
  { name: 'flowers', emoji: '🌸', pop: '🌺', color: 'bg-purple-50' },
];

export default function CountingGame() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(5);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'playing' | 'success' | 'failed'>('playing');
  const [items, setItems] = useState(Array(15).fill(true));
  const [currentTheme, setCurrentTheme] = useState(EMOJI_SETS[0]);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [combo, setCombo] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Random positions for items
  const [itemPositions, setItemPositions] = useState<Array<{x: number, y: number}>>([]);

  useEffect(() => {
    generateRandomPositions();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isTimerActive && gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('failed');
      setStreak(0);
    }
  }, [timeLeft, isTimerActive, gameState]);

  const generateRandomPositions = () => {
    const positions = [];
    for (let i = 0; i < 15; i++) {
      positions.push({
        x: Math.random() * 80 + 5, // 5-85%
        y: Math.random() * 80 + 5, // 5-85%
      });
    }
    setItemPositions(positions);
  };

  const popItem = (index: number) => {
    if (items[index] && gameState === 'playing') {
      const newItems = [...items];
      newItems[index] = false;
      setItems(newItems);

      const newCount = count + 1;
      setCount(newCount);

      // Combo system - clicking within 1 second
      const now = Date.now();
      if (now - lastClickTime < 1000) {
        setCombo(combo + 1);
      } else {
        setCombo(0);
      }
      setLastClickTime(now);

      // Play sound effect (optional, can add audio later)
      playPopSound();
    }
  };

  const playPopSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800 + (Math.random() * 400);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handleCheck = () => {
    if (count === target) {
      setGameState('success');
      const basePoints = 10;
      const timeBonus = Math.floor(timeLeft / 2);
      const comboBonus = combo * 2;
      const totalPoints = basePoints + timeBonus + comboBonus;

      setScore(score + totalPoints);
      setStreak(streak + 1);
      setShowConfetti(true);

      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      setGameState('failed');
      setStreak(0);
    }
    setIsTimerActive(false);
  };

  const nextLevel = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setCount(0);

    // Progressive difficulty
    const maxItems = Math.min(15, 10 + newLevel);
    const newTarget = Math.floor(Math.random() * Math.min(maxItems - 2, 12)) + 3;
    setTarget(newTarget);

    setGameState('playing');
    setItems(Array(maxItems).fill(true));

    // Change theme every 3 levels
    if (newLevel % 3 === 0) {
      const newTheme = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
      setCurrentTheme(newTheme);
    }

    generateRandomPositions();
    setTimeLeft(30 + Math.floor(newLevel / 2) * 5); // More time for higher levels
    setIsTimerActive(true);
    setCombo(0);
  };

  const resetGame = () => {
    setCount(0);
    setTarget(5);
    setScore(0);
    setLevel(1);
    setGameState('playing');
    setItems(Array(15).fill(true));
    setCurrentTheme(EMOJI_SETS[0]);
    setStreak(0);
    setCombo(0);
    generateRandomPositions();
    setTimeLeft(30);
    setIsTimerActive(true);
  };

  // Generate item elements with random positions
  const itemElements = [];
  const displayCount = Math.min(items.length, 15);

  for (let i = 0; i < displayCount; i++) {
    const pos = itemPositions[i] || { x: (i % 5) * 20, y: Math.floor(i / 5) * 33 };
    itemElements.push(
      <div
        key={i}
        onClick={() => popItem(i)}
        className={`cursor-pointer text-6xl transition-all duration-300 absolute ${
          items[i]
            ? 'hover:scale-125 transform animate-bounce-gentle'
            : 'scale-0 opacity-0'
        }`}
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transition: 'all 0.3s ease',
          animation: items[i] ? `float ${2 + Math.random()}s ease-in-out infinite` : 'none',
        }}
      >
        {items[i] ? currentTheme.emoji : currentTheme.pop}
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-4xl mx-auto mt-12 bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              >
                {['🎉', '⭐', '✨', '🎊', '💫'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">
            🎮 Super Counting Game!
          </h1>
          <p className="text-gray-600">Click exactly {target} {currentTheme.name}!</p>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-3 rounded-lg text-center">
            <div className="text-sm font-semibold">Target</div>
            <div className="text-3xl font-bold">{target}</div>
          </div>
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-3 rounded-lg text-center">
            <div className="text-sm font-semibold">Clicked</div>
            <div className="text-3xl font-bold">{count}</div>
          </div>
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-3 rounded-lg text-center">
            <div className="text-sm font-semibold">Score</div>
            <div className="text-2xl font-bold">{score}</div>
          </div>
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-3 rounded-lg text-center">
            <div className="text-sm font-semibold">Level</div>
            <div className="text-3xl font-bold">{level}</div>
          </div>
          <div className={`bg-gradient-to-r ${timeLeft > 10 ? 'from-cyan-400 to-cyan-600' : 'from-red-400 to-red-600'} text-white p-3 rounded-lg text-center`}>
            <div className="text-sm font-semibold">⏱️ Time</div>
            <div className="text-3xl font-bold">{timeLeft}s</div>
          </div>
        </div>

        {/* Streak and Combo indicators */}
        {streak > 0 && (
          <div className="text-center mb-2">
            <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full font-bold text-sm">
              🔥 {streak} Win Streak!
            </span>
          </div>
        )}
        {combo > 0 && (
          <div className="text-center mb-2">
            <span className="bg-pink-400 text-pink-900 px-4 py-1 rounded-full font-bold text-sm animate-pulse">
              ⚡ {combo}x Combo!
            </span>
          </div>
        )}

        {/* Game area */}
        <div className={`border-4 border-dashed border-gray-300 rounded-2xl mb-4 ${currentTheme.color} p-4 relative`} style={{ minHeight: '400px' }}>
          {itemElements}
        </div>

        {gameState === 'playing' && (
          <div className="text-center space-y-4">
            <button
              onClick={handleCheck}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-12 py-4 rounded-xl text-xl font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              ✓ Check Answer
            </button>
          </div>
        )}

        {gameState === 'success' && (
          <div className="text-center bg-green-50 p-6 rounded-xl border-4 border-green-400">
            <div className="text-6xl mb-3 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">Perfect!</h2>
            <p className="text-gray-700 mb-3">
              You counted exactly {target} items!
            </p>
            <div className="flex justify-center gap-4 text-sm mb-4">
              <span className="bg-white px-3 py-1 rounded-full">⏱️ Time Bonus: +{Math.floor(timeLeft / 2)}</span>
              {combo > 0 && <span className="bg-white px-3 py-1 rounded-full">⚡ Combo: +{combo * 2}</span>}
            </div>
            <div className="space-x-4">
              <button
                onClick={nextLevel}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
              >
                🚀 Next Level
              </button>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                🔄 Restart Game
              </button>
            </div>
          </div>
        )}

        {gameState === 'failed' && (
          <div className="text-center bg-red-50 p-6 rounded-xl border-4 border-red-400">
            <div className="text-6xl mb-3">😅</div>
            <h2 className="text-3xl font-bold text-red-600 mb-2">Oops!</h2>
            <p className="text-gray-700 mb-4">
              You clicked {count} items, but the target was {target}.
              {timeLeft === 0 && <span className="block text-red-600 font-bold mt-2">⏰ Time's up!</span>}
            </p>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        <Head>
          <title>Super Counting Game - Fun Math for Kids | Easy Math</title>
          <meta name="description" content="Play our super fun counting game! Click the right number of items, earn combos, and level up. Perfect for kids learning to count!" />
          <link rel="canonical" href="https://kids-math.com/number-sense/games/counting" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LearningResource",
                "name": "Super Counting Game - Kids Math",
                "description": "Interactive counting game with multiple themes, combos, and progressive difficulty. Perfect for kids learning to count!",
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
    </>
  );
}
