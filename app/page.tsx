import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded shadow p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center">欢迎来到 EasyMath</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        一个专为数学学习设计的互动平台
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">数感学习</h2>
          <p className="text-gray-600 mb-4">通过简单的加法练习培养数感</p>
          <Link 
            href="/number-sense"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            开始练习
          </Link>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-800">加法学习</h2>
          <p className="text-gray-600 mb-4">练习20以内的加法运算</p>
          <Link 
            href="/addition"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            开始练习
          </Link>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">减法学习</h2>
          <p className="text-gray-600 mb-4">练习减法运算技巧</p>
          <Link 
            href="/subtraction"
            className="inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            开始练习
          </Link>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-800">乘法学习</h2>
          <p className="text-gray-600 mb-4">掌握乘法口诀表</p>
          <Link 
            href="/multiplication"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            开始练习
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link 
          href="/division"
          className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          除法学习
        </Link>
      </div>
    </div>
  );
} 