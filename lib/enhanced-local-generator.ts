import {
  SkillLevel,
  PerformanceSummary,
  ProblemAttempt,
  DEFAULT_LEVEL,
  getLevelConfig
} from "./performance-metrics"

export type GeneratedProblem = {
  id: string
  num1: number
  num2: number
  answer: number
  difficulty: SkillLevel
  targetTimeMs: number
  skillTags: string[]
}

type GenerateLocalProblemSetOptions = {
  summary: PerformanceSummary
  problemCount: number
  numberRange?: number
  attempts?: ProblemAttempt[]
}

// 技能标签映射
const SKILL_TAGS_BY_LEVEL: Record<SkillLevel, string[]> = {
  L0: ["single-digit", "counting", "basic-addition"],
  L1: ["two-digit", "bridge-ten", "basic-addition"],
  L2: ["multi-digit", "carrying", "basic-addition"],
  L3: ["multi-digit", "speed-challenge", "basic-addition"],
}

// 根据学生表现智能生成题目
export function generateSmartProblemSet({
  summary,
  problemCount,
  numberRange,
  attempts = [],
}: GenerateLocalProblemSetOptions): GeneratedProblem[] {
  const baseLevel = summary?.recommendedLevel ?? summary?.currentLevel ?? DEFAULT_LEVEL
  const effectiveLevel = clampLevel(baseLevel)
  const config = getLevelConfig(effectiveLevel)
  const maxNumber = Math.max(5, Math.min(config.maxNumber, Number(numberRange) || config.maxNumber))
  const targetTimeMs = config.targetTimeMs

  // 分析学生表现
  const performance = analyzePerformance(summary, attempts)

  const problems: GeneratedProblem[] = []
  const seenPairs = new Set<string>()

  let attemptsCount = 0
  const maxAttempts = problemCount * 3 // 防止无限循环

  while (problems.length < problemCount && attemptsCount < maxAttempts) {
    attemptsCount++

    const operands = generateSmartOperands(effectiveLevel, maxNumber, performance, attempts)
    const pairKey = createPairKey(operands[0], operands[1])

    // 避免重复题目
    if (seenPairs.has(pairKey)) continue
    seenPairs.add(pairKey)

    // 根据表现微调目标时间
    const adjustedTargetTime = adjustTargetTime(targetTimeMs, performance, operands)

    problems.push({
      id: `smart-${Date.now()}-${problems.length}`,
      num1: operands[0],
      num2: operands[1],
      answer: operands[0] + operands[1],
      difficulty: effectiveLevel,
      targetTimeMs: adjustedTargetTime,
      skillTags: [...SKILL_TAGS_BY_LEVEL[effectiveLevel]],
    })
  }

  // 随机打乱题目顺序，避免模式化
  return shuffleArray(problems)
}

// 分析学生表现
function analyzePerformance(summary: PerformanceSummary, attempts: ProblemAttempt[]) {
  const recentAttempts = attempts.slice(-10) // 最近10题

  return {
    accuracy: summary.accuracy,
    avgSpeed: summary.avgDurationMs,
    slowRate: summary.slowRate,
    recentAccuracy: recentAttempts.length > 0
      ? recentAttempts.filter(a => a.isCorrect).length / recentAttempts.length
      : summary.accuracy,
    hasRecentMistakes: recentAttempts.some(a => !a.isCorrect),
    isSlow: summary.avgDurationMs && summary.avgDurationMs > summary.targetTimeMs * 1.2,
    level: summary.currentLevel,
  }
}

// 智能生成操作数
function generateSmartOperands(
  level: SkillLevel,
  maxNumber: number,
  performance: ReturnType<typeof analyzePerformance>,
  attempts: ProblemAttempt[]
): [number, number] {
  switch (level) {
    case "L0":
      return generateL0Operands(maxNumber, performance)
    case "L1":
      return generateL1Operands(maxNumber, performance)
    case "L2":
      return generateL2Operands(maxNumber, performance, attempts)
    case "L3":
      return generateL3Operands(maxNumber, performance, attempts)
    default:
      return generateL0Operands(maxNumber, performance)
  }
}

