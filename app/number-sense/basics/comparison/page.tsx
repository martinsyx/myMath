"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Question {
  num1: number;
  num2: number;
  userAnswer: 'greater' | 'less' | 'equal' | null;
  isCorrect: boolean | null;
}

export default function ComparisonGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');

  const generateQuestions = () => {
    const newQuestions: Question[] = [];
    for (let i = 0; i < 10; i++) {
      const num1 = Math.floor(Math.random() * 50) + 1;
      const num2 = Math.floor(Math.random() * 50) + 1;
      newQuestions.push({
        num1,
        num2,
        userAnswer: null,
        isCorrect: null
      });
    }
    return newQuestions;
  };

  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  const handleAnswer = (answer: 'greater' | 'less' | 'equal') => {
    const currentQ = questions[currentQuestion];
    let isCorrect = false;
    
    if (answer === 'greater' && currentQ.num1 > currentQ.num2) {
      isCorrect = true;
    } else if (answer === 'less' && currentQ.num1 < currentQ.num2) {
      isCorrect = true;
    } else if (answer === 'equal' && currentQ.num1 === currentQ.num2) {
      isCorrect = true;
    }
    
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
    }, 1500);
  };

  const resetGame = () => {
    setQuestions(generateQuestions());
    setCurrentQuestion(0);
    setScore(0);
    setGameState('playing');
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded shadow p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">大小比较</h1>
        <p className="text-gray-600">比较两个数字的大小关系</p>
      </div>

      <div className="flex justify-center space-x-8 mb-8">
        <div className="text-lg">
          得分: <span className="font-bold text-green-600">{score}</span>
        </div>
        <div className="text-lg">
          题目: <span className="font-bold text-blue-600">{currentQuestion + 1}/10</span>
        </div>
      </div>

      {gameState === 'playing' && currentQ && (
        <div className="text-center">
          <div className="mb-8">
            <div className="text-6xl font-bold text-blue-600 mb-4">{currentQ.num1}</div>
            <div className="text-2xl text-gray-600 mb-4">与</div>
            <div className="text-6xl font-bold text-purple-600 mb-8">{currentQ.num2}</div>
          </div>
          
          <div className="text-xl mb-6">第一个数字比第二个数字：</div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleAnswer('greater')}
              disabled={currentQ.userAnswer !== null}
              className={`px-6 py-3 rounded-lg text-lg font-bold transition-colors ${
                currentQ.userAnswer === 'greater'
                  ? currentQ.isCorrect
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              大
            </button>
            <button
              onClick={() => handleAnswer('less')}
              disabled={currentQ.userAnswer !== null}
              className={`px-6 py-3 rounded-lg text-lg font-bold transition-colors ${
                currentQ.userAnswer === 'less'
                  ? currentQ.isCorrect
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              小
            </button>
            <button
              onClick={() => handleAnswer('equal')}
              disabled={currentQ.userAnswer !== null}
              className={`px-6 py-3 rounded-lg text-lg font-bold transition-colors ${
                currentQ.userAnswer === 'equal'
                  ? currentQ.isCorrect
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              相等
            </button>
          </div>

          {currentQ.userAnswer !== null && (
            <div className="mt-6">
              {currentQ.isCorrect ? (
                <div className="text-2xl text-green-600 font-bold">✓ 正确！</div>
              ) : (
                <div className="text-2xl text-red-600 font-bold">
                  ✗ 错误！{currentQ.num1} {currentQ.num1 > currentQ.num2 ? '大于' : currentQ.num1 < currentQ.num2 ? '小于' : '等于'} {currentQ.num2}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {gameState === 'completed' && (
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">游戏完成！</h2>
          <p className="text-gray-600 mb-6">你的最终得分：{score}/100</p>

          <button
            onClick={resetGame}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            再玩一次
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={resetGame}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4"
        >
          重新开始
        </button>
        <Link 
          href="/number-sense"
          className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          返回数感学习
        </Link>
      </div>
    </div>
  );
} 