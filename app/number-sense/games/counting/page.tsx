"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

const EMOJI_SETS = [
  { name: 'balloons', emoji: '🎈', pop: '💥', color: 'bg-blue-50' },
  { name: 'fruits', emoji: '🍎', pop: '✨', color: 'bg-red-50' },
  { name: 'stars', emoji: '⭐', pop: '💫', color: 'bg-yellow-50' },
  { name: 'hearts', emoji: '❤️', pop: '💖', color: 'bg-pink-50' },
  { name: 'flowers', emoji: '🌸', pop: '🌺', color: 'bg-purple-50' },
];

type ItemPosition = { x: number; y: number; vx: number; vy: number };

const createPositions = (count: number): ItemPosition[] =>
  Array.from({ length: count }, (_, index) => {
    const x = Math.random() * 100;
    // Stagger the starting heights to spread out balloons vertically
    const y = 100 + Math.random() * 50 + (index * 15); // More spread out vertically
    const speed = 0.15 + Math.random() * 0.25; // Varied upward speed
    const horizontalDrift = (Math.random() - 0.5) * 0.3; // More horizontal drift

    return {
      x,
      y,
      vx: horizontalDrift,
      vy: -speed, // Negative for upward movement
    };
  });

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

  // Random positions for items with velocity
  const [itemPositions, setItemPositions] = useState<ItemPosition[]>(() => createPositions(15));
  const positionsRef = useRef<ItemPosition[]>(itemPositions);
  const itemNodesRef = useRef<Array<HTMLDivElement | null>>([]);
  const animationFrameRef = useRef<number | null>(null);

  const generateRandomPositions = useCallback((count: number) => {
    const positions = createPositions(count);
    positionsRef.current = positions;
    setItemPositions(positions);
  }, []);

  useEffect(() => {
    positionsRef.current = itemPositions;
  }, [itemPositions]);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = () => {
      const nextPositions = positionsRef.current.map((pos, index) => {
        let newX = pos.x + pos.vx;
        let newY = pos.y + pos.vy;

        // Horizontal bounds with wrapping
        if (newX < -5) newX = 105;
        if (newX > 105) newX = -5;

        // Vertical movement: if goes off top, reset to bottom with new random x
        if (newY < -10) {
          // Check if item hasn't been clicked
          if (items[index]) {
            newY = 110 + Math.random() * 30; // Reset to bottom with random offset
            newX = Math.random() * 100; // New random x position
            // Generate new horizontal drift and speed variation
            const newVx = (Math.random() - 0.5) * 0.3;
            const newSpeed = 0.15 + Math.random() * 0.25;
            return { x: newX, y: newY, vx: newVx, vy: -newSpeed };
          }
        }

        const node = itemNodesRef.current[index];
        if (node) {
          node.style.transform = `translate3d(${newX}%, ${newY}%, 0) translate3d(-50%, -50%, 0)`;
        }

        return { x: newX, y: newY, vx: pos.vx, vy: pos.vy };
      });

      positionsRef.current = nextPositions;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [gameState]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
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
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
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

    setItems(Array(maxItems).fill(true));
    generateRandomPositions(maxItems);
    setGameState('playing');

    // Change theme every 3 levels
    if (newLevel % 3 === 0) {
      const newTheme = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
      setCurrentTheme(newTheme);
    }

    setTimeLeft(30 + Math.floor(newLevel / 2) * 5); // More time for higher levels
    setIsTimerActive(true);
    setCombo(0);
  };

  const resetGame = () => {
    setCount(0);
    setTarget(5);
    setScore(0);
    setLevel(1);
    setItems(Array(15).fill(true));
    generateRandomPositions(15);
    setGameState('playing');
    setCurrentTheme(EMOJI_SETS[0]);
    setStreak(0);
    setCombo(0);
    setTimeLeft(30);
    setIsTimerActive(true);
  };

  // Generate item elements with random positions
  const itemElements: React.ReactElement[] = [];
  const activePositions = positionsRef.current.length ? positionsRef.current : itemPositions;
  const displayCount = Math.min(items.length, activePositions.length || items.length, 15);

  for (let i = 0; i < displayCount; i++) {
    const fallbackX = (i % 5) * 20;
    const fallbackY = Math.floor(i / 5) * 33;
    const pos = activePositions[i] || { x: fallbackX, y: fallbackY, vx: 0, vy: 0 };
    const isActive = items[i];

    itemElements.push(
      <div
        key={i}
        ref={(el) => {
          itemNodesRef.current[i] = el;
        }}
        className="absolute pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(${pos.x}%, ${pos.y}%, 0) translate3d(-50%, -50%, 0)`,
        }}
      >
        <div
          onClick={() => popItem(i)}
          className={`pointer-events-auto cursor-pointer select-none text-5xl transform-gpu transition-all duration-150 ease-out ${
            isActive
              ? 'opacity-100 scale-100 hover:scale-125'
              : 'opacity-0 scale-0 pointer-events-none'
          }`}
          style={{
            filter: isActive ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' : 'none',
          }}
        >
          {isActive ? currentTheme.emoji : currentTheme.pop}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto mt-4 bg-white rounded-2xl shadow-2xl p-4 relative overflow-hidden min-h-screen flex flex-col">
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

        <div className="text-center mb-3">
          <h1 className="text-3xl font-bold text-blue-700 mb-1">
            🎮 Super Counting Game!
          </h1>
          <p className="text-gray-600 text-sm">Click exactly {target} {currentTheme.name}!</p>
        </div>

        {/* Game area with stats inside */}
        <div className={`border-4 border-dashed border-gray-300 rounded-2xl mb-2 ${currentTheme.color} p-3 relative`} style={{ height: '400px' }}>
          {/* Game Stats - positioned inside game area */}
          <div className="grid grid-cols-5 gap-1.5 mb-2 relative z-10">
            <div className="bg-gradient-to-r from-green-400/80 to-green-600/80 backdrop-blur-sm text-white p-1 rounded-md text-center shadow-md">
              <div className="text-[10px] font-semibold">Target</div>
              <div className="text-lg font-bold leading-tight">{target}</div>
            </div>
            <div className="bg-gradient-to-r from-blue-400/80 to-blue-600/80 backdrop-blur-sm text-white p-1 rounded-md text-center shadow-md">
              <div className="text-[10px] font-semibold">Clicked</div>
              <div className="text-lg font-bold leading-tight">{count}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-400/80 to-purple-600/80 backdrop-blur-sm text-white p-1 rounded-md text-center shadow-md">
              <div className="text-[10px] font-semibold">Score</div>
              <div className="text-base font-bold leading-tight">{score}</div>
            </div>
            <div className="bg-gradient-to-r from-orange-400/80 to-orange-600/80 backdrop-blur-sm text-white p-1 rounded-md text-center shadow-md">
              <div className="text-[10px] font-semibold">Level</div>
              <div className="text-lg font-bold leading-tight">{level}</div>
            </div>
            <div className={`bg-gradient-to-r ${timeLeft > 10 ? 'from-cyan-400/80 to-cyan-600/80' : 'from-red-400/80 to-red-600/80'} backdrop-blur-sm text-white p-1 rounded-md text-center shadow-md`}>
              <div className="text-[10px] font-semibold">⏱️ Time</div>
              <div className="text-lg font-bold leading-tight">{timeLeft}s</div>
            </div>
          </div>

          {/* Streak and Combo indicators */}
          <div className="flex justify-center gap-2 mb-2 min-h-[20px] relative z-10">
            {streak > 0 && (
              <span className="bg-yellow-400/90 backdrop-blur-sm text-yellow-900 px-2 py-0.5 rounded-full font-bold text-[10px] shadow-md">
                🔥 {streak} Win Streak!
              </span>
            )}
            {combo > 0 && (
              <span className="bg-pink-400/90 backdrop-blur-sm text-pink-900 px-2 py-0.5 rounded-full font-bold text-[10px] animate-pulse shadow-md">
                ⚡ {combo}x Combo!
              </span>
            )}
          </div>

          {/* Game items */}
          <div className="absolute inset-3 top-20" style={{ pointerEvents: 'none' }}>
            <div className="relative w-full h-full" style={{ pointerEvents: 'auto' }}>
              {itemElements}
            </div>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="text-center py-2">
            <button
              onClick={handleCheck}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-2.5 rounded-xl text-base font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              ✓ Check Answer
            </button>
          </div>
        )}

        {gameState === 'success' && (
          <div className="text-center bg-green-50 p-3 rounded-xl border-2 border-green-400">
            <div className="text-3xl mb-1 animate-bounce">🎉</div>
            <h2 className="text-xl font-bold text-green-600 mb-1">Perfect!</h2>
            <p className="text-gray-700 text-xs mb-2">
              You counted exactly {target} items!
            </p>
            <div className="flex justify-center gap-2 text-xs mb-2">
              <span className="bg-white px-2 py-0.5 rounded-full">⏱️ +{Math.floor(timeLeft / 2)}</span>
              {combo > 0 && <span className="bg-white px-2 py-0.5 rounded-full">⚡ +{combo * 2}</span>}
            </div>
            <div className="flex justify-center gap-2">
              <button
                onClick={nextLevel}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
              >
                🚀 Next Level
              </button>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                🔄 Restart
              </button>
            </div>
          </div>
        )}

        {gameState === 'failed' && (
          <div className="text-center bg-red-50 p-3 rounded-xl border-2 border-red-400">
            <div className="text-3xl mb-1">😅</div>
            <h2 className="text-xl font-bold text-red-600 mb-1">Oops!</h2>
            <p className="text-gray-700 text-xs mb-2">
              You clicked {count} items, but the target was {target}.
              {timeLeft === 0 && <span className="block text-red-600 font-bold mt-1">⏰ Time&apos;s up!</span>}
            </p>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
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