// L0: 1-9 基础加法，关注数感培养
function generateL0Operands(maxNumber: number, performance: ReturnType<typeof analyzePerformance>): [number, number] {
  const strategies = [
    // 基础组合 (30%)
    () => [randomInt(1, 5), randomInt(1, 5)],
    // 和为10的练习 (25%)
    () => [randomInt(1, 9), 10 - randomInt(1, 9)],
    // 重复数字 (20%)
    () => [randomInt(1, 4), randomInt(1, 4)],
    // 小+大 (15%)
    () => [randomInt(1, 3), randomInt(4, 9)],
    // 渐进增加 (10%)
    () => performance.accuracy > 0.8 ? [randomInt(4, 9), randomInt(1, 5)] : [randomInt(1, 4), randomInt(1, 4)]
  ]

  const strategy = strategies[Math.floor(Math.random() * strategies.length)]
  return strategy()
}

// L1: 1-20 进阶，重点训练进位概念
function generateL1Operands(maxNumber: number, performance: ReturnType<typeof analyzePerformance>): [number, number] {
  const strategies = [
    // 进位练习 (40%): 如 8+7, 9+6 等
    () => {
      const a = randomInt(5, 9)
      const b = randomInt(10 - a + 1, Math.min(9, maxNumber - a))
      return [a, b]
    },
    // 不进位练习 (30%): 如 12+5, 14+3 等
    () => {
      const a = randomInt(10, Math.min(19, maxNumber - 1))
      const b = randomInt(1, Math.min(9, maxNumber - a))
      return [a, b]
    },
    // 双位数加法 (20%): 如 11+8, 15+4 等
    () => {
      const a = randomInt(10, Math.min(19, maxNumber - 1))
      const b = randomInt(1, Math.min(9, maxNumber - a))
      return [a, b]
    },
    // 根据表现调整 (10%)
    () => performance.accuracy < 0.7
      ? [randomInt(1, 10), randomInt(1, 9)] // 简单些
      : [randomInt(5, 15), randomInt(5, Math.min(15, maxNumber - 5))] // 难些
  ]

  const strategy = strategies[Math.floor(Math.random() * strategies.length)]
  return strategy()
}

// L2: 1-50 强化，重点训练复杂进位和多位数
function generateL2Operands(maxNumber: number, performance: ReturnType<typeof analyzePerformance>, attempts: ProblemAttempt[]): [number, number] {
  const recentCarryingMistakes = analyzeCarryingMistakes(attempts)

  const strategies = [
    // 复杂进位 (35%): 如 28+17, 39+16 等
    () => {
      const a = randomInt(15, 35)
      const b = randomInt(15, Math.min(35, maxNumber - a))
      // 确保会产生进位
      if ((a % 10) + (b % 10) < 10) {
        return [a, b + (10 - (a % 10) - (b % 10))]
      }
      return [a, b]
    },
    // 整十数加法 (25%): 如 30+25, 40+18 等
    () => {
      const tens = randomInt(2, 4) * 10
      const ones = randomInt(5, Math.min(25, maxNumber - tens))
      return [tens, ones]
    },
    // 针对学生弱项 (20%)
    () => recentCarryingMistakes > 2
      ? generateCarryingFocus(maxNumber)
      : generateMixedDifficulty(maxNumber),
    // 混合难度 (20%)
    () => performance.slowRate > 0.3
      ? [randomInt(10, 30), randomInt(5, 25)] // 简单些，提升速度
      : [randomInt(20, 45), randomInt(10, Math.min(30, maxNumber - 20))] // 保持难度
  ]

  const strategy = strategies[Math.floor(Math.random() * strategies.length)]
  return strategy()
}

