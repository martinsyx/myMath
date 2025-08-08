import React from "react";

// Generate 10 subtraction questions
function generateSubtractionQuestions(count = 10) {
  const questions = [];
  while (questions.length < count) {
    const a = Math.floor(Math.random() * 50) + 10; // 10-59
    const b = Math.floor(Math.random() * a) + 1; // 确保结果为正数
    questions.push({ a, b });
  }
  return questions;
}

export default function SubtractionPage() {
  const questions = generateSubtractionQuestions(10);
  return (
    <div className="max-w-xl mx-auto mt-12 bg-white rounded shadow p-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Subtraction Practice - Kids Math Game</h1>
      <ul className="space-y-4">
        {questions.map((q, idx) => (
          <li key={idx} className="flex items-center text-lg">
            <span className="mr-2">{idx + 1}.</span>
            <span className="mr-2">{q.a}</span>
            <span className="mr-2">-</span>
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