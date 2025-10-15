"use client";
import React, { useState, useCallback, useRef } from "react";
import Head from "next/head";

const ITEM_THEMES = [
  { name: 'Fruits', items: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝'], color: 'bg-red-50', border: 'border-red-200' },
  { name: 'Animals', items: ['🐶', '🐱', '🐰', '🐻', '🐼', '🐨', '🦁', '🐯'], color: 'bg-green-50', border: 'border-green-200' },
  { name: 'Sports', items: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸'], color: 'bg-blue-50', border: 'border-blue-200' },
  { name: 'Toys', items: ['🎮', '🎲', '🧸', '🎯', '🪀', '🎨', '🎭', '🎪'], color: 'bg-purple-50', border: 'border-purple-200' },
  { name: 'Foods', items: ['🍕', '🍔', '🌮', '🍟', '🍿', '🥨', '🥐', '🧁'], color: 'bg-yellow-50', border: 'border-yellow-200' },
  { name: 'Nature', items: ['🌺', '🌸', '🌻', '🌹', '🌷', '🌼', '💐', '🏵️'], color: 'bg-pink-50', border: 'border-pink-200' },
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePositions(count: number) {
  const positions: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < count; i++) {
    let x = 0;
    let y = 0;
    let overlap = false;
    let attempts = 0;

    do {
      x = Math.random() * 75 + 5;
      y = Math.random() * 75 + 5;
      overlap = positions.some(pos =>
        Math.abs(pos.x - x) < 12 && Math.abs(pos.y - y) < 12
      );
      attempts++;
    } while (overlap && attempts < 50);

    positions.push({ x, y });
  }

  return positions;
}

// Generate questions helper - pure function
function generateQuestions(theme: typeof ITEM_THEMES[0], count: number, maxCount: number) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const emoji = theme.items[Math.floor(Math.random() * theme.items.length)];
    const itemCount = getRandomInt(1, maxCount);
    questions.push({
      count: itemCount,
      emoji,
      positions: generatePositions(itemCount),
      userAnswer: null,
      isCorrect: null
    });
  }
  return questions;
}

interface Question {
  count: number;
  emoji: string;
  positions: Array<{ x: number; y: number }>;
  userAnswer: number | null;
  isCorrect: boolean | null;
  responseTime?: number;
}