// L3: 1-100 挑战，复杂多位数加法
function generateL3Operands(maxNumber: number, performance: ReturnType<typeof analyzePerformance>, attempts: ProblemAttempt[]): [number, number] {
  const strategies = [
    // 大数加法 (30%): 如 67+45, 89+23 等
    () => {
      const a = randomInt(40, 80)
      const b = randomInt(20, Math.min(60, maxNumber - a))
      return [a, b]
    },
    // 连续进位 (25%): 如 99+1, 98+5 等
    () => {
      const a = randomInt(85, 99)
      const b = randomInt(2, Math.min(15, maxNumber - a))
      return [a, b]
    },
    // 速度挑战 (25%): 两位数快速加法
    () => {
      const a = randomInt(30, 70)
      const b = randomInt(20, Math.min(50, maxNumber - a))
      return performance.slowRate > 0.4
        ? [Math.floor(a * 0.7), Math.floor(b * 0.7)] // 降低难度提升速度
        : [a, b]
    },
    // 综合挑战 (20%): 混合各种难度
    () => {
      const types = [
        () => [randomInt(50, 90), randomInt(10, Math.min(40, maxNumber - 50))],
        () => [randomInt(20, 60), randomInt(40, Math.min(80, maxNumber - 20))],
        () => [randomInt(75, 99), randomInt(5, Math.min(25, maxNumber - 75))]
      ]
      return types[Math.floor(Math.random() * types.length)]()
    }
  ]

  const strategy = strategies[Math.floor(Math.random() * strategies.length)]
  return strategy()
}

// 辅助生成函数
function generateCarryingFocus(maxNumber: number): [number, number] {
  const a = randomInt(18, 39)
  const b = randomInt(12, Math.min(38, maxNumber - a))
  // 强制产生进位
  const aOnes = a % 10
  const bOnes = b % 10
  if (aOnes + bOnes < 10) {
    return [a, b + (10 - aOnes)]
  }
  return [a, b]
}

function generateMixedDifficulty(maxNumber: number): [number, number] {
  const a = randomInt(15, 45)
  const b = randomInt(8, Math.min(35, maxNumber - a))
  return [a, b]
}

function analyzeCarryingMistakes(attempts: ProblemAttempt[]): number {
  let carryingMistakes = 0
  const recent = attempts.slice(-15)

  for (const attempt of recent) {
    if (!attempt.isCorrect) {
      // 简单判断是否为进位错误（个位相加>=10的题目答错）
      const [num1, num2] = extractNumbersFromAttempt(attempt)
      if (num1 && num2 && ((num1 % 10) + (num2 % 10)) >= 10) {
        carryingMistakes++
      }
    }
  }

  return carryingMistakes
}

function extractNumbersFromAttempt(attempt: ProblemAttempt): [number | null, number | null] {
  // 从题目ID或相关数据中提取数字（这里简化处理）
  // 实际项目中可能需要更复杂的解析
  return [null, null]
}

function adjustTargetTime(baseTime: number, performance: ReturnType<typeof analyzePerformance>, operands: [number, number]): number {
  let adjusted = baseTime

  // 根据学生表现调整
  if (performance.slowRate > 0.3) {
    adjusted = Math.floor(adjusted * 1.2) // 给学生更多时间
  } else if (performance.accuracy > 0.9 && performance.avgSpeed && performance.avgSpeed < baseTime * 0.8) {
    adjusted = Math.floor(adjusted * 0.9) // 表现好，稍微减少时间
  }

  // 根据题目难度微调
  const sum = operands[0] + operands[1]
  if (sum > 150) adjusted = Math.floor(adjusted * 1.1)
  if (sum < 10) adjusted = Math.floor(adjusted * 0.9)

  return Math.max(3000, Math.min(15000, adjusted)) // 限制在 3-15 秒
}

// 工具函数
function createPairKey(a: number, b: number): string {
  const [x, y] = [Math.min(a, b), Math.max(a, b)]
  return `${x}-${y}`
}

function randomInt(min: number, max: number): number {
  const minClamped = Math.ceil(min)
  const maxClamped = Math.floor(max)
  return Math.max(minClamped, Math.floor(Math.random() * (maxClamped - minClamped + 1)) + minClamped)
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function clampLevel(level: SkillLevel): SkillLevel {
  const validLevels: SkillLevel[] = ["L0", "L1", "L2", "L3"]
  return validLevels.includes(level) ? level : DEFAULT_LEVEL
}