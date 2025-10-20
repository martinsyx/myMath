"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Head from "next/head";

type MissionType = "ascending" | "descending" | "skip-by-2" | "missing-number";
type GameMode = "relaxed" | "timed";

interface NumberItem {
  id: number;
  value: number;
  isCorrect: boolean;
  targetPosition?: number;
  isMissing?: boolean;
}

interface Mission {
  type: MissionType;
  description: string;
  icon: string;
}

const MISSIONS: Mission[] = [
  { type: "ascending", description: "Arrange in ascending order", icon: "📈" },
  { type: "descending", description: "Arrange in descending order", icon: "📉" },
  { type: "skip-by-2", description: "Count by 2s", icon: "✌️" },
  { type: "missing-number", description: "Fill the missing numbers", icon: "🔍" }
];

const TIMED_MODE_SECONDS = 30;

export default function SequenceGame() {
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<NumberItem | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [currentMission, setCurrentMission] = useState<Mission>(MISSIONS[0]);
  const [gameMode, setGameMode] = useState<GameMode>("relaxed");
  const [timeLeft, setTimeLeft] = useState(TIMED_MODE_SECONDS);
  const [hintAvailable, setHintAvailable] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Mission-based number generator
  const generateNumbers = useCallback((count: number, missionType: MissionType) => {
    let sequence: number[] = [];

    switch (missionType) {
      case "ascending":
        // Generate random starting point and create sequence
        const startAsc = Math.floor(Math.random() * 20) + 1;
        sequence = Array.from({ length: count }, (_, i) => startAsc + i);
        break;

      case "descending":
        // Generate descending sequence
        const startDesc = Math.floor(Math.random() * 20) + count;
        sequence = Array.from({ length: count }, (_, i) => startDesc - i);
        break;

      case "skip-by-2":
        // Skip counting by 2s
        const startSkip = Math.floor(Math.random() * 10) * 2 + 2;
        sequence = Array.from({ length: count }, (_, i) => startSkip + i * 2);
        break;

      case "missing-number":
        // Create sequence with some numbers missing (shown as empty slots)
        const startMissing = Math.floor(Math.random() * 10) + 1;
        const fullSequence = Array.from({ length: count + 2 }, (_, i) => startMissing + i);
        // Remove 2 random numbers
        const toRemove = new Set<number>();
        while (toRemove.size < 2) {
          toRemove.add(Math.floor(Math.random() * fullSequence.length));
        }
        sequence = fullSequence.filter((_, i) => !toRemove.has(i));
        break;
    }

    // Shuffle the sequence
    const shuffled = [...sequence];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.map((value, index) => ({
      id: index,
      value,
      isCorrect: false,
      targetPosition: sequence.indexOf(value)
    }));
  }, []);

  // Select mission based on level
  const selectMission = useCallback((level: number): Mission => {
    const missionIndex = Math.floor((level - 1) / 3) % MISSIONS.length;
    return MISSIONS[missionIndex];
  }, []);

  const initializeGame = useCallback(() => {
    const count = Math.min(5 + Math.floor(level / 2), 10); // Maximum 10 numbers
    const mission = selectMission(level);
    setCurrentMission(mission);
    setNumbers(generateNumbers(count, mission.type));
    setHintAvailable(true);
    setShowFeedback(false);
    setTimeLeft(TIMED_MODE_SECONDS);
  }, [level, generateNumbers, selectMission]);

  // Timer effect for timed mode
  useEffect(() => {
    if (gameMode === "timed" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setFeedbackType("error");
            setShowFeedback(true);
            setTimeout(() => {
              setStreak(0);
              initializeGame();
            }, 2000);
            return TIMED_MODE_SECONDS;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameMode, timeLeft, initializeGame]);

  useEffect(() => {
    initializeGame();
  }, [level, initializeGame]);

  const handleDragStart = (e: React.DragEvent, item: NumberItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetItem: NumberItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const newNumbers = [...numbers];
    const draggedIndex = newNumbers.findIndex(item => item.id === draggedItem.id);
    const targetIndex = newNumbers.findIndex(item => item.id === targetItem.id);

    // Swap positions
    [newNumbers[draggedIndex], newNumbers[targetIndex]] = [newNumbers[targetIndex], newNumbers[draggedIndex]];

    setNumbers(newNumbers);
    setDraggedItem(null);
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (selectedIndex === null) {
        setSelectedIndex(index);
      } else {
        // Swap selected with current
        const newNumbers = [...numbers];
        [newNumbers[selectedIndex], newNumbers[index]] = [newNumbers[index], newNumbers[selectedIndex]];
        setNumbers(newNumbers);
        setSelectedIndex(null);
      }
    } else if (e.key === "Escape") {
      setSelectedIndex(null);
    }
  };

  // Mission-specific validation
  const validateOrder = useCallback(() => {
    let isCorrect = false;
    const sortedNumbers = [...numbers].sort((a, b) => a.value - b.value);

    switch (currentMission.type) {
      case "ascending":
        isCorrect = numbers.every((item, index) => {
          const expected = sortedNumbers[index].value;
          return item.value === expected;
        });
        break;

      case "descending":
        const descSorted = [...sortedNumbers].reverse();
        isCorrect = numbers.every((item, index) => {
          const expected = descSorted[index].value;
          return item.value === expected;
        });
        break;

      case "skip-by-2":
      case "missing-number":
        isCorrect = numbers.every((item, index) => {
          const expected = sortedNumbers[index].value;
          return item.value === expected;
        });
        break;
    }

    return isCorrect;
  }, [numbers, currentMission]);

  const checkOrder = () => {
    const isCorrect = validateOrder();

    // Mark each number as correct/incorrect for visual feedback
    const updatedNumbers = numbers.map((item, index) => ({
      ...item,
      isCorrect: isCorrect
    }));
    setNumbers(updatedNumbers);

    if (isCorrect) {
      setFeedbackType("success");
      setShowFeedback(true);
      setShowConfetti(true);

      const newStreak = streak + 1;
      setStreak(newStreak);

      // Bonus points for streak
      const bonusMultiplier = Math.min(newStreak, 5);
      const points = 20 * bonusMultiplier + (gameMode === "timed" ? timeLeft * 2 : 0);
      setScore(score + points);

      setTimeout(() => {
        setLevel(level + 1);
        setShowConfetti(false);
      }, 1500);
    } else {
      setFeedbackType("error");
      setShowFeedback(true);
      setStreak(0);

      setTimeout(() => {
        setShowFeedback(false);
        const resetNumbers = numbers.map(item => ({ ...item, isCorrect: false }));
        setNumbers(resetNumbers);
      }, 1500);
    }

    return isCorrect;
  };

  // Hint system
  const showHint = () => {
    if (!hintAvailable) return;

    // Find first incorrectly placed number
    const sortedNumbers = [...numbers].sort((a, b) => {
      if (currentMission.type === "descending") {
        return b.value - a.value;
      }
      return a.value - b.value;
    });

    const firstWrongIndex = numbers.findIndex((item, index) => {
      return item.value !== sortedNumbers[index].value;
    });

    if (firstWrongIndex !== -1) {
      setSelectedIndex(firstWrongIndex);
      setTimeout(() => setSelectedIndex(null), 2000);
    }

    setHintAvailable(false);
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setStreak(0);
    setShowFeedback(false);
    setShowConfetti(false);
    initializeGame();
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
      <Head>
        <link rel="canonical" href="https://kids-math.com/number-sense/games/sequence" />
      </Head>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-8xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Number Sequencing Game - Kids Math</h1>
        <p className="text-gray-600 text-sm">Master number patterns and sequences!</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg shadow p-1 flex">
          <button
            onClick={() => setGameMode("relaxed")}
            className={`px-6 py-2 rounded-md font-semibold transition-all ${
              gameMode === "relaxed"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-gray-600 hover:text-blue-600"
            }`}
          >
            🧘 Relaxed
          </button>
          <button
            onClick={() => setGameMode("timed")}
            className={`px-6 py-2 rounded-md font-semibold transition-all ${
              gameMode === "timed"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-gray-600 hover:text-blue-600"
            }`}
          >
            ⏱️ Timed
          </button>
        </div>
      </div>

      {/* Mission Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex items-center justify-center space-x-3">
          <span className="text-4xl">{currentMission.icon}</span>
          <div>
            <h2 className="text-xl font-bold">Mission {level}</h2>
            <p className="text-sm opacity-90">{currentMission.description}</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex justify-between items-center mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex space-x-6">
          <div className="text-center">
            <div className="text-sm text-gray-500">Score</div>
            <div className="text-2xl font-bold text-green-600">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Level</div>
            <div className="text-2xl font-bold text-blue-600">{level}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Streak</div>
            <div className="text-2xl font-bold text-orange-600">
              {streak > 0 && "🔥"} {streak}
            </div>
          </div>
        </div>
        {gameMode === "timed" && (
          <div className="text-center">
            <div className="text-sm text-gray-500">Time</div>
            <div className={`text-2xl font-bold ${timeLeft <= 10 ? "text-red-600 animate-pulse" : "text-purple-600"}`}>
              ⏱️ {timeLeft}s
            </div>
          </div>
        )}
      </div>

      {/* Feedback Toast */}
      {showFeedback && (
        <div className={`mb-4 p-4 rounded-lg text-center font-bold text-lg transition-all ${
          feedbackType === "success"
            ? "bg-green-100 text-green-800 border-2 border-green-500"
            : "bg-red-100 text-red-800 border-2 border-red-500"
        }`}>
          {feedbackType === "success" ? (
            <span>✅ Perfect! {streak > 1 && `${streak}x Combo!`}</span>
          ) : (
            <span>❌ Try Again!</span>
          )}
        </div>
      )}

      {/* Number Tiles */}
      <div className="flex justify-center mb-8 min-h-[100px]">
        <div className="flex space-x-4 flex-wrap justify-center gap-3">
          {numbers.map((item, index) => (
            <div
              key={item.id}
              draggable
              tabIndex={0}
              role="button"
              aria-label={`Number ${item.value}, position ${index + 1}`}
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`w-16 h-16 border-2 rounded-xl flex items-center justify-center text-2xl font-bold cursor-move transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                selectedIndex === index
                  ? "bg-yellow-200 border-yellow-500 ring-4 ring-yellow-300 scale-110 animate-pulse"
                  : draggedItem?.id === item.id
                  ? "bg-blue-200 border-blue-500 scale-105"
                  : item.isCorrect && showFeedback
                  ? "bg-green-200 border-green-500"
                  : "bg-white border-gray-300 hover:border-blue-400 hover:shadow-lg"
              }`}
            >
              {item.value}
            </div>
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={checkOrder}
          disabled={showFeedback}
          className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          ✓ Check Order
        </button>
        <button
          onClick={showHint}
          disabled={!hintAvailable || showFeedback}
          className="bg-yellow-500 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          💡 Hint {!hintAvailable && "(Used)"}
        </button>
        <button
          onClick={resetGame}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
        >
          🔄 Restart
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 bg-white rounded-lg p-4 shadow">
        <p className="font-semibold mb-2">How to Play:</p>
        <p>🖱️ Drag tiles to swap positions | ⌨️ Press Enter/Space to select and swap | 💡 Use Hint for help</p>
      </div>
    </div>
  );
}