"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Script from "next/script"

import {
  DEFAULT_LEVEL,
  LEVEL_CONFIG,
  ProblemAttempt,
  SkillLevel,
  summarizePerformance,
  getLevelConfig,
} from "@/lib/performance-metrics"

type Problem = {
  id: number
  num1: number
  num2: number
  answer: number
  userAnswer: string
  isCorrect: boolean | null
  showFeedback: boolean
  attempts: number
  difficulty: SkillLevel
  targetTimeMs?: number
  skillTags: string[]
}

type RemoteProblemPayload = {
  id: string
  num1: number
  num2: number
  answer?: number
  difficulty?: SkillLevel
  targetTimeMs?: number
  skillTags?: string[]
}

type ProblemGeneratorResponse = {
  problems?: RemoteProblemPayload[]
  meta?: {
    fallback?: boolean
    source?: string
  }
}

export type AdditionPageMetadata = {
  title: string
  description: string
  path: string
  canonical: string
  schemaData: Record<string, unknown>
}

export const defaultAdditionPageMetadata: AdditionPageMetadata = {
  title: "Addition Practice - Fun Math Games for Kids Learning Addition",
  description:
    "Practice addition with our fun and interactive math games for kids. Free online addition games to help children learn and master basic addition skills up to 100.",
  path: "/addition",
  canonical: "https://kids-math.com/addition",
  schemaData: {
    "@type": ["WebSite", "WebApplication"],
    "alternateType": "EducationalApplication",
    "applicationCategory": "Education",
    "gamePlatform": ["Web Browser", "Mobile Web"],
    "educationalUse": ["Practice", "Assessment"],
    "interactivityType": "Interactive",
    "learningResourceType": "Game",
    "skillLevel": ["Beginner", "Intermediate"],
    "educationalAlignment": {
      "@type": "AlignmentObject",
      "alignmentType": "teaches",
      "educationalFramework": "Mathematics",
      "targetName": "Addition Skills",
    },
  },
}

type AdditionPracticePageProps = {
  metadataOverrides?: Partial<AdditionPageMetadata>
}

const ATTEMPT_STORAGE_KEY = "additionPracticeAttempts"
const MAX_ATTEMPT_LOGS = 50
const BASE_SKILL_TAGS = ["basic-addition"]

const createProblem = (
  id: number,
  num1: number,
  num2: number,
  options: {
    difficulty?: SkillLevel
    targetTimeMs?: number
    skillTags?: string[]
  } = {},
): Problem => {
  const difficulty = options.difficulty ?? DEFAULT_LEVEL
  const targetTimeMs = options.targetTimeMs ?? getLevelConfig(difficulty).targetTimeMs

  return {
    id,
    num1,
    num2,
    answer: num1 + num2,
    userAnswer: "",
    isCorrect: null,
    showFeedback: false,
    attempts: 0,
    difficulty,
    targetTimeMs,
    skillTags: options.skillTags ?? [...BASE_SKILL_TAGS],
  }
}

const generateInitialProblems = (count = 10, maxNumber = 9, difficulty: SkillLevel = DEFAULT_LEVEL) => {
  const problems: Problem[] = []
  for (let i = 0; i < count; i++) {
    const num1 = (i % maxNumber) + 1
    const num2 = Math.floor(i / maxNumber) + 1
    problems.push(createProblem(i + 1, num1, num2, { difficulty }))
  }
  return problems
}

const generateRandomProblems = (count = 10, maxNumber = 9, difficulty: SkillLevel = DEFAULT_LEVEL) => {
  const problems: Problem[] = []
  for (let i = 0; i < count; i++) {
    const num1 = Math.floor(Math.random() * maxNumber) + 1
    const num2 = Math.floor(Math.random() * maxNumber) + 1
    problems.push(createProblem(i + 1, num1, num2, { difficulty }))
  }
  return problems
}

const formatServerProblems = (items: RemoteProblemPayload[] = [], fallbackLevel: SkillLevel): Problem[] => {
  return items
    .filter((item) => Number.isFinite(item?.num1) && Number.isFinite(item?.num2))
    .map((item, index) => {
      const difficulty = item.difficulty ?? fallbackLevel
      const targetTimeMs = typeof item.targetTimeMs === "number" ? item.targetTimeMs : getLevelConfig(difficulty).targetTimeMs
      return createProblem(index + 1, item.num1, item.num2, {
        difficulty,
        targetTimeMs,
        skillTags: item.skillTags?.filter((tag) => typeof tag === "string") ?? [...BASE_SKILL_TAGS],
      })
    })
}