export default function MatchingGame() {
  const [questions, setQuestions] = useState<Question[]>(() => generateQuestions(ITEM_THEMES[0], 10, 10));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [currentTheme, setCurrentTheme] = useState(ITEM_THEMES[0]);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);

  // Use refs to avoid recreating audio context
  const audioContextRef = useRef<AudioContext | null>(null);
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup all timers
  const cleanupTimers = useCallback(() => {
    if (celebrationTimerRef.current) {
      clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = null;
    }
    if (answerTimerRef.current) {
      clearTimeout(answerTimerRef.current);
      answerTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  // Start countdown timer
  const startCountdown = useCallback(() => {
    if (countdownTimerRef.current) return;

    countdownTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          cleanupTimers();
          setGameState('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cleanupTimers]);

  // Memoized play sound function
  const playSound = useCallback((frequency: number, duration: number) => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch {
      // Silently fail if audio context is not supported
    }
  }, []);

  const handleAnswer = useCallback((answer: number) => {
    if (!questions[currentQuestion] || questions[currentQuestion].userAnswer !== null) return;

    const currentQ = questions[currentQuestion];
    const isCorrect = answer === currentQ.count;
    const responseTime = Date.now() - questionStartTime;

    // Update current question
    const newQuestions = [...questions];
    newQuestions[currentQuestion] = {
      ...currentQ,
      userAnswer: answer,
      isCorrect,
      responseTime
    };
    setQuestions(newQuestions);

    // Calculate points
    let points = 0;
    let newStreak = streak;

    if (isCorrect) {
      points = 10;
      if (responseTime < 3000) points += 5;

      newStreak = streak + 1;
      if (newStreak >= 3) points += newStreak * 2;

      setScore(prev => prev + points);
      setStreak(newStreak);
      setPerfectStreak(prev => prev + 1);
      playSound(800, 0.15);

      // Celebration
      if (newStreak % 5 === 0 && newStreak > 0) {
        setShowCelebration(true);
        if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
        celebrationTimerRef.current = setTimeout(() => setShowCelebration(false), 1500);
      }
    } else {
      setStreak(0);
      setPerfectStreak(0);
      playSound(200, 0.3);
    }

    // Move to next question or complete game
    if (answerTimerRef.current) clearTimeout(answerTimerRef.current);
    answerTimerRef.current = setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setQuestionStartTime(Date.now());
        startCountdown();
      } else {
        cleanupTimers();
        setGameState('completed');
        setTotalTime(45 - timeLeft);
      }
    }, 1500);
  }, [questions, currentQuestion, questionStartTime, streak, timeLeft, playSound, startCountdown, cleanupTimers]);

  const nextLevel = useCallback(() => {
    const newLevel = level + 1;
    const newTheme = ITEM_THEMES[(newLevel - 1) % ITEM_THEMES.length];
    const maxCount = Math.min(15, 10 + newLevel);

    cleanupTimers();
    setLevel(newLevel);
    setCurrentQuestion(0);
    setGameState('playing');
    setCurrentTheme(newTheme);
    setQuestions(generateQuestions(newTheme, 10, maxCount));
    setTimeLeft(45 + Math.floor(newLevel / 2) * 5);
    setQuestionStartTime(Date.now());
    startCountdown();
  }, [level, cleanupTimers, startCountdown]);

  const resetGame = useCallback(() => {
    const theme = ITEM_THEMES[0];

    cleanupTimers();
    setQuestions(generateQuestions(theme, 10, 10));
    setCurrentQuestion(0);
    setScore(0);
    setLevel(1);
    setGameState('playing');
    setCurrentTheme(theme);
    setStreak(0);
    setPerfectStreak(0);
    setTimeLeft(45);
    setTotalTime(0);
    setQuestionStartTime(Date.now());
    startCountdown();
  }, [cleanupTimers, startCountdown]);

  const currentQ = questions[currentQuestion];

  // Extract primitive values to use as dependencies
  const currentCount = currentQ?.count;

  // Fixed item positions per question to avoid flicker
  const itemPositions = currentQ?.positions ?? [];

  // Calculate options
  const options = (() => {
    if (!currentCount) return [];

    const desiredOptionCount = 9;
    const optionsSet = new Set<number>();
    optionsSet.add(currentCount);

    let lower = currentCount - 1;
    let upper = currentCount + 1;
    const upperLimit = currentCount + desiredOptionCount;

    // Expand outward from the correct answer until we have enough unique choices.
    while (optionsSet.size < desiredOptionCount) {
      if (lower >= 1) {
        optionsSet.add(lower);
        lower -= 1;
      }

      if (optionsSet.size >= desiredOptionCount) break;

      if (upper <= upperLimit) {
        optionsSet.add(upper);
        upper += 1;
      } else if (lower < 1) {
        break;
      } else {
        upper += 1;
      }
    }

    return Array.from(optionsSet).sort((a, b) => a - b);
  })();

  // Generate confetti
  const confettiItems = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 0.8 + Math.random() * 0.5,
    emoji: ['🎉', '⭐', '✨', '💫', '🎊'][Math.floor(Math.random() * 5)]
  }));

  if (questions.length === 0 || !currentQ) {
    return (
      <div className="max-w-5xl mx-auto mt-12 bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>

      <Head>
        <link rel="canonical" href="https://kids-math.com/number-sense/games/matching" />
      </Head>

      <div className="max-w-5xl mx-auto mt-12 bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Celebration confetti */}
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none z-50">
            {confettiItems.map(item => (
              <div
                key={item.id}
                className="absolute text-3xl animate-ping"
                style={{
                  left: `${item.left}%`,
                  top: `${item.top}%`,
                  animationDelay: `${item.delay}s`,
                  animationDuration: `${item.duration}s`,
                }}
              >
                {item.emoji}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">
            🎯 {currentTheme.name} Counting Challenge!
          </h1>
          <p className="text-gray-600 text-lg">Count the {currentTheme.name.toLowerCase()} and pick the right number!</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-3 rounded-xl text-center shadow-lg">
            <div className="text-xs font-semibold">💯 Score</div>
            <div className="text-2xl font-bold">{score}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-3 rounded-xl text-center shadow-lg">
            <div className="text-xs font-semibold">📊 Level</div>
            <div className="text-2xl font-bold">{level}</div>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-3 rounded-xl text-center shadow-lg">
            <div className="text-xs font-semibold">❓ Question</div>
            <div className="text-2xl font-bold">{currentQuestion + 1}/10</div>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-3 rounded-xl text-center shadow-lg">
            <div className="text-xs font-semibold">🔥 Streak</div>
            <div className="text-2xl font-bold">{streak}</div>
          </div>
          <div className={`bg-gradient-to-br ${timeLeft > 15 ? 'from-cyan-400 to-cyan-600' : 'from-red-400 to-red-600'} text-white p-3 rounded-xl text-center shadow-lg ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
            <div className="text-xs font-semibold">⏱️ Time</div>
            <div className="text-2xl font-bold">{timeLeft}s</div>
          </div>
          <div className="bg-gradient-to-br from-pink-400 to-pink-600 text-white p-3 rounded-xl text-center shadow-lg">
            <div className="text-xs font-semibold">✨ Perfect</div>
            <div className="text-2xl font-bold">{perfectStreak}</div>
          </div>
        </div>

        {/* Streak indicator */}
        {streak >= 3 && (
          <div className="text-center mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg animate-pulse">
              🔥 {streak} Streak! Keep going! 🔥
            </span>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            {/* Items Display Area */}
            <div className={`${currentTheme.color} ${currentTheme.border} border-4 rounded-2xl mb-6 relative shadow-inner`} style={{ minHeight: '350px', height: '350px' }}>
              {itemPositions.map((pos, i) => (
                <div
                  key={`${currentQuestion}-${i}`}
                  className="absolute text-5xl"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    animation: `float ${2 + (i % 3)}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  {currentQ.emoji}
                </div>
              ))}
            </div>

            {/* Answer Options */}
            <div className="mb-6">
              <h3 className="text-center text-xl font-bold text-gray-700 mb-4">
                How many {currentTheme.name.toLowerCase()} do you see? 🤔
              </h3>
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                {options.map(num => (
                  <button
                    key={num}
                    onClick={() => handleAnswer(num)}
                    disabled={currentQ.userAnswer !== null}
                    className={`h-16 rounded-xl text-2xl font-bold border-3 transition-all transform hover:scale-110 shadow-lg ${
                      currentQ.userAnswer === num
                        ? currentQ.isCorrect
                          ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 scale-110'
                          : 'bg-gradient-to-br from-red-400 to-red-600 text-white border-red-700 scale-110'
                        : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50 active:scale-95'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            {currentQ.userAnswer !== null && (
              <div className="text-center mb-4">
                {currentQ.isCorrect ? (
                  <div className="bg-green-100 border-4 border-green-400 rounded-xl p-4 inline-block">
                    <div className="text-4xl mb-2 animate-bounce">🎉</div>
                    <div className="text-2xl text-green-700 font-bold">Perfect! +10 points</div>
                    {currentQ.responseTime && currentQ.responseTime < 3000 && (
                      <div className="text-sm text-green-600 font-semibold mt-1">⚡ Speed Bonus! +5</div>
                    )}
                    {streak >= 3 && (
                      <div className="text-sm text-orange-600 font-semibold">🔥 Streak Bonus! +{streak * 2}</div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-100 border-4 border-red-400 rounded-xl p-4 inline-block">
                    <div className="text-4xl mb-2">😅</div>
                    <div className="text-2xl text-red-700 font-bold">
                      Oops! The answer was {currentQ.count}
                    </div>
                    <div className="text-sm text-red-600 mt-1">Try again next time!</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {gameState === 'completed' && (
          <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border-4 border-blue-400 shadow-xl">
            <div className="text-7xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-4xl font-bold text-blue-700 mb-4">Level Complete!</h2>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-3xl font-bold text-purple-600">{score}</div>
                <div className="text-sm text-gray-600">Total Score</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-3xl font-bold text-green-600">{totalTime}s</div>
                <div className="text-sm text-gray-600">Time Used</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-3xl font-bold text-orange-600">{perfectStreak}</div>
                <div className="text-sm text-gray-600">Perfect Answers</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="text-3xl font-bold text-blue-600">{Math.round((score / 100) * 100)}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>

            <div className="space-x-4">
              <button
                onClick={nextLevel}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-4 rounded-xl text-xl font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
              >
                🚀 Next Level
              </button>
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-10 py-4 rounded-xl text-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                🔄 Restart
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="text-center mt-4">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-gray-500 hover:to-gray-600 transition-all"
            >
              🔄 Restart Game
            </button>
          </div>
        )}
      </div>
    </>
  );
}
