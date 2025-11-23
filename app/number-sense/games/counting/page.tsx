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

const POSITION_LIMITS = {
  minX: 5,
  maxX: 95,
  minY: 5,
  maxY: 90,
};

const MIN_DISTANCE_BETWEEN_ITEMS = 12;

type ItemPosition = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  waveOffset: number;
  waveSpeed: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const createRandomPosition = (existingPositions: ItemPosition[]): ItemPosition => {
  let attempts = 0;
  let candidate: ItemPosition = {
    x: POSITION_LIMITS.minX,
    y: POSITION_LIMITS.minY,
    vx: 0,
    vy: 0,
    waveOffset: 0,
    waveSpeed: 0.002,
  };

  while (attempts < 25) {
    const horizontalDrift = (Math.random() - 0.5) * 0.6;
    const verticalDirection = Math.random() > 0.5 ? 1 : -1;
    const verticalSpeed = 0.05 + Math.random() * 0.25;

    candidate = {
      x: POSITION_LIMITS.minX + Math.random() * (POSITION_LIMITS.maxX - POSITION_LIMITS.minX),
      y: POSITION_LIMITS.minY + Math.random() * (POSITION_LIMITS.maxY - POSITION_LIMITS.minY),
      vx: horizontalDrift,
      vy: verticalDirection * verticalSpeed,
      waveOffset: Math.random() * Math.PI * 2,
      waveSpeed: 0.001 + Math.random() * 0.003,
    };

    const overlaps = existingPositions.some(
      (pos) =>
        Math.hypot(pos.x - candidate.x, pos.y - candidate.y) < MIN_DISTANCE_BETWEEN_ITEMS
    );

    if (!overlaps) {
      break;
    }

    attempts += 1;
  }

  return candidate;
};

const createPositions = (count: number): ItemPosition[] => {
  const positions: ItemPosition[] = [];
  for (let i = 0; i < count; i += 1) {
    positions.push(createRandomPosition(positions));
  }
  return positions;
};

const createFallbackPositions = (count: number): ItemPosition[] => {
  const fallback: ItemPosition[] = [];
  for (let i = 0; i < count; i += 1) {
    const fallbackX = (i % 5) * 20;
    const fallbackY = Math.floor(i / 5) * 33;
    fallback.push({
      x: fallbackX,
      y: fallbackY,
      vx: 0,
      vy: 0,
      waveOffset: 0,
      waveSpeed: 0.002,
    });
  }
  return fallback;
};

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
  const [itemPositions, setItemPositions] = useState<ItemPosition[]>(() => createFallbackPositions(15));
  const positionsRef = useRef<ItemPosition[]>(itemPositions);
  const itemNodesRef = useRef<Array<HTMLDivElement | null>>([]);
  const animationFrameRef = useRef<number | null>(null);
  const itemsRef = useRef(items);

  const generateRandomPositions = useCallback((count: number) => {
    const positions = createPositions(count);
    positionsRef.current = positions;
    setItemPositions(positions);
  }, []);

  useEffect(() => {
    positionsRef.current = itemPositions;
  }, [itemPositions]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    generateRandomPositions(itemsRef.current.length);
  }, [generateRandomPositions]);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = () => {
      const now = performance.now();
      const nextPositions = positionsRef.current.map((pos, index) => {
        const horizontalWave = Math.sin(now * pos.waveSpeed + pos.waveOffset) * 0.4;
        let newVx = pos.vx;
        let newVy = pos.vy;
        let newX = pos.x + newVx + horizontalWave;
        let newY = pos.y + newVy;

        if (newX <= POSITION_LIMITS.minX || newX >= POSITION_LIMITS.maxX) {
          newX = clamp(newX, POSITION_LIMITS.minX, POSITION_LIMITS.maxX);
          newVx = -newVx || (Math.random() - 0.5) * 0.6;
        }

        if (newY <= POSITION_LIMITS.minY || newY >= POSITION_LIMITS.maxY) {
          newY = clamp(newY, POSITION_LIMITS.minY, POSITION_LIMITS.maxY);
          newVy = -newVy || (Math.random() > 0.5 ? 0.12 : -0.12);
        }

        if (itemsRef.current[index] && Math.random() < 0.01) {
          newVx = (Math.random() - 0.5) * 0.6;
          newVy = (Math.random() - 0.5) * 0.3;
        }

        const node = itemNodesRef.current[index];
        if (node) {
          node.style.left = `${newX}%`;
          node.style.top = `${newY}%`;
          node.style.transform = "translate(-50%, -50%)";
        }

        return {
          ...pos,
          x: clamp(newX, POSITION_LIMITS.minX, POSITION_LIMITS.maxX),
          y: clamp(newY, POSITION_LIMITS.minY, POSITION_LIMITS.maxY),
          vx: newVx,
          vy: newVy,
        };
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
    const pos =
      activePositions[i] || {
        x: fallbackX,
        y: fallbackY,
        vx: 0,
        vy: 0,
        waveOffset: 0,
        waveSpeed: 0.002,
      };
    const isActive = items[i];

    itemElements.push(
      <div
        key={i}
        ref={(el) => {
          itemNodesRef.current[i] = el;
        }}
        className="absolute pointer-events-none will-change-transform"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: "translate(-50%, -50%)",
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
          <div className="flex gap-1.5 mb-2 relative z-10">
            <div className="bg-gradient-to-r from-green-400/80 to-green-600/80 backdrop-blur-sm text-white p-1 rounded-md text-center shadow-md min-w-[80px]">
              <div className="text-[10px] font-semibold">Click/Target</div>
              <div className="font-bold leading-tight">
                <span className="text-lg">{count}</span>
                <span className="text-base">/</span>
                <span className="text-2xl">{target}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-400/80 to-purple-600/80 backdrop-blur-sm text-white p-1 rounded-md text-center shadow-md min-w-[80px]">
              <div className="text-[10px] font-semibold">Score</div>
              <div className="text-base font-bold leading-tight">{score}</div>
            </div>
            <div className={`bg-gradient-to-r ${timeLeft > 10 ? 'from-cyan-400/80 to-cyan-600/80' : 'from-red-400/80 to-red-600/80'} backdrop-blur-sm text-white p-1 rounded-md text-center shadow-md min-w-[80px]`}>
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
