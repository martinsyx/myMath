import { NextResponse } from "next/server"
import { DEFAULT_VISION_MODEL, extractResponseText, requestCodexResponse } from "@/lib/openai-client"

// AI 报告生成的详细提示词
const AI_REPORT_PROMPT = `
你是一位专业的小学数学教育评估专家，专注于儿童加法能力的诊断与评估。
请根据学生的答题数据，生成一份专业、科学、详细的学习评估报告。

## 评估维度

1. **年龄水平评估**：
   - 基于加法技能发展的心理学研究，判断学生达到了什么年龄段的典型水平
   - 参考标准：4岁(数数)、5岁(5以内加法)、6岁(10以内加法)、7岁(20以内/过十法)、8岁(两位数加法)、9岁(进位加法)、10岁+(多位数熟练)

2. **技能掌握分析**：
   - 已掌握的技能（正确率>80%且速度达标）
   - 正在学习的技能（正确率50-80%）
   - 需要加强的技能（正确率<50%或速度过慢）

3. **错误模式诊断**：
   - 分析错误答案的规律（如：进位错误、计数差1、位值混淆等）
   - 找出最容易出错的题目类型

4. **学习建议**：
   - 具体的练习方案（先练什么，再练什么）
   - 每日建议练习量
   - 提升策略

## 返回格式要求

必须返回严格的 JSON 格式：
{
  "ageAssessment": {
    "equivalentAge": number,        // 等效年龄（4-12岁）
    "gradeLevel": "string",         // 年级水平
    "description": "string",        // 详细描述
    "comparisonToTypical": "string" // 与同龄人对比
  },
  "skillsMastered": [
    { "skill": "string", "level": "excellent|good|developing", "description": "string" }
  ],
  "skillsNeedWork": [
    { "skill": "string", "currentLevel": number, "targetLevel": number, "suggestion": "string" }
  ],
  "errorPatterns": [
    { "type": "string", "frequency": number, "examples": ["string"], "cause": "string", "solution": "string" }
  ],
  "practiceRecommendation": {
    "dailyAmount": number,          // 每日建议题量
    "focusAreas": ["string"],       // 重点练习领域
    "weeklyPlan": "string",         // 一周练习计划
    "tips": ["string"]              // 学习小贴士
  },
  "overallSummary": "string",       // 总体评价（2-3句话）
  "encouragement": "string"         // 鼓励的话
}
`

const MAX_AI_OUTPUT_TOKENS = 2000

type AttemptData = {
  problemId: string
  num1: number
  num2: number
  correctAnswer: number
  userAnswer: number
  isCorrect: boolean
  durationMs: number
  difficulty: string
  skillTags: string[]
}

type RequestPayload = {
  attempts: AttemptData[]
  overallStats: {
    totalProblems: number
    correctCount: number
    accuracy: number
    avgDurationMs: number
    abilityTheta: number
    percentile: number
  }
  skillBreakdown: Array<{
    skill: string
    correct: number
    total: number
    accuracy: number
    avgTime: number
  }>
}

export async function POST(request: Request) {
  try {
    const payload: RequestPayload = await request.json()

    if (!payload.attempts?.length || payload.attempts.length < 5) {
      return NextResponse.json(
        { error: "insufficient_data", message: "需要至少5道题目的数据" },
        { status: 400 }
      )
    }

    // 构建给 AI 的详细数据描述
    const userPrompt = buildUserPrompt(payload)

    const response = await requestCodexResponse({
      model: DEFAULT_VISION_MODEL,
      reasoning: { effort: "low", summary: "auto" },
      input: [
        {
          type: "message",
          role: "user",
          content: [
            { type: "input_text", text: AI_REPORT_PROMPT },
            { type: "input_text", text: userPrompt },
          ],
        },
      ],
      max_output_tokens: MAX_AI_OUTPUT_TOKENS,
    })

    const text = extractResponseText(response)
    if (!text) {
      return NextResponse.json(
        { error: "empty_response", message: "AI 返回空响应" },
        { status: 502 }
      )
    }

    // 提取 JSON
    const jsonPayload = extractJsonBlock(text)
    if (!jsonPayload) {
      console.warn("[learning-report] Failed to extract JSON from:", text)
      return NextResponse.json(
        { error: "parse_error", message: "无法解析 AI 响应" },
        { status: 502 }
      )
    }

    let report: unknown
    try {
      report = JSON.parse(jsonPayload)
    } catch (error) {
      console.warn("[learning-report] JSON parse error:", error)
      return NextResponse.json(
        { error: "parse_error", message: "JSON 解析失败" },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      report,
      source: "ai",
    })
  } catch (error) {
    console.error("[learning-report] AI generation failed:", error)
    return NextResponse.json(
      { error: "generation_failed", message: "报告生成失败" },
      { status: 500 }
    )
  }
}

function buildUserPrompt(payload: RequestPayload): string {
  const { attempts, overallStats, skillBreakdown } = payload

  // 格式化答题详情
  const attemptDetails = attempts.slice(-30).map((a, i) => {
    const status = a.isCorrect ? "正确" : `错误(答${a.userAnswer})`
    const timeStr = (a.durationMs / 1000).toFixed(1)
    return `${i + 1}. ${a.num1}+${a.num2}=${a.correctAnswer} | ${status} | ${timeStr}秒 | ${a.difficulty} | ${a.skillTags.join(",")}`
  }).join("\n")

  // 格式化技能分析
  const skillDetails = skillBreakdown.map(s => {
    return `- ${s.skill}: ${s.correct}/${s.total} (${(s.accuracy * 100).toFixed(0)}%) 平均${(s.avgTime / 1000).toFixed(1)}秒`
  }).join("\n")

  // 找出错误题目
  const wrongAttempts = attempts.filter(a => !a.isCorrect)
  const wrongDetails = wrongAttempts.slice(-10).map(a => {
    return `${a.num1}+${a.num2}=${a.correctAnswer}, 学生答: ${a.userAnswer}`
  }).join("\n")

  return `
## 学生答题数据

### 整体统计
- 总题数: ${overallStats.totalProblems}
- 正确数: ${overallStats.correctCount}
- 正确率: ${(overallStats.accuracy * 100).toFixed(1)}%
- 平均用时: ${(overallStats.avgDurationMs / 1000).toFixed(1)}秒
- 能力值(IRT θ): ${overallStats.abilityTheta.toFixed(2)}
- 百分位排名: ${overallStats.percentile}%

### 分技能统计
${skillDetails}

### 最近答题详情（最多30道）
${attemptDetails}

### 错误题目分析（最多10道）
${wrongDetails || "无错误记录"}

请根据以上数据，生成专业的学习评估报告。特别注意分析错误模式和给出针对性的练习建议。
`
}

function extractJsonBlock(text: string): string | null {
  const trimmed = text.trim()

  // 尝试直接解析
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed
  }

  // 查找代码块中的 JSON
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }

  // 查找任意 JSON 对象
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
  return jsonMatch ? jsonMatch[0] : null
}
