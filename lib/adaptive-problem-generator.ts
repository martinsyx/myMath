import { DEFAULT_VISION_MODEL, extractResponseText, requestCodexResponse } from "./openai-client"
import { DEFAULT_LEVEL, PerformanceSummary, ProblemAttempt, SkillLevel, getLevelConfig } from "./performance-metrics"

export type GeneratedProblem = {
  id: string
  num1: number
  num2: number
  answer: number
  difficulty: SkillLevel
  targetTimeMs: number
  skillTags: string[]
}

type GenerateRuleBasedProblemSetOptions = {
  summary: PerformanceSummary
  problemCount: number
  numberRange?: number
}

type GenerateAIProblemSetOptions = GenerateRuleBasedProblemSetOptions & {
  attempts: ProblemAttempt[]
}

const SKILL_TAGS_BY_LEVEL: Record<SkillLevel, string[]> = {
  L0: ["single-digit", "counting"],
  L1: ["two-digit", "bridge-ten"],
  L2: ["multi-digit", "carrying"],
  L3: ["multi-digit", "speed-challenge"],
}

export function generateRuleBasedProblemSet({
  summary,
  problemCount,
  numberRange,
}: GenerateRuleBasedProblemSetOptions): GeneratedProblem[] {
  const baseLevel = summary?.recommendedLevel ?? summary?.currentLevel ?? DEFAULT_LEVEL
  const effectiveLevel = clampLevel(baseLevel)
  const config = getLevelConfig(effectiveLevel)
  const maxNumber = Math.max(5, Math.min(config.maxNumber, Number(numberRange) || config.maxNumber))
  const targetTimeMs = config.targetTimeMs

  const problems: GeneratedProblem[] = []
  for (let i = 0; i < problemCount; i += 1) {
    const operands = pickOperands(effectiveLevel, maxNumber, summary)
    problems.push({
      id: `rule-${Date.now()}-${i}`,
      num1: operands[0],
      num2: operands[1],
      answer: operands[0] + operands[1],
      difficulty: effectiveLevel,
      targetTimeMs,
      skillTags: [...SKILL_TAGS_BY_LEVEL[effectiveLevel]],
    })
  }
  return problems
}

const AI_PROMPT_TEMPLATE = `
你是一个专注小学数学加法的自适应出题老师。你会根据学生的准确率、平均用时和最近题目表现，设计下一批题目。
- 仅返回 JSON，不能有额外解释。
- JSON 结构必须是：{"problems":[{ "id": "string", "num1": number, "num2": number, "difficulty": "L0|L1|L2|L3", "targetTimeMs": number, "skillTags": string[] }]}
- 题目使用正整数，且 1 <= num <= 给定的 maxNumber，且 num1+num2 不得重复或顺序互换重复（5+7 与 7+5 视为重复）。
- difficulty 只能是 L0-L3。
- targetTimeMs 依据题目难度给出，单位毫秒（4000-10000 之间）。
- skillTags 至少包含 ["basic-addition"]，可以叠加 ["bridge-ten","carrying","speed-challenge"] 等。
- 总题目数量必须和要求一致。
`

const MAX_AI_OUTPUT_TOKENS = 800

export async function generateAIProblemSet({
  summary,
  attempts,
  problemCount,
  numberRange,
}: GenerateAIProblemSetOptions): Promise<GeneratedProblem[]> {
  if (!problemCount) return []
  const resolvedLevel = clampLevel(summary?.recommendedLevel ?? summary?.currentLevel ?? DEFAULT_LEVEL)
  const levelConfig = getLevelConfig(resolvedLevel)
  const resolvedMaxNumber = Math.max(5, Math.min(99, Number(numberRange) || levelConfig.maxNumber))
  const attemptSamples = formatAttemptSamples(attempts)

  const userPrompt = [
    `学生最近 ${summary.sampleSize} 道题的准确率约为 ${(summary.accuracy * 100).toFixed(1)}%，平均用时 ${
      summary.avgDurationMs ? `${summary.avgDurationMs}ms` : "未知"
    }，慢速率 ${(summary.slowRate * 100).toFixed(1)}%。`,
    `推荐等级：${resolvedLevel}（${levelConfig.label}），需要生成 ${problemCount} 道题，并将数字控制在 1-${resolvedMaxNumber} 之间。`,
    attemptSamples ? `最近题目表现：\n${attemptSamples}` : "暂无题目表现详情。",
    "请综合考虑准确率与用时，生成下一批更科学的练习题。",
  ].join("\n")

  const response = await requestCodexResponse({
    model: DEFAULT_VISION_MODEL,
    reasoning: { effort: "medium", summary: "auto" },
    input: [
      {
        type: "message",
        role: "user",
        content: [
          { type: "input_text", text: AI_PROMPT_TEMPLATE },
          { type: "input_text", text: userPrompt },
        ],
      },
    ],
    max_output_tokens: MAX_AI_OUTPUT_TOKENS,
  })

  const text = extractResponseText(response)
  if (!text) return []
  const jsonPayload = extractJsonBlock(text)
  if (!jsonPayload) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonPayload)
  } catch (error) {
    console.warn("[adaptive-generator] failed to parse AI JSON", error, jsonPayload)
    return []
  }

  const aiProblems = normalizeAIProblems(parsed, resolvedLevel, resolvedMaxNumber, problemCount)
  return aiProblems
}

function formatAttemptSamples(attempts: ProblemAttempt[]) {
  if (!attempts?.length) return ""
  const slice = attempts.slice(-8)
  return slice
    .map((attempt, idx) => {
      const seconds = (attempt.durationMs / 1000).toFixed(1)
      return `#${idx + 1} ${attempt.difficulty} 正确:${attempt.isCorrect ? "是" : "否"} 用时:${seconds}s`
    })
    .join("\n")
}

function extractJsonBlock(text: string): string | null {
  const trimmed = text.trim()
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed
  }
  const match = trimmed.match(/\{[\s\S]*\}/)
  return match ? match[0] : null
}

function normalizeAIProblems(
  payload: unknown,
  fallbackLevel: SkillLevel,
  maxNumber: number,
  problemCount: number,
): GeneratedProblem[] {
  if (!payload || typeof payload !== "object") return []
  const problemsRaw = Array.isArray((payload as { problems?: unknown }).problems)
    ? ((payload as { problems?: unknown[] }).problems as unknown[])
    : []
  if (!problemsRaw.length) return []

  const seenPairs = new Set<string>()
  const problems: GeneratedProblem[] = []
  for (const [index, item] of problemsRaw.entries()) {
    const normalized = sanitizeAIProblem(item, fallbackLevel, maxNumber)
    if (!normalized) continue
    const key = createPairKey(normalized.num1, normalized.num2)
    if (seenPairs.has(key)) continue
    seenPairs.add(key)
    problems.push({
      id: normalized.id ?? `ai-${Date.now()}-${index}`,
      num1: normalized.num1,
      num2: normalized.num2,
      answer: normalized.num1 + normalized.num2,
      difficulty: normalized.difficulty,
      targetTimeMs: normalized.targetTimeMs,
      skillTags: normalized.skillTags,
    })
    if (problems.length >= problemCount) break
  }
  return problems
}

function sanitizeAIProblem(
  raw: unknown,
  fallbackLevel: SkillLevel,
  maxNumber: number,
):
  | {
      id?: string
      num1: number
      num2: number
      difficulty: SkillLevel
      targetTimeMs: number
      skillTags: string[]
    }
  | null {
  if (!raw || typeof raw !== "object") return null
  const value = raw as Record<string, unknown>
  const num1 = clampOperand(value.num1, maxNumber)
  const num2 = clampOperand(value.num2, maxNumber)
  if (num1 === null || num2 === null) return null
  const difficulty = isSkillLevel(value.difficulty) ? (value.difficulty as SkillLevel) : fallbackLevel
  const targetTimeMs = clampTargetTime(typeof value.targetTimeMs === "number" ? value.targetTimeMs : undefined)
  const skillTags = Array.isArray(value.skillTags)
    ? (value.skillTags.filter((tag) => typeof tag === "string") as string[])
    : ["basic-addition"]
  return {
    id: typeof value.id === "string" ? value.id : undefined,
    num1,
    num2,
    difficulty,
    targetTimeMs,
    skillTags: skillTags.length ? skillTags : ["basic-addition"],
  }
}

function clampOperand(value: unknown, maxNumber: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return null
  const rounded = Math.round(value)
  if (rounded < 1) return 1
  if (rounded > maxNumber) return maxNumber
  return rounded
}

function clampTargetTime(value?: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(12000, Math.max(4000, Math.round(value)))
  }
  return 8000
}

function createPairKey(a: number, b: number) {
  const [x, y] = [Math.min(a, b), Math.max(a, b)]
  return `${x}-${y}`
}

function isSkillLevel(value: unknown): value is SkillLevel {
  return typeof value === "string" && value in SKILL_TAGS_BY_LEVEL
}

function pickOperands(level: SkillLevel, maxNumber: number, summary: PerformanceSummary) {
  switch (level) {
    case "L1":
      return createWithinRange(maxNumber, { enforceMin: 5 })
    case "L2":
      return createWithCarrying(maxNumber, summary)
    case "L3":
      return createWithHighNumbers(maxNumber)
    default:
      return createWithinRange(maxNumber, { enforceMin: 1 })
  }
}

function createWithinRange(
  maxNumber: number,
  options: {
    enforceMin?: number
  } = {},
) {
  const min = options.enforceMin ?? 1
  return [randomInt(min, maxNumber), randomInt(min, maxNumber)]
}

function createWithCarrying(maxNumber: number, summary: PerformanceSummary) {
  const base = maxNumber > 20 ? 20 : 10
  const highOperand = randomInt(base, maxNumber)
  const lowOperand = randomInt(10, maxNumber)
  if (summary?.slowRate > 0.3) {
    return [randomInt(10, maxNumber - 5), randomInt(5, maxNumber - 10)]
  }
  return [highOperand, lowOperand]
}

function createWithHighNumbers(maxNumber: number) {
  const upperMin = Math.max(30, Math.floor(maxNumber / 2))
  return [randomInt(upperMin, maxNumber), randomInt(upperMin, maxNumber)]
}

function randomInt(min: number, max: number) {
  const minClamped = Math.ceil(min)
  const maxClamped = Math.floor(max)
  return Math.max(minClamped, Math.floor(Math.random() * (maxClamped - minClamped + 1)) + minClamped)
}

function clampLevel(level: SkillLevel): SkillLevel {
  if (SKILL_TAGS_BY_LEVEL[level]) {
    return level
  }
  return DEFAULT_LEVEL
}
