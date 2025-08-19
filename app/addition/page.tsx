"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

const generateProblems = (count = 10, maxNumber = 9) => {
  const problems = []
  for (let i = 0; i < count; i++) {
    const num1 = Math.floor(Math.random() * maxNumber) + 1
    const num2 = Math.floor(Math.random() * maxNumber) + 1
    problems.push({
      id: i + 1,
      num1,
      num2,
      answer: num1 + num2,
      userAnswer: "",
      isCorrect: null as boolean | null,
      showFeedback: false,
    })
  }
  return problems
}

export default function KidsMathPage() {
  const [problemCount, setProblemCount] = useState(10)
  const [numberRange, setNumberRange] = useState(9)
  const [problems, setProblems] = useState(() => generateProblems(problemCount, numberRange))
  const [score, setScore] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true)

  const handleAnswerChange = (id: number, value: string) => {
    // 只允许数字输入
    if (value === "" || /^\d+$/.test(value)) {
      setProblems((prev) =>
        prev.map((problem) => (problem.id === id ? { ...problem, userAnswer: value, showFeedback: false } : problem)),
      )
    }
  }

  const checkAnswer = (id: number) => {
    setProblems((prev) =>
      prev.map((problem) => {
        if (problem.id === id) {
          const isCorrect = Number.parseInt(problem.userAnswer) === problem.answer
          if (isCorrect && problem.isCorrect === null) {
            setScore((s) => s + 1)
            setCompletedCount((c) => c + 1)
          } else if (!isCorrect && problem.isCorrect === true) {
            setScore((s) => s - 1)
          }

          if (!isCorrect && problem.isCorrect === null) {
            setCompletedCount((c) => c + 1)
          }

          return { ...problem, isCorrect, showFeedback: true }
        }
        return problem
      }),
    )
  }

  const resetGame = () => {
    setProblems(generateProblems(problemCount, numberRange))
    setScore(0)
    setCompletedCount(0)
    setShowCelebration(false)
  }

  const generateNewProblems = () => {
    setProblems(generateProblems(problemCount, numberRange))
    setScore(0)
    setCompletedCount(0)
    setShowCelebration(false)
  }

  useEffect(() => {
    const passingScore = Math.ceil(problemCount * 0.7) // 70% correct rate
    if (completedCount === problemCount && score >= passingScore) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    }
  }, [completedCount, score, problemCount])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto mb-8">
       
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4 font-serif">
            Addition Practice - Kids Math Game
          </h2>
        </div>

        <Card className="p-6 mb-6 bg-card border border-border shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-secondary">Practice Settings</h3>
            <Button
              onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
              variant="ghost"
              className="h-10 w-10 p-0 rounded-full hover:bg-primary/10 transition-all duration-200"
            >
              <span className={`text-2xl transition-transform duration-300 ${isSettingsExpanded ? "rotate-180" : ""}`}>
                🔽
              </span>
            </Button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isSettingsExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Problem count selection */}
              <div className="space-y-3">
                <label className="text-lg font-semibold text-secondary block">Number of Problems:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[5, 10, 15, 20].map((count) => (
                    <Button
                      key={count}
                      onClick={() => setProblemCount(count)}
                      variant={problemCount === count ? "default" : "outline"}
                      className={`h-12 text-lg font-semibold rounded-xl transition-all duration-200 hover:scale-105 ${
                        problemCount === count
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "border-2 border-primary/30 hover:border-primary text-secondary"
                      }`}
                    >
                      {count} Problems
                    </Button>
                  ))}
                </div>
              </div>

              {/* Number range selection */}
              <div className="space-y-3">
                <label className="text-lg font-semibold text-secondary block">Number Range:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 9, label: "1-9" },
                    { value: 19, label: "1-20" },
                    { value: 49, label: "1-50" },
                    { value: 99, label: "1-100" },
                  ].map((range) => (
                    <Button
                      key={range.value}
                      onClick={() => setNumberRange(range.value)}
                      variant={numberRange === range.value ? "default" : "outline"}
                      className={`h-12 text-lg font-semibold rounded-xl transition-all duration-200 hover:scale-105 ${
                        numberRange === range.value
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "border-2 border-primary/30 hover:border-primary text-secondary"
                      }`}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate new problems button */}
            <div className="text-center mt-6">
              <Button
                onClick={generateNewProblems}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                🎯 Generate New Problems
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border shadow-md">
          <div className="flex justify-between items-center text-center">
            <div className="flex-1">
              <div className="text-2xl font-bold text-primary">
                {score}/{problemCount}
              </div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-secondary">
                {completedCount}/{problemCount}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="flex-1">
              <Button
                onClick={resetGame}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 Restart
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Celebration animation */}
      {showCelebration && (
        <div className="fixed inset-0 bg-primary/20 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card p-8 rounded-3xl shadow-2xl text-center celebrate border-4 border-primary">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-primary mb-2">Awesome!</h2>
            <p className="text-xl text-muted-foreground">You got {score} problems correct!</p>
          </div>
        </div>
      )}

      {/* Problems grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problems.map((problem) => (
            <Card
              key={problem.id}
              className={`p-6 border transition-all duration-300 hover:shadow-md ${
                problem.showFeedback
                  ? problem.isCorrect
                    ? "border-green-400 bg-green-50"
                    : "border-red-400 bg-red-50"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary mb-4 font-mono">
                    {problem.num1} + {problem.num2} =
                  </div>

                  {/* Input area */}
                  <div className="flex items-center justify-center gap-3">
                    <Input
                      type="text"
                      value={problem.userAnswer}
                      onChange={(e) => handleAnswerChange(problem.id, e.target.value)}
                      className="w-32 h-12 text-2xl text-center font-bold border-2 border-primary/30 focus:border-primary rounded-lg"
                      placeholder="Your answer"
                      maxLength={3}
                    />
                    <Button
                      onClick={() => checkAnswer(problem.id)}
                      disabled={!problem.userAnswer}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground w-12 h-12 p-0 text-xl font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🔍
                    </Button>
                  </div>

                  {/* Feedback information */}
                  {problem.showFeedback && (
                    <div
                      className={`mt-4 p-3 rounded-lg bounce-in ${
                        problem.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {problem.isCorrect ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg">✅</span>
                          <span className="font-semibold">Correct!</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg">❌</span>
                          <span className="font-semibold">The correct answer is {problem.answer}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Show correct answer feedback icons */}
                {problem.showFeedback && (
                  <div className="text-center">
                    <span className={`text-3xl ${problem.isCorrect ? "celebrate" : "wiggle"}`}>
                      {problem.isCorrect ? "🎉" : "💪"}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 text-center">
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-border">
          {/* Keep going, little mathematician! */}
          <p className="text-base text-muted-foreground">🌟 Keep going, little mathematician! 🌟</p>
        </Card>
      </div>
    </div>
  )
}
