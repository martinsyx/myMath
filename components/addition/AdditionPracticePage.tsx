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
  SKILL_LEVELS,
} from "@/lib/performance-metrics"
import { LearningReport } from "@/components/LearningReport"
import { logResponseAndUpdateAbility } from "@/lib/irt/assessment-service"

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
  title: "加法练习 - 儿童学习加法的趣味数学游戏",
  description:
    "通过我们有趣且互动的数学游戏让孩子们练习加法。免费的在线加法游戏，帮助儿童学习和掌握100以内的基础加法技能。",
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
      "targetName": "加法技能",
    },
  },
}

type AdditionPracticePageProps = {
  metadataOverrides?: Partial<AdditionPageMetadata>
}

const ATTEMPT_STORAGE_KEY = "additionPracticeAttempts"
const MAX_ATTEMPT_LOGS = 50
const BATCH_SIZE = 5
const BASE_SKILL_TAGS = ["basic-addition"]

const randomInt = (min: number, max: number, rng: () => number = Math.random) => {
  const minClamped = Math.ceil(min)
  const maxClamped = Math.floor(max)
  if (maxClamped < minClamped) return minClamped
  return Math.floor(rng() * (maxClamped - minClamped + 1)) + minClamped
}

const createSeededRng = (seed = 42) => {
  let s = seed || 1
  return () => {
    // xorshift32
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 0x100000000
  }
}

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

const generateDiverseProblems = (
  count = 10,
  maxNumber = 9,
  difficulty: SkillLevel = DEFAULT_LEVEL,
  rng: () => number = Math.random,
): Problem[] => {
  const problems: Problem[] = []
  for (let i = 0; i < count; i++) {
    const pattern = pickPattern(difficulty, maxNumber, rng)
    const { num1, num2, skillTags } = buildPatternedOperands(pattern, maxNumber, rng)
    problems.push(createProblem(i + 1, num1, num2, { difficulty, skillTags }))
  }
  return problems
}

const pickPattern = (level: SkillLevel, maxNumber: number, rng: () => number = Math.random) => {
  const patterns: Array<"single" | "bridgeTen" | "twoDigit" | "carrying" | "high"> = ["single"]
  if (maxNumber >= 10) patterns.push("bridgeTen")
  if (maxNumber >= 15) patterns.push("twoDigit")
  if (maxNumber >= 15 && (level === "L2" || level === "L3")) patterns.push("carrying")
  if (maxNumber >= 30 && level === "L3") patterns.push("high")
  return patterns[randomInt(0, patterns.length - 1, rng)]
}

