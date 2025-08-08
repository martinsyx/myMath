import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded shadow p-8">
      <h1 title="kids math games" className="text-3xl font-bold mb-6 text-blue-700 text-center">Welcome to kids-Math - Kids Math Games</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        A fun and interactive platform designed for kids to learn math through games and activities.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Number Sense</h2>
          <p className="text-gray-600 mb-4">Build number sense with simple addition games</p>
          <Link 
            href="/number-sense"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Start Game
          </Link>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Addition Practice</h2>
          <p className="text-gray-600 mb-4">Practice addition up to 20 with fun math games</p>
          <Link 
            href="/addition"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Start Game
          </Link>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Subtraction Practice</h2>
          <p className="text-gray-600 mb-4">Learn subtraction skills with interactive games</p>
          <Link 
            href="/subtraction"
            className="inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Start Game
          </Link>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-800">Multiplication Mastery</h2>
          <p className="text-gray-600 mb-4">Master multiplication tables with kids math games</p>
          <Link 
            href="/multiplication"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Start Game
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link 
          href="/division"
          className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Division Practice
        </Link>
      </div>
    </div>
  );
} 