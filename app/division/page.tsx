import React from "react";

// Generate 10 division questions
function generateDivisionQuestions(count = 10) {
  const questions = [];
  while (questions.length < count) {
    const a = Math.floor(Math.random() * 100) + 10; // 10-109
    const b = Math.floor(Math.random() * 12) + 1; // 1-12
    // 确保能整除
    const result = Math.floor(a / b);
    const dividend = result * b;
    questions.push({ a: dividend, b });
  }
  return questions;
}

export default function DivisionPage() {
  const questions = generateDivisionQuestions(10);
  return (
    <div className="max-w-xl mx-auto mt-12 bg-white rounded shadow p-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">
        Division Practice - Kids Math Game
      </h1>
      <ul className="space-y-4">
        {questions.map((q, idx) => (
          <li key={idx} className="flex items-center text-lg">
            <span className="mr-2">{idx + 1}.</span>
            <span className="mr-2">{q.a}</span>
            <span className="mr-2">÷</span>
            <span className="mr-2">{q.b}</span>
            <span className="mx-2">=</span>
            <input
              type="text"
              className="border-b-2 border-blue-200 focus:border-blue-500 outline-none w-16 text-center text-blue-700 bg-transparent"
              placeholder="Your answer"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}