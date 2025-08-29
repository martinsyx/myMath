"use client"

import React from "react";
import Link from "next/link";
import { Metadata } from "@/components/Metadata";

const pageMetadata = {
  title: "About Us - Kids Math Game",
  description: "Learn about Kids Math Game, our mission to make math fun and accessible for children everywhere through interactive games and activities.",
  path: "/about",
  schemaData: {
    "@type": "AboutPage",
    "name": "About Kids Math Game",
    "description": "Learn about our mission to make math fun and accessible for children everywhere."
  }
};

export default function AboutPage() {
  return (
    <>
      <Metadata
        title={pageMetadata.title}
        description={pageMetadata.description}
        path={pageMetadata.path}
        schemaData={pageMetadata.schemaData}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">About Kids Math Game</h1>
          <p className="text-xl text-gray-600">
            Making math fun and accessible for children everywhere
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center mb-8">
            <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full w-48 h-48 flex items-center justify-center text-white text-6xl font-bold">
                +
              </div>
            </div>
            <div className="md:w-2/3 md:pl-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4">
                At Kids Math Game, we believe that every child deserves to enjoy learning mathematics. 
                Our mission is to transform the way children perceive and interact with math by making 
                it engaging, fun, and accessible through interactive games and activities.
              </p>
              <p className="text-gray-700">
                We are dedicated to helping children build strong mathematical foundations that will 
                serve them throughout their educational journey and beyond.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Why We Exist</h2>
            <p className="text-gray-700 mb-4">
             {` Traditional math education often focuses on rote memorization and repetitive drills, 
              which can make math seem boring or intimidating to many children. We recognized the 
              need for a more engaging approach that taps into children's natural curiosity and 
              love for play.`}
            </p>
            <p className="text-gray-700">
              Our platform combines educational rigor with game-based learning to create an 
              environment where children can explore mathematical concepts at their own pace 
              while having fun.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Approach</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Game-Based Learning</h3>
                <p className="text-gray-700">
                  We use carefully designed games that make abstract mathematical concepts 
                  concrete and understandable for children.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-green-800 mb-2">Progressive Difficulty</h3>
                <p className="text-gray-700">
                 {` Our games adapt to each child's skill level, providing appropriate challenges 
                  that promote growth without causing frustration.`}
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-xl font-semibold text-purple-800 mb-2">Immediate Feedback</h3>
                <p className="text-gray-700">
                  Children receive instant feedback on their answers, helping them learn from 
                  mistakes and build confidence.
                </p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <h3 className="text-xl font-semibold text-orange-800 mb-2">Engaging Visuals</h3>
                <p className="text-gray-700">
                  {`Bright, colorful designs and animations capture children's attention and 
                  make learning enjoyable.`}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Our Community</h2>
            <p className="text-gray-700 mb-6">
             {` We're constantly developing new games and features to enhance your child's 
              mathematical journey. Join our community of parents, teachers, and learners 
              who are making math fun, one game at a time.`}
            </p>
            <Link 
              href="/contact" 
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