export function AdditionPracticePage({ metadataOverrides }: AdditionPracticePageProps) {
  const metadata: AdditionPageMetadata = {
    ...defaultAdditionPageMetadata,
    ...metadataOverrides,
    schemaData: metadataOverrides?.schemaData
      ? {
          ...defaultAdditionPageMetadata.schemaData,
          ...metadataOverrides.schemaData,
        }
      : defaultAdditionPageMetadata.schemaData,
  }

  const [problemCount] = useState(10)
  const [numberRange] = useState(9)
  const [problems, setProblems] = useState<Problem[]>(() => generateInitialProblems(problemCount, numberRange))
  const [score, setScore] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [problemAttempts, setProblemAttempts] = useState<ProblemAttempt[]>([])
  const [problemTimers, setProblemTimers] = useState<Record<number, number>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMessage, setGenerationMessage] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = window.localStorage.getItem(ATTEMPT_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length) {
          setProblemAttempts(parsed as ProblemAttempt[])
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!problemAttempts.length) {
      window.localStorage.removeItem(ATTEMPT_STORAGE_KEY)
      return
    }
    window.localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(problemAttempts.slice(-MAX_ATTEMPT_LOGS)))
  }, [problemAttempts])

  const performanceSummary = useMemo(() => summarizePerformance(problemAttempts), [problemAttempts])
  const recommendedLevel = performanceSummary.recommendedLevel ?? DEFAULT_LEVEL
  const levelLabel = LEVEL_CONFIG[recommendedLevel]?.label ?? LEVEL_CONFIG[DEFAULT_LEVEL].label

  const applyProblemSet = useCallback((nextProblems: Problem[]) => {
    setProblems(nextProblems)
    setScore(0)
    setCompletedCount(0)
    setShowCelebration(false)
    setProblemTimers({})
  }, [])

  const fallbackProblems = useCallback(
    () => generateRandomProblems(problemCount, numberRange, recommendedLevel),
    [problemCount, numberRange, recommendedLevel],
  )

  const logAttempt = useCallback((attempt: ProblemAttempt) => {
    setProblemAttempts((prev) => {
      const updated = [...prev, attempt]
      return updated.slice(-MAX_ATTEMPT_LOGS)
    })
  }, [])

  const handleAnswerChange = (id: number, value: string) => {
    if (value === "" || /^\d+$/.test(value)) {
      setProblems((prev) =>
        prev.map((problem) => (problem.id === id ? { ...problem, userAnswer: value, showFeedback: false } : problem)),
      )
      setProblemTimers((prev) => {
        if (prev[id]) return prev
        return { ...prev, [id]: Date.now() }
      })
    }
  }

  const handleInputFocus = (id: number) => {
    setProblemTimers((prev) => ({ ...prev, [id]: Date.now() }))
  }

  const checkAnswer = (id: number) => {
    const currentProblem = problems.find((problem) => problem.id === id)
    if (!currentProblem || !currentProblem.userAnswer) return

    const submittedAnswer = Number.parseInt(currentProblem.userAnswer, 10)
    if (Number.isNaN(submittedAnswer)) return

    const isCorrect = submittedAnswer === currentProblem.answer

    if (isCorrect && currentProblem.isCorrect === null) {
      setScore((s) => s + 1)
      setCompletedCount((c) => c + 1)
    } else if (!isCorrect && currentProblem.isCorrect === true) {
      setScore((s) => Math.max(0, s - 1))
    }

    if (!isCorrect && currentProblem.isCorrect === null) {
      setCompletedCount((c) => c + 1)
    }

    setProblems((prev) =>
      prev.map((problem) => (problem.id === id ? { ...problem, isCorrect, showFeedback: true, attempts: problem.attempts + 1 } : problem)),
    )

    const startTime = problemTimers[id]
    setProblemTimers((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })

    logAttempt({
      problemId: String(currentProblem.id),
      difficulty: currentProblem.difficulty,
      skillTags: currentProblem.skillTags,
      isCorrect,
      durationMs: typeof startTime === "number" ? Math.max(0, Date.now() - startTime) : currentProblem.targetTimeMs ?? 0,
      attempts: currentProblem.attempts + 1,
      timestamp: Date.now(),
      targetTimeMs: currentProblem.targetTimeMs,
    })
  }

  const requestAdaptiveProblems = useCallback(async () => {
    setIsGenerating(true)
    setGenerationMessage("Generating personalized problems...")
    const recentAttempts = problemAttempts.slice(-MAX_ATTEMPT_LOGS)

    try {
      const response = await fetch("/api/problem-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          problemCount,
          numberRange,
          attempts: recentAttempts,
        }),
      })

      if (!response.ok) {
        throw new Error(`problem-generator: ${response.status}`)
      }

      const data = (await response.json()) as ProblemGeneratorResponse
      const remoteProblems = formatServerProblems(data?.problems ?? [], recommendedLevel)

      if (remoteProblems.length === 0) {
        throw new Error("problem-generator returned empty list")
      }

      applyProblemSet(remoteProblems)
      const source = data?.meta?.source
      const fallback = data?.meta?.fallback
      let statusMessage = "New adaptive problems are ready!"
      if (fallback) {
        statusMessage = "AI 服务暂不可用，已生成规则题目。"
      } else if (source === "ai") {
        statusMessage = "AI 已根据你的表现生成全新题目！"
      } else if (source === "rule-based") {
        statusMessage = "已生成自适应题目。"
      }
      setGenerationMessage(statusMessage)
    } catch (error) {
      console.error("[AdditionPracticePage] adaptive problem generation failed", error)
      const fallback = fallbackProblems()
      applyProblemSet(fallback)
      setGenerationMessage("Adaptive service unavailable, generated random practice instead.")
    } finally {
      setIsGenerating(false)
    }
  }, [applyProblemSet, fallbackProblems, problemAttempts, problemCount, numberRange, recommendedLevel])

  const resetGame = () => {
    void requestAdaptiveProblems()
  }

  const generateNewProblems = () => {
    void requestAdaptiveProblems()
  }

  useEffect(() => {
    const passingScore = Math.ceil(problemCount * 0.7)
    if (completedCount === problemCount && score >= passingScore) {
      setShowCelebration(true)
      const timeout = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [completedCount, score, problemCount])

  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": ["WebSite", "WebApplication"],
    name: metadata.title,
    description: metadata.description,
    inLanguage: "en",
    applicationCategory: "EducationalApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      ageRange: "5-12",
    },
    teaches: ["Number Sense", "Addition", "Subtraction", "Multiplication", "Division"],
    publisher: {
      "@type": "Organization",
      name: "EasyMath",
    },
  }

  const finalSchema = { ...defaultSchema, ...metadata.schemaData }

  const accuracyPercent = Math.round(performanceSummary.accuracy * 100)
  const avgSeconds =
    typeof performanceSummary.avgDurationMs === "number" ? (performanceSummary.avgDurationMs / 1000).toFixed(1) : "--"

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(finalSchema),
        }}
      />
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-9QQG8FQB50" strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9QQG8FQB50');
        `}
      </Script>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4 font-serif">
              Addition Practice - Kids Math Game
            </h2>
            <p className="text-muted-foreground text-sm">Adaptive problem sets grow with every answer you submit.</p>
          </div>

          <Card className="p-6 mb-6 bg-card border border-border shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-secondary mb-1">Adaptive Practice</h3>
                <p className="text-sm text-muted-foreground">
                  系统会根据最近的作答表现自动生成题目。当前推荐等级：
                  <span className="font-semibold text-primary ml-1">{levelLabel}</span>
                </p>
              </div>
            </div>
            <div className="text-center mt-6 space-y-2">
              <Button
                onClick={generateNewProblems}
                disabled={isGenerating}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Adaptive problems incoming..." : "Generate Adaptive Problems"}
              </Button>
              {generationMessage && <p className="text-sm text-muted-foreground">{generationMessage}</p>}
            </div>
          </Card>

          <Card className="p-4 bg-card border border-border shadow-md">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between text-center">
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
                  disabled={isGenerating}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? "..." : "Adaptive Restart"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-6">
              <div>
                <div className="text-lg font-semibold text-primary">{accuracyPercent}%</div>
                <div className="text-sm text-muted-foreground">Recent Accuracy</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-secondary">{avgSeconds}s</div>
                <div className="text-sm text-muted-foreground">Avg Time</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary">{levelLabel}</div>
                <div className="text-sm text-muted-foreground">Recommended Level</div>
              </div>
            </div>
          </Card>
        </div>

        {showCelebration && (
          <div className="fixed inset-0 bg-primary/20 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-card p-8 rounded-3xl shadow-2xl text-center celebrate border-4 border-primary">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-primary mb-2">Awesome!</h2>
              <p className="text-xl text-muted-foreground">You got {score} problems correct!</p>
            </div>
          </div>
        )}

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
                    <div className="text-2xl font-bold text-secondary mb-2 font-mono">
                      {problem.num1} + {problem.num2} =
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Target time: {problem.targetTimeMs ? Math.round(problem.targetTimeMs / 1000) : 7}s · Level {problem.difficulty}
                    </p>

                    <div className="flex items-center justify-center gap-3 mt-3">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={problem.userAnswer}
                        onChange={(e) => handleAnswerChange(problem.id, e.target.value)}
                        onFocus={(e) => {
                          e.target.placeholder = ""
                          handleInputFocus(problem.id)
                        }}
                        onBlur={(e) => (e.target.placeholder = "?")}
                        className="w-32 h-12 text-2xl text-center font-bold border-2 border-primary/30 focus:border-primary rounded-lg"
                        placeholder="?"
                        maxLength={3}
                      />
                      <Button
                        onClick={() => checkAnswer(problem.id)}
                        disabled={!problem.userAnswer}
                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground w-12 h-12 p-0 text-xl font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✔
                      </Button>
                    </div>

                    {problem.showFeedback && (
                      <div
                        className={`mt-4 p-3 rounded-lg bounce-in ${
                          problem.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {problem.isCorrect ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg">🌟</span>
                            <span className="font-semibold">Correct!</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg">💡</span>
                            <span className="font-semibold">The correct answer is {problem.answer}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {problem.showFeedback && (
                    <div className="text-center">
                      <span className={`text-3xl ${problem.isCorrect ? "celebrate" : "wiggle"}`}>
                        {problem.isCorrect ? "🎯" : "🔁"}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8">
          <Card className="p-6 mb-6 bg-card border border-border shadow-md">
            <h3 className="text-xl font-bold text-secondary mb-4">Learning Addition</h3>
            <p className="text-gray-700 mb-4">
              Addition is one of the fundamental operations in mathematics. It involves combining two or more numbers to find their total. Practicing
              addition helps children develop number sense and builds a foundation for more advanced math concepts. Mastering addition skills early on
              is crucial for mathematical success throughout a child&apos;s academic journey.
            </p>
            <h4 className="text-lg font-semibold text-secondary mb-2">Addition Tips:</h4>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Start with smaller numbers and gradually work your way up to larger ones</li>
              <li>Use visual aids like fingers or objects to help understand the concept</li>
              <li>Practice regularly to build fluency and speed</li>
              <li>Look for patterns, like adding zero (any number plus zero equals itself)</li>
              <li>Remember that addition is commutative (2+3 equals 3+2)</li>
              <li>Use strategies like counting on from the larger number</li>
              <li>Break down larger problems into smaller, manageable parts</li>
            </ul>
            <p className="text-gray-700">
              Our addition practice game generates random problems to help reinforce these concepts. You can adjust the difficulty by changing the
              number range and the number of problems. The more you practice, the better you&apos;ll become at addition! These free addition games
              online provide unlimited practice opportunities to build confidence and fluency in basic math operations.
            </p>
          </Card>

          <Card className="p-6 bg-card border border-border shadow-md">
            <h3 className="text-xl font-bold text-secondary mb-4">Why Practice Addition?</h3>
            <p className="text-gray-700 mb-4">
              Addition is a fundamental math skill that children use throughout their lives. Whether they&apos;re counting money, measuring ingredients
              for a recipe, or calculating scores in games, addition is an essential skill that builds confidence in mathematical thinking. Strong
              addition skills form the foundation for more complex mathematical operations including subtraction, multiplication, and division.
            </p>
            <p className="text-gray-700 mb-4">Regular practice with addition helps children:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Develop mental math skills for quick calculations in daily life</li>
              <li>Build a strong foundation for more complex math operations</li>
              <li>Improve problem-solving abilities through numerical reasoning</li>
              <li>Gain confidence in their mathematical abilities and academic performance</li>
              <li>Prepare for standardized tests and classroom assessments</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Our interactive addition game makes learning fun and engaging. With customizable difficulty levels, it&apos;s perfect for children at
              different stages of learning addition. These cool math games for kids transform traditional math practice into an enjoyable experience
              that encourages regular practice. Keep practicing, and you&apos;ll see improvement in your math skills!
            </p>
            <h4 className="text-lg font-semibold text-secondary mb-2">Benefits of Online Addition Practice:</h4>
            <p className="text-gray-700">
              Online math games for kids offer several advantages over traditional worksheets. They provide immediate feedback, adapt to individual
              learning paces, and make practice sessions more engaging. Our educational games for children help develop both computational fluency and
              conceptual understanding, creating well-rounded mathematical thinkers who are prepared for future academic challenges.
            </p>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-8 text-center">
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-border">
            <p className="text-base text-muted-foreground">Keep going, little mathematician!</p>
          </Card>
        </div>
      </div>
    </>
  )
}

export default AdditionPracticePage
