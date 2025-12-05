import { NextResponse } from "next/server"

import type { GeneratedProblem } from "@/lib/adaptive-problem-generator"
import { generateRuleBasedProblemSet } from "@/lib/adaptive-problem-generator"
import { generateSmartProblemSet } from "@/lib/enhanced-local-generator"
import {
  DEFAULT_LEVEL,
  ProblemAttempt,
  SKILL_LEVELS,
  SkillLevel,
  summarizePerformance,
} from "@/lib/performance-metrics"

const MAX_ATTEMPTS_LOOKBACK = 50
const MIN_PROBLEM_COUNT = 3
const MAX_PROBLEM_COUNT = 30

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const problemCount = clampProblemCount(payload?.problemCount)
    const numberRange = typeof payload?.numberRange === "number" ? payload.numberRange : undefined
    const attempts = normalizeAttempts(payload?.attempts)

    if (!problemCount) {
      return NextResponse.json({ error: "missing_problem_count" }, { status: 400 })
    }

    const summary = summarizePerformance(attempts.slice(-MAX_ATTEMPTS_LOOKBACK))

    let problems: GeneratedProblem[] = []
    let source: "smart-local" | "rule-based" = "smart-local"
    let fallback = false

    try {
      // 优先使用新的本地智能生成器
      problems = generateSmartProblemSet({
        summary,
        attempts,
        problemCount,
        numberRange,
      })
      console.log(`[problem-generator] Generated ${problems.length} problems using smart local generator`)
    } catch (error) {
      console.warn("[problem-generator] Smart local generation failed, falling back to rule-based", error)
    }

    // 如果智能生成失败或数量不足，使用基础规则生成
    if (!problems.length || problems.length < problemCount) {
      const remainingCount = problemCount - problems.length
      const fallbackProblems = generateRuleBasedProblemSet({
        summary,
        problemCount: remainingCount,
        numberRange,
      })
      problems.push(...fallbackProblems)
      source = "rule-based"
      fallback = true
      console.log(`[problem-generator] Added ${fallbackProblems.length} fallback problems`)
    }

    return NextResponse.json({
      problems,
      summary,
      meta: {
        source,
        fallback,
      },
    })
  } catch (error) {
    console.error("[problem-generator] failed", error)
    return NextResponse.json({ error: "problem_generation_failed" }, { status: 500 })
  }
}

function normalizeAttempts(raw: unknown): ProblemAttempt[] {
  if (!Array.isArray(raw)) return []
  const normalized: ProblemAttempt[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const attempt = item as Record<string, unknown>
    const difficulty = isSkillLevel(attempt.difficulty) ? (attempt.difficulty as SkillLevel) : DEFAULT_LEVEL
    const skillTags = Array.isArray(attempt.skillTags)
      ? (attempt.skillTags.filter((tag) => typeof tag === "string") as string[])
      : ["basic-addition"]
    const durationMs = typeof attempt.durationMs === "number" && Number.isFinite(attempt.durationMs) ? attempt.durationMs : 0
    const attemptsCount = typeof attempt.attempts === "number" && Number.isFinite(attempt.attempts) ? attempt.attempts : 1
    const timestamp =
      typeof attempt.timestamp === "number" && Number.isFinite(attempt.timestamp)
        ? attempt.timestamp
        : Date.now()
    const targetTimeMs =
      typeof attempt.targetTimeMs === "number" && Number.isFinite(attempt.targetTimeMs) ? attempt.targetTimeMs : undefined

    if (typeof attempt.problemId !== "string") continue
    if (typeof attempt.isCorrect !== "boolean") continue

    normalized.push({
      problemId: attempt.problemId,
      difficulty,
      skillTags,
      isCorrect: attempt.isCorrect,
      durationMs: Math.max(0, durationMs),
      attempts: Math.max(1, attemptsCount),
      timestamp,
      targetTimeMs,
    })
  }
  return normalized
}

function clampProblemCount(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined
  const rounded = Math.round(value)
  return Math.min(MAX_PROBLEM_COUNT, Math.max(MIN_PROBLEM_COUNT, rounded))
}

function isSkillLevel(value: unknown): value is SkillLevel {
  return typeof value === "string" && SKILL_LEVELS.includes(value as SkillLevel)
}
