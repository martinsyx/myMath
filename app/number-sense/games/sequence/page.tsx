"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
interface NumberItem {
  id: number;
  value: number;
  isCorrect: boolean;
}

export default function SequenceGame() {
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<NumberItem | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const generateNumbers = (count: number) => {
    const nums = Array.from({ length: count }, (_, i) => i + 1);
    // Shuffle randomly
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    
    return nums.map((value, index) => ({
      id: index,
      value,
      isCorrect: false
    }));
  };

  const initializeGame = () => {
    const count = Math.min(5 + level, 10); // Maximum 10 numbers
    setNumbers(generateNumbers(count));
  };

  useEffect(() => {
    initializeGame();
  }, [level]);

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

  const checkOrder = () => {
    const isCorrect = numbers.every((item, index) => item.value === index + 1);
    
    if (isCorrect) {
      setScore(score + 20);
      setLevel(level + 1);
      setTimeout(() => {
        initializeGame();
      }, 1000);
    }
    
    return isCorrect;
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    initializeGame();
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 bg-white rounded shadow p-8">
        <Head>
          <link rel="canonical" href="https://kids-math.com/number-sense/games/sequence" />
        </Head>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Number Sequencing Game - Kids Math</h1>
        <p className="text-gray-600">Arrange the numbers in ascending order</p>
      </div>

      <div className="flex justify-center space-x-8 mb-8">
        <div className="text-lg">
          Score: <span className="font-bold text-green-600">{score}</span>
        </div>
        <div className="text-lg">
          Level: <span className="font-bold text-blue-600">{level}</span>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex space-x-4 flex-wrap justify-center">
          {numbers.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item)}
              className={`w-16 h-16 border-2 rounded-lg flex items-center justify-center text-2xl font-bold cursor-move transition-all ${
                draggedItem?.id === item.id
                  ? 'bg-blue-200 border-blue-500'
                  : 'bg-white border-gray-300 hover:border-blue-400'
              }`}
            >
              {item.value}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mb-8">
        <button
          onClick={checkOrder}
          className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-green-700 transition-colors mr-4"
        >
          Check Order
        </button>
        <button
          onClick={resetGame}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Restart
        </button>
      </div>

    </div>
  );
}