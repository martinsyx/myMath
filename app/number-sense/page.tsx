import React from "react";
import Link from "next/link";

export default function NumberSensePage() {
  return (
    <div className="max-w-4xl mx-auto mt-12 bg-white rounded shadow p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-700 text-center">数感学习</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 数字游戏板块 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">🎮</span>
            </div>
            <h2 className="text-xl font-semibold text-blue-800">数字游戏</h2>
          </div>
          <p className="text-gray-600 mb-4 text-center">
            通过有趣的游戏培养数字感知能力
          </p>
          <div className="space-y-3">
            <Link 
              href="/number-sense/games/counting"
              className="block w-full bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700 transition-colors"
            >
              数数游戏
            </Link>
            <Link 
              href="/number-sense/games/matching"
              className="block w-full bg-blue-500 text-white px-4 py-2 rounded text-center hover:bg-blue-600 transition-colors"
            >
              数字配对
            </Link>
            <Link 
              href="/number-sense/games/sequence"
              className="block w-full bg-blue-400 text-white px-4 py-2 rounded text-center hover:bg-blue-500 transition-colors"
            >
              数字排序
            </Link>
          </div>
        </div>

        {/* 数字规律板块 */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">🔍</span>
            </div>
            <h2 className="text-xl font-semibold text-green-800">数字规律</h2>
          </div>
          <p className="text-gray-600 mb-4 text-center">
            发现数字之间的规律和模式
          </p>
          <div className="space-y-3">
            <Link 
              href="/number-sense/patterns/odd-even"
              className="block w-full bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700 transition-colors"
            >
              奇偶数规律
            </Link>
            <Link 
              href="/number-sense/patterns/skip-counting"
              className="block w-full bg-green-500 text-white px-4 py-2 rounded text-center hover:bg-green-600 transition-colors"
            >
              跳数规律
            </Link>
            <Link 
              href="/number-sense/patterns/sequences"
              className="block w-full bg-green-400 text-white px-4 py-2 rounded text-center hover:bg-green-500 transition-colors"
            >
              数列规律
            </Link>
          </div>
        </div>

        {/* 数学启蒙板块 */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">🌟</span>
            </div>
            <h2 className="text-xl font-semibold text-purple-800">数学启蒙</h2>
          </div>
          <p className="text-gray-600 mb-4 text-center">
            基础数学概念和思维训练
          </p>
          <div className="space-y-3">
            <Link 
              href="/number-sense/basics/comparison"
              className="block w-full bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700 transition-colors"
            >
              大小比较
            </Link>
            <Link 
              href="/number-sense/basics/estimation"
              className="block w-full bg-purple-500 text-white px-4 py-2 rounded text-center hover:bg-purple-600 transition-colors"
            >
              数量估算
            </Link>
            <Link 
              href="/number-sense/basics/visualization"
              className="block w-full bg-purple-400 text-white px-4 py-2 rounded text-center hover:bg-purple-500 transition-colors"
            >
              数字可视化
            </Link>
          </div>
        </div>
      </div>

      {/* 返回首页按钮 */}
      <div className="mt-8 text-center">
        <Link 
          href="/"
          className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
} 