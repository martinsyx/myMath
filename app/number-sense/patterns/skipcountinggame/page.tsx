"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Metadata } from "@/components/Metadata";

interface Question {
  sequence: (number | null)[];
  pattern: string;
  missingIndex: number;
  correctAnswer: number;
  answerOptions: number[];
  userAnswer: number | null;
  isCorrect: boolean | null;
}

export default function SequencesGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [showPatternHint, setShowPatternHint] = useState(false);
  const [showRules, setShowRules] = useState(true);

  const generateQuestion = (): Question => {
    const patterns = [
      { type: 'add', value: 2, name: '+2' },
      { type: 'add', value: 3, name: '+3' },
      { type: 'add', value: 5, name: '+5' },
      { type: 'multiply', value: 2, name: '*2' },
      { type: 'multiply', value: 3, name: '*3' }
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    // 限制start的范围，确保生成的答案不会太大
    const start = Math.floor(Math.random() * 3) + 1;  // 1-3
    const sequence: (number | null)[] = [start];  // 明确声明类型
    
    for (let i = 1; i < 5; i++) {
  const previousNumber = sequence[i-1];
  // 确保previousNumber不是null
  if (previousNumber !== null) {
    if (pattern.type === 'add') {
      sequence.push(previousNumber + pattern.value);
    } else {
      sequence.push(previousNumber * pattern.value);
    }
  }
}
    
    const missingIndex = Math.floor(Math.random() * 3) + 1;
    // 确保correctAnswer不是null
    const correctAnswer = sequence[missingIndex] as number;
    
    // 生成答案选项，确保正确答案在其中
    const answerOptions: number[] = [];
    // 添加正确答案
    answerOptions.push(correctAnswer);
    
    // 添加一些干扰项
    while (answerOptions.length < 8) {
      // 生成一个接近正确答案的随机数
      const offset = Math.floor(Math.random() * 11) - 5; // -5到5的随机数
      const option = correctAnswer + offset;
      
      // 确保选项是正数且不重复
      if (option > 0 && !answerOptions.includes(option)) {
        answerOptions.push(option);
      }
    }
    
    // 打乱选项顺序
    for (let i = answerOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answerOptions[i], answerOptions[j]] = [answerOptions[j], answerOptions[i]];
    }
    
    const displaySequence: (number | null)[] = [...sequence];  // 明确声明类型
    displaySequence[missingIndex] = null;
    
    return {
      sequence: displaySequence,
      pattern: pattern.name,
      missingIndex,
      correctAnswer,
      answerOptions,
      userAnswer: null,
      isCorrect: null
    };
  };

  const generateQuestions = () => {
    const newQuestions: Question[] = [];
    for (let i = 0; i < 10; i++) {
      newQuestions.push(generateQuestion());
    }
    return newQuestions;
  };

  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  const handleAnswer = (answer: number) => {
    const currentQ = questions[currentQuestion];
    // 使用存储在问题对象中的正确答案
    const correctAnswer = currentQ.correctAnswer;
    
    const isCorrect = answer === correctAnswer;
    
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
        // 重置Pattern hint的显示状态
        setShowPatternHint(false);
      } else {
        setGameState('completed');
      }
    }, 1500);
  };

  const resetGame = () => {
    console.log("Resetting game...");
    setQuestions(generateQuestions());
    setCurrentQuestion(0);
    setScore(0);
    setGameState('playing');
  };

  const currentQ = questions[currentQuestion];

  const renderSequence = (sequence: (number | null)[]) => {
    return sequence.map((num, index) => (
      <div key={index} className="w-16 h-16 border-2 rounded-lg flex items-center justify-center text-xl font-bold">
        {num !== null ? num : '?'}
      </div>
    ));
  };

  // SEO metadata for the skip counting game page
  const pageMetadata = {
    title: "Skip Counting Game – Practice Number Patterns | Kids-Math.com",
    description: "Fun skip counting game for kids! Practice number patterns by filling in missing numbers. Great for ages 5–8 to build number sense and prepare for multiplication.",
    path: "/number-sense/patterns/skipcountinggame",
    schemaData: {
      "@type": "EducationalGame",
      "name": "Skip Counting Game",
      "url": "https://kids-math.com/number-sense/patterns/skipcountinggame",
      "description": "A fun skip counting game for kids ages 5–8. Practice number patterns by filling in missing numbers, strengthen number sense, and prepare for multiplication.",
      "educationalLevel": ["Kindergarten", "Grade 1", "Grade 2"],
      "learningResourceType": "Game",
      "about": [
        "Skip counting",
        "Number patterns",
        "Math practice",
        "Arithmetic"
      ],
      "audience": {
        "@type": "EducationalAudience",
        "educationalRole": "Learner",
        "typicalAgeRange": "5-8"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Kids-Math.com",
        "url": "https://kids-math.com"
      }
    }
  };


  return (
    <>
      <Metadata
        title={pageMetadata.title}
        description={pageMetadata.description}
        path={pageMetadata.path}
        schemaData={pageMetadata.schemaData}
      />
      <div className="max-w-4xl mx-auto mt-12 bg-white rounded shadow p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-4">Skip Counting Game – Practice Number Patterns</h1>
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
        <div className="text-center">
          <div className="mb-8">
            <div className="text-lg mb-4">What number should replace the question mark?</div>
            <div className="flex justify-center space-x-4">
              {renderSequence(currentQ.sequence)}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Pattern hint: 
              {showPatternHint ? (
                <span className="ml-2 font-bold">{currentQ.pattern}</span>
              ) : (
                <button 
                  onClick={() => setShowPatternHint(true)}
                  className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="text-lg mb-4">Choose your answer:</div>
            <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
              {currentQ.answerOptions?.map((num: number) => (
                <button
                  key={num}
                  onClick={() => handleAnswer(num)}
                  disabled={currentQ.userAnswer !== null}
                  className={`w-12 h-12 border-2 rounded-lg text-lg font-bold transition-colors ${
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
          </div>

          {currentQ.userAnswer !== null && (
            <div className="mt-6">
              {currentQ.isCorrect ? (
                <div className="text-2xl text-green-600 font-bold">✓ Correct!</div>
              ) : (
            <div className="text-2xl text-red-600 font-bold">
              ✗ Incorrect! The correct answer is {currentQ.correctAnswer}
            </div>
              )}
            </div>
          )}
        </div>
      )}

      {gameState === 'completed' && (
        <div className="text-center">
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

      <div className="mt-8 text-center  mb-8">
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



        <div className="text-center mb-8 mt-20">
          <h2 className="text-2xl font-bold text-green-700 mb-4">About This Game</h2>
          <p className="text-gray-600">Welcome to the Skip Counting Game! This interactive activity helps children strengthen their understanding of number patterns. By practicing skip counting (jumping by 2s, 5s, 10s, and more), kids can improve their number sense and prepare for multiplication and division. The game displays a sequence of numbers with some missing, and the challenge is to choose the correct numbers to complete the pattern.</p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Learning Objectives</h2>
          <ul className="text-gray-600 list-disc list-inside text-left max-w-2xl mx-auto">
            <li>Recognize and continue number patterns with equal intervals.</li>
            <li>Improve number sense and quick thinking skills.</li>
            <li>Build a foundation for multiplication, division, and higher-level math concepts.</li>
          </ul>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Who Is This Game For?</h2>
          <p className="text-gray-600">This game is designed for children ages <strong>5–8</strong>, suitable for kindergarten, 1st grade, and 2nd grade students.</p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">How to Play</h2>
          <ol className="text-gray-600 list-decimal list-inside text-left max-w-2xl mx-auto">
            <li>A sequence of 10 numbers will appear, but some numbers are missing.</li>
            <li>Look at the pattern (for example, counting by 2s or 5s) and select the missing numbers.</li>
            <li>Earn points for each correct answer and see how many rounds you can complete!</li>
          </ol>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Why Skip Counting Is Important</h2>
          <p className="text-gray-600">Skip counting is more than just memorizing numbers. It helps children see arithmetic patterns and strengthens the connection between addition and multiplication. Research shows that skip counting supports early math development and problem-solving skills. By turning this concept into a game, kids stay motivated, practice repeatedly, and learn while having fun.</p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Start Playing Now</h2>
          <p className="text-gray-600"><strong>Are you ready to test your skills?</strong> Find the pattern in the sequence and fill in the missing number!</p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600"><strong>Q: What skills does this game develop?</strong> This game helps children develop number sense, pattern recognition, and foundational math skills that are crucial for understanding multiplication and division. It also enhances cognitive abilities like attention, memory, and logical reasoning.</p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Extra Practice Worksheets</h2>
          <p className="text-gray-600">You can download a free printable worksheet here to practice skip counting offline.</p>
        </div>

      {/* Rules Section */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowRules(!showRules)}>
          <h2 className="text-2xl font-bold text-green-700">Game Rules</h2>
          <svg 
            className={`w-6 h-6 transform transition-transform ${showRules ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {showRules && (
          <div className="mt-4 text-gray-600">
            <ul className="list-disc list-inside space-y-2">
              <li>Identify the pattern in the sequence of numbers (e.g., counting by 2s, 5s, or 10s)</li>
              <li>Select the correct missing number from the options provided</li>
              <li>Earn 10 points for each correct answer</li>
              <li>Complete all 10 questions to finish the game</li>
              <li>Use the pattern hint if you need help identifying the sequence</li>
            </ul>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