const buildPatternedOperands = (
  pattern: "single" | "bridgeTen" | "twoDigit" | "carrying" | "high",
  maxNumber: number,
  rng: () => number = Math.random,
) => {
  const maxSafe = Math.max(5, Math.min(maxNumber, 99))

  if (pattern === "bridgeTen" && maxSafe >= 10) {
    const num1 = randomInt(1, Math.min(9, maxSafe - 1), rng)
    const num2 = Math.min(10 - num1, maxSafe)
    return { num1, num2, skillTags: [...BASE_SKILL_TAGS, "bridge-ten"] }
  }

  if (pattern === "twoDigit" && maxSafe >= 15) {
    const tries = 10
    for (let i = 0; i < tries; i++) {
      const num1 = randomInt(10, maxSafe, rng)
      const num2 = randomInt(5, Math.min(maxSafe, num1), rng)
      const onesSum = (num1 % 10) + (num2 % 10)
      if (onesSum < 10 && num1 + num2 <= maxSafe) {
        return { num1, num2, skillTags: [...BASE_SKILL_TAGS, "two-digit"] }
      }
    }
  }

  if (pattern === "carrying" && maxSafe >= 15) {
    const tries = 10
    for (let i = 0; i < tries; i++) {
      const num1 = randomInt(10, maxSafe, rng)
      const num2 = randomInt(10, maxSafe, rng)
      const onesSum = (num1 % 10) + (num2 % 10)
      if (onesSum >= 10 && num1 + num2 <= maxSafe) {
        return { num1, num2, skillTags: [...BASE_SKILL_TAGS, "carrying"] }
      }
    }
  }

  if (pattern === "high" && maxSafe >= 30) {
    const lower = Math.max(20, maxSafe - 20)
    const num1 = randomInt(lower, maxSafe, rng)
    const num2 = randomInt(lower, maxSafe, rng)
    return { num1, num2, skillTags: [...BASE_SKILL_TAGS, "speed-challenge"] }
  }

  const num1 = randomInt(1, Math.min(12, maxSafe), rng)
  const num2 = randomInt(1, Math.min(12, maxSafe), rng)
  return { num1, num2, skillTags: [...BASE_SKILL_TAGS] }
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
  const [numberRange] = useState(20)
  const [problems, setProblems] = useState<Problem[]>(() => {
    const seededRng = createSeededRng(20250101)
    return generateDiverseProblems(problemCount, numberRange, DEFAULT_LEVEL, seededRng)
  })
  const [score, setScore] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [problemAttempts, setProblemAttempts] = useState<ProblemAttempt[]>([])
  const [problemTimers, setProblemTimers] = useState<Record<number, number>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMessage, setGenerationMessage] = useState<string | null>(null)
  const [visibleBatch, setVisibleBatch] = useState(1)
  const [activeLevel, setActiveLevel] = useState<SkillLevel>(DEFAULT_LEVEL)
  const [showReport, setShowReport] = useState(false)

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
  const totalProblems = problems.length || problemCount
  const levelLabel = LEVEL_CONFIG[recommendedLevel]?.label ?? LEVEL_CONFIG[DEFAULT_LEVEL].label

  // 计算当前批次的题目（只显示当前批次，隐藏已完成批次）
  const currentBatchStart = (visibleBatch - 1) * BATCH_SIZE
  const currentBatchEnd = Math.min(visibleBatch * BATCH_SIZE, problems.length)
  const currentBatchProblems = useMemo(
    () => problems.slice(currentBatchStart, currentBatchEnd),
    [problems, currentBatchStart, currentBatchEnd],
  )

  // 当前批次完成数
  const currentBatchCompleted = useMemo(
    () => currentBatchProblems.filter((p) => p.isCorrect !== null).length,
    [currentBatchProblems],
  )

  // 当前批次正确数
  const currentBatchCorrect = useMemo(
    () => currentBatchProblems.filter((p) => p.isCorrect === true).length,
    [currentBatchProblems],
  )

  const applyProblemSet = useCallback((nextProblems: Problem[], nextLevel?: SkillLevel) => {
    setProblems(nextProblems)
    setScore(0)
    setCompletedCount(0)
    setShowCelebration(false)
    setProblemTimers({})
    setVisibleBatch(1)
    if (nextLevel) {
      setActiveLevel(nextLevel)
    } else if (nextProblems.length) {
      setActiveLevel(nextProblems[0].difficulty)
    }
  }, [])

  const fallbackProblems = useCallback(() => {
    const levelConfig = getLevelConfig(recommendedLevel)
    const maxNumber = Math.max(numberRange, levelConfig.maxNumber)
    return generateDiverseProblems(problemCount, maxNumber, recommendedLevel)
  }, [problemCount, numberRange, recommendedLevel])

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

    // 记录到 IRT 系统进行精确能力评估
    logResponseAndUpdateAbility(
      {
        problemId: String(currentProblem.id),
        difficulty: currentProblem.difficulty,
        skillTags: currentProblem.skillTags,
        isCorrect,
        durationMs: typeof startTime === "number" ? Math.max(0, Date.now() - startTime) : currentProblem.targetTimeMs ?? 0,
        attempts: currentProblem.attempts + 1,
        timestamp: Date.now(),
        targetTimeMs: currentProblem.targetTimeMs,
      },
      currentProblem.num1,
      currentProblem.num2,
      submittedAnswer
    )
  }

  const requestAdaptiveProblems = useCallback(async () => {
    setIsGenerating(true)
    setGenerationMessage("正在生成个性化题目...")
    const recentAttempts = problemAttempts.slice(-MAX_ATTEMPT_LOGS)
    const levelConfig = getLevelConfig(recommendedLevel)
    const effectiveRange = Math.max(numberRange, levelConfig.maxNumber)

    try {
      const response = await fetch("/api/problem-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          problemCount,
          numberRange: effectiveRange,
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

      applyProblemSet(remoteProblems, recommendedLevel)
      const source = data?.meta?.source
      const fallback = data?.meta?.fallback
      let statusMessage = "新的智能题目已准备就绪！"
      if (fallback) {
        statusMessage = "AI服务不可用，已生成基于规则的题目。"
      } else if (source === "ai") {
        statusMessage = "AI已根据您的表现生成新题目！"
      } else if (source === "rule-based") {
        statusMessage = "智能题目已生成。"
      }
      setGenerationMessage(statusMessage)
    } catch (error) {
      console.error("[AdditionPracticePage] adaptive problem generation failed", error)
      const fallback = fallbackProblems()
      applyProblemSet(fallback, recommendedLevel)
      setGenerationMessage("智能服务不可用，已生成随机练习题目。")
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
    const passingScore = Math.ceil(totalProblems * 0.7)
    if (completedCount === totalProblems && totalProblems > 0 && score >= passingScore) {
      setShowCelebration(true)
      const timeout = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [completedCount, score, totalProblems])

  useEffect(() => {
    setVisibleBatch((current) => {
      const totalBatches = Math.ceil((problems.length || problemCount) / BATCH_SIZE)
      if (completedCount >= current * BATCH_SIZE && current < totalBatches) {
        return current + 1
      }
      return current
    })
  }, [completedCount, problemCount, problems.length])

  useEffect(() => {
    const hasEnoughSamples = performanceSummary.sampleSize >= 5
    const finishedCurrentSet = completedCount >= totalProblems && totalProblems > 0
    const currentIndex = SKILL_LEVELS.indexOf(activeLevel)
    const recommendedIndex = SKILL_LEVELS.indexOf(performanceSummary.recommendedLevel)
    const levelUp = recommendedIndex > currentIndex

    if (!isGenerating && hasEnoughSamples && finishedCurrentSet && levelUp) {
      void requestAdaptiveProblems()
    }
  }, [
    activeLevel,
    completedCount,
    isGenerating,
    performanceSummary.recommendedLevel,
    performanceSummary.sampleSize,
    requestAdaptiveProblems,
    totalProblems,
  ])

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
              加法练习 - 儿童加法能力提升测试
            </h2>
            <p className="text-muted-foreground text-sm font-sans">智能题目集会根据您提交的每个答案不断增长。</p>
          </div>

          <Card className="p-6 mb-6 bg-card border border-border shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-secondary mb-1 font-serif">智能练习</h3>
                <p className="text-sm text-muted-foreground font-sans">
                  题目会根据您最近的表现自动生成。当前推荐级别：
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
                {isGenerating ? "智能题目正在生成中..." : "智能生成题目"}
              </Button>
              {generationMessage && <p className="text-sm text-muted-foreground font-sans">{generationMessage}</p>}
            </div>
          </Card>

          <Card className="p-4 bg-card border border-border shadow-md">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between text-center">
              <div className="flex-1">
                <div className="text-2xl font-bold text-primary">
                  {score}/{totalProblems}
                </div>
                <div className="text-sm text-muted-foreground font-sans">正确答案</div>
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-secondary">
                  {completedCount}/{totalProblems}
                </div>
                <div className="text-sm text-muted-foreground font-sans">已完成</div>
              </div>
              <div className="flex-1">
                <Button
                  onClick={resetGame}
                  disabled={isGenerating}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? "..." : "智能重启"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-6">
              <div>
                <div className="text-lg font-semibold text-primary">{accuracyPercent}%</div>
                <div className="text-sm text-muted-foreground font-sans">最近准确率</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-secondary">{avgSeconds}s</div>
                <div className="text-sm text-muted-foreground font-sans">平均时间</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary">{levelLabel}</div>
                <div className="text-sm text-muted-foreground font-sans">推荐级别</div>
              </div>
            </div>

            <div className="text-center mt-6">
              <Button
                onClick={() => setShowReport(true)}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                查看学习报告
              </Button>
            </div>
          </Card>
        </div>

        {showCelebration && (
          <div className="fixed inset-0 bg-primary/20 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-card p-8 rounded-3xl shadow-2xl text-center celebrate border-4 border-primary">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-primary mb-2">太棒了！</h2>
              <p className="text-xl text-muted-foreground font-sans">您答对了 {score} 道题！</p>
            </div>
          </div>
        )}

        {showReport && (
          <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
            <div className="max-w-4xl mx-auto my-8 p-4">
              <LearningReport onClose={() => setShowReport(false)} />
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* 批次进度指示器 */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="text-sm text-muted-foreground font-sans">
              第 {visibleBatch} 批 · {currentBatchCompleted}/{currentBatchProblems.length} 题已完成
            </div>
            <div className="flex gap-1">
              {Array.from({ length: Math.ceil(totalProblems / BATCH_SIZE) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i + 1 < visibleBatch
                      ? "bg-green-500"
                      : i + 1 === visibleBatch
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                  title={`第 ${i + 1} 批`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentBatchProblems.map((problem) => (
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
                    <p className="text-xs text-muted-foreground font-sans">
                      目标时间：{problem.targetTimeMs ? Math.round(problem.targetTimeMs / 1000) : 7}秒 · 级别 {problem.difficulty}
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
                            <span className="font-semibold">正确！</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg">💡</span>
                            <span className="font-semibold">正确答案是 {problem.answer}</span>
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
            <h3 className="text-xl font-bold text-secondary mb-4 font-serif">学习加法</h3>
            <p className="text-gray-700 mb-4">
              Addition is one of the fundamental operations in mathematics. It involves combining two or more numbers to find their total. Practicing
              addition helps children develop number sense and builds a foundation for more advanced math concepts. Mastering addition skills early on
              is crucial for mathematical success throughout a child&apos;s academic journey.
            </p>
            <h4 className="text-lg font-semibold text-secondary mb-2 font-serif">加法技巧：</h4>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4 font-sans">
              <li>从较小的数字开始，逐步过渡到较大的数字</li>
              <li>使用手指或物体等视觉辅助工具来帮助理解概念</li>
              <li>定期练习以建立流畅度和速度</li>
              <li>寻找规律，比如加零（任何数加零等于它本身）</li>
              <li>记住加法是可交换的（2+3等于3+2）</li>
              <li>使用从较大数字开始计数的策略</li>
              <li>将较大的问题分解成更小、可管理的部分</li>
            </ul>
            <p className="text-gray-700">
              Our addition practice game generates random problems to help reinforce these concepts. You can adjust the difficulty by changing the
              number range and the number of problems. The more you practice, the better you&apos;ll become at addition! These free addition games
              online provide unlimited practice opportunities to build confidence and fluency in basic math operations.
            </p>
          </Card>

          <Card className="p-6 bg-card border border-border shadow-md">
            <h3 className="text-xl font-bold text-secondary mb-4 font-serif">为什么要练习加法？</h3>
            <p className="text-gray-700 mb-4">
              Addition is a fundamental math skill that children use throughout their lives. Whether they&apos;re counting money, measuring ingredients
              for a recipe, or calculating scores in games, addition is an essential skill that builds confidence in mathematical thinking. Strong
              addition skills form the foundation for more complex mathematical operations including subtraction, multiplication, and division.
            </p>
            <p className="text-gray-700 mb-4 font-sans">定期练习加法有助于孩子们：</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4 font-sans">
              <li>培养心算技能，以便在日常生活中快速计算</li>
              <li>为更复杂的数学运算打下坚实基础</li>
              <li>通过数值推理提高解决问题的能力</li>
              <li>增强对数学能力和学业表现的信心</li>
              <li>为标准化测试和课堂评估做好准备</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Our interactive addition game makes learning fun and engaging. With customizable difficulty levels, it&apos;s perfect for children at
              different stages of learning addition. These cool math games for kids transform traditional math practice into an enjoyable experience
              that encourages regular practice. Keep practicing, and you&apos;ll see improvement in your math skills!
            </p>
            <h4 className="text-lg font-semibold text-secondary mb-2 font-serif">在线加法练习的好处：</h4>
            <p className="text-gray-700 font-sans">
              与传统练习册相比，儿童在线数学游戏有几个优势。它们提供即时反馈，适应个人学习节奏，并使练习过程更加引人入胜。我们的儿童教育游戏有助于培养计算流畅性和概念理解，创造全面发展的数学思考者，为未来的学术挑战做好准备。
            </p>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-8 text-center">
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-border">
            <p className="text-base text-muted-foreground font-sans">继续努力，小数学家！</p>
          </Card>
        </div>
      </div>
    </>
  )
}

export default AdditionPracticePage
