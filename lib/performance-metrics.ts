export type SkillLevel = "L0" | "L1" | "L2" | "L3"

export const SKILL_LEVELS: SkillLevel[] = ["L0", "L1", "L2", "L3"]

export const DEFAULT_LEVEL: SkillLevel = "L0"

type LevelConfig = {
  label: string
  maxNumber: number
  targetTimeMs: number
}

export const LEVEL_CONFIG: Record<SkillLevel, LevelConfig> = {
  L0: { label: "1-10 基础", maxNumber: 9, targetTimeMs: 9000 },
  L1: { label: "1-20 进阶", maxNumber: 19, targetTimeMs: 8000 },
  L2: { label: "1-50 强化", maxNumber: 49, targetTimeMs: 7000 },
  L3: { label: "1-100 挑战", maxNumber: 99, targetTimeMs: 6500 },
}

export type ProblemAttempt = {
  problemId: string
  difficulty: SkillLevel
  skillTags: string[]
  isCorrect: boolean
  durationMs: number
  attempts: number
  timestamp: number
  targetTimeMs?: number
}

export type PerformanceSummary = {
  windowSize: number
  sampleSize: number
  accuracy: number
  avgDurationMs: number | null
  slowRate: number
  streak: {
    correct: number
    incorrect: number
  }
  currentLevel: SkillLevel
  recommendedLevel: SkillLevel
  levelConfidence: number
  promotionEligible: boolean
  demotionRisk: boolean
}

export const DEFAULT_PERFORMANCE_SUMMARY: PerformanceSummary = {
  windowSize: 10,
  sampleSize: 0,
  accuracy: 1,
  avgDurationMs: null,
  slowRate: 0,
  streak: { correct: 0, incorrect: 0 },
  currentLevel: DEFAULT_LEVEL,
  recommendedLevel: DEFAULT_LEVEL,
  levelConfidence: 0,
  promotionEligible: false,
  demotionRisk: false,
}

const PROMOTION_ACCURACY = 0.85
const PROMOTION_SLOW_RATE = 0.2
const DEMOTION_ACCURACY = 0.5
const DEMOTION_STREAK = 3

export function getLevelConfig(level: SkillLevel): LevelConfig {
  return LEVEL_CONFIG[level] ?? LEVEL_CONFIG[DEFAULT_LEVEL]
}

export function getNextLevel(level: SkillLevel): SkillLevel {
  const idx = SKILL_LEVELS.indexOf(level)
  if (idx === -1 || idx === SKILL_LEVELS.length - 1) return level
  return SKILL_LEVELS[idx + 1]
}

export function getPreviousLevel(level: SkillLevel): SkillLevel {
  const idx = SKILL_LEVELS.indexOf(level)
  if (idx <= 0) return SKILL_LEVELS[0]
  return SKILL_LEVELS[idx - 1]
}

export function summarizePerformance(attempts: ProblemAttempt[], windowSize = 10): PerformanceSummary {
  if (!attempts.length) {
    return { ...DEFAULT_PERFORMANCE_SUMMARY, windowSize }
  }

  const recent = attempts.slice(-windowSize)
  const sampleSize = recent.length
  const correctCount = recent.filter((attempt) => attempt.isCorrect).length
  const accuracy = sampleSize ? correctCount / sampleSize : 1

  const avgDurationMs = sampleSize
    ? Math.round(recent.reduce((total, attempt) => total + attempt.durationMs, 0) / sampleSize)
    : null

  const slowCount = recent.filter(
    (attempt) => typeof attempt.targetTimeMs === "number" && attempt.durationMs > (attempt.targetTimeMs ?? Infinity),
  ).length
  const slowRate = sampleSize ? slowCount / sampleSize : 0

  const streak = calculateStreak(recent)

  const lastLevel =
    recent.at(-1)?.difficulty ?? attempts.at(-1)?.difficulty ?? DEFAULT_PERFORMANCE_SUMMARY.currentLevel ?? DEFAULT_LEVEL
  const currentLevel = lastLevel ?? DEFAULT_LEVEL

  const hasEnoughSamples = sampleSize >= Math.min(windowSize, 5)
  const currentLevelConfig = getLevelConfig(currentLevel)
  const meetsSpeed =
    typeof avgDurationMs === "number" ? avgDurationMs <= currentLevelConfig.targetTimeMs : hasEnoughSamples === false

  const promotionEligible = hasEnoughSamples && accuracy >= PROMOTION_ACCURACY && meetsSpeed && slowRate <= PROMOTION_SLOW_RATE
  const demotionRisk = hasEnoughSamples && (accuracy <= DEMOTION_ACCURACY || streak.incorrect >= DEMOTION_STREAK)

  let recommendedLevel = currentLevel
  if (promotionEligible) {
    recommendedLevel = getNextLevel(currentLevel)
  } else if (demotionRisk) {
    recommendedLevel = getPreviousLevel(currentLevel)
  }

  const confidenceBase = sampleSize ? Math.min(1, sampleSize / windowSize) : 0
  const levelConfidence = parseFloat((accuracy * confidenceBase).toFixed(2))

  return {
    windowSize,
    sampleSize,
    accuracy,
    avgDurationMs,
    slowRate,
    streak,
    currentLevel,
    recommendedLevel,
    levelConfidence,
    promotionEligible,
    demotionRisk,
  }
}

function calculateStreak(attempts: ProblemAttempt[]) {
  let correct = 0
  let incorrect = 0
  for (let i = attempts.length - 1; i >= 0; i -= 1) {
    const attempt = attempts[i]
    if (attempt.isCorrect) {
      if (incorrect > 0) break
      correct += 1
    } else {
      if (correct > 0) break
      incorrect += 1
    }
  }
  return { correct, incorrect }
}
