"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { DiagnosticResult, StudentProfile, SkillMastery } from "@/lib/irt/types"
import {
  generateFullDiagnosticReport,
  getStudentProfile,
  getAbilityLevelDescription,
  getAgeLevelFromAbility,
  getResponseLog,
  getItemBank,
  getProblemDetailsMap,
} from "@/lib/irt/assessment-service"
import { thetaToPercentile, estimateEAP } from "@/lib/irt"

type LearningReportProps = {
  onClose?: () => void
}

// AI 报告的类型定义
type AIReport = {
  ageAssessment: {
    equivalentAge: number
    gradeLevel: string
    description: string
    comparisonToTypical: string
  }
  skillsMastered: Array<{
    skill: string
    level: "excellent" | "good" | "developing"
    description: string
  }>
  skillsNeedWork: Array<{
    skill: string
    currentLevel: number
    targetLevel: number
    suggestion: string
  }>
  errorPatterns: Array<{
    type: string
    frequency: number
    examples: string[]
    cause: string
    solution: string
  }>
  practiceRecommendation: {
    dailyAmount: number
    focusAreas: string[]
    weeklyPlan: string
    tips: string[]
  }
  overallSummary: string
  encouragement: string
}

type AttemptDataForAPI = {
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

export function LearningReport({ onClose }: LearningReportProps) {
  const [localReport, setLocalReport] = useState<DiagnosticResult | null>(null)
  const [localProfile, setLocalProfile] = useState<StudentProfile | null>(null)
  const [aiReport, setAIReport] = useState<AIReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiError, setAIError] = useState<string | null>(null)
  const [showAIReport, setShowAIReport] = useState(false)

  // 加载本地报告数据
  useEffect(() => {
    const loadLocalData = () => {
      setIsLoading(true)
      const diagnosticReport = generateFullDiagnosticReport()
      const studentProfile = getStudentProfile()
      setLocalReport(diagnosticReport)
      setLocalProfile(studentProfile)
      setIsLoading(false)
    }

    loadLocalData()
  }, [])

  // 准备发送给 AI 的数据
  const prepareDataForAI = useCallback(() => {
    const responses = getResponseLog()
    const itemsMap = getItemBank()
    const problemDetails = getProblemDetailsMap()

    if (responses.length < 5) return null

    // 构建答题详情
    const attempts: AttemptDataForAPI[] = []
    for (const response of responses) {
      const item = itemsMap.get(response.itemId)
      const details = problemDetails.get(response.itemId)

      if (details) {
        attempts.push({
          problemId: response.itemId,
          num1: details.num1,
          num2: details.num2,
          correctAnswer: details.correctAnswer,
          userAnswer: details.userAnswer ?? details.correctAnswer,
          isCorrect: response.isCorrect,
          durationMs: response.responseTimeMs,
          difficulty: item?.problemType ?? "L0",
          skillTags: item?.skillTags ?? ["basic-addition"],
        })
      }
    }

    if (attempts.length < 5) return null

    // 计算整体统计
    const ability = estimateEAP(responses, itemsMap)
    const correctCount = attempts.filter((a) => a.isCorrect).length
    const totalDuration = attempts.reduce((sum, a) => sum + a.durationMs, 0)

    // 按技能分组统计
    const skillMap = new Map<
      string,
      { correct: number; total: number; totalTime: number }
    >()
    for (const attempt of attempts) {
      for (const tag of attempt.skillTags) {
        const existing = skillMap.get(tag) || { correct: 0, total: 0, totalTime: 0 }
        existing.total += 1
        existing.totalTime += attempt.durationMs
        if (attempt.isCorrect) existing.correct += 1
        skillMap.set(tag, existing)
      }
    }

    const skillBreakdown = Array.from(skillMap.entries()).map(([skill, data]) => ({
      skill,
      correct: data.correct,
      total: data.total,
      accuracy: data.total > 0 ? data.correct / data.total : 0,
      avgTime: data.total > 0 ? data.totalTime / data.total : 0,
    }))

    return {
      attempts,
      overallStats: {
        totalProblems: attempts.length,
        correctCount,
        accuracy: attempts.length > 0 ? correctCount / attempts.length : 0,
        avgDurationMs: attempts.length > 0 ? totalDuration / attempts.length : 0,
        abilityTheta: ability.theta,
        percentile: thetaToPercentile(ability.theta),
      },
      skillBreakdown,
    }
  }, [])

  // 请求 AI 生成报告
  const requestAIReport = useCallback(async () => {
    setIsLoadingAI(true)
    setAIError(null)

    const data = prepareDataForAI()
    if (!data) {
      setAIError("数据不足，无法生成 AI 报告")
      setIsLoadingAI(false)
      return
    }

    try {
      const response = await fetch("/api/learning-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `请求失败: ${response.status}`)
      }

      const result = await response.json()
      if (result.success && result.report) {
        setAIReport(result.report as AIReport)
        setShowAIReport(true)
      } else {
        throw new Error("AI 报告格式错误")
      }
    } catch (error) {
      console.error("[LearningReport] AI request failed:", error)
      setAIError(error instanceof Error ? error.message : "AI 报告生成失败")
      // 保持显示本地报告作为兜底
    } finally {
      setIsLoadingAI(false)
    }
  }, [prepareDataForAI])

  if (isLoading) {
    return (
      <Card className="p-6 bg-card border border-border shadow-lg">
        <div className="text-center text-muted-foreground">加载报告中...</div>
      </Card>
    )
  }

  if (!localReport || !localProfile) {
    return (
      <Card className="p-6 bg-card border border-border shadow-lg">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">需要更多练习数据才能生成报告</p>
          <p className="text-sm text-muted-foreground">请至少完成 5 道题目后再查看报告</p>
        </div>
      </Card>
    )
  }

  const abilityLevel = getAbilityLevelDescription(localReport.overallAbility)
  const ageLevel = getAgeLevelFromAbility(localReport.overallAbility)

  // 如果显示 AI 报告
  if (showAIReport && aiReport) {
    return (
      <AIReportView
        report={aiReport}
        onClose={onClose}
        onSwitchToLocal={() => setShowAIReport(false)}
        localProfile={localProfile}
      />
    )
  }

  // 显示本地报告（作为默认或 AI 兜底）
  return (
    <div className="relative space-y-6 bg-white rounded-lg p-6">
      {onClose && (
        <button
          type="button"
          aria-label="关闭报告"
          onClick={onClose}
          className="absolute right-0 -top-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm hover:text-foreground hover:border-primary/60"
        >
          ×
        </button>
      )}

      {/* AI 报告生成按钮 */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-purple-800">AI 智能评估</h3>
            <p className="text-sm text-purple-600">
              使用 AI 分析您的答题数据，获取更详细的学习建议
            </p>
          </div>
          <Button
            onClick={requestAIReport}
            disabled={isLoadingAI}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6"
          >
            {isLoadingAI ? "AI 分析中..." : "生成 AI 报告"}
          </Button>
        </div>
        {aiError && (
          <p className="mt-2 text-sm text-red-600">
            {aiError}（已显示本地报告作为替代）
          </p>
        )}
      </Card>

      {/* 能力总览 */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border border-border shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-4">学习报告</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-4xl font-bold ${abilityLevel.color}`}>
              {abilityLevel.level}
            </div>
            <div className="text-sm text-muted-foreground mt-1">综合评价</div>
            <div className="text-xs text-muted-foreground mt-1">{abilityLevel.description}</div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-primary">
              {localReport.abilityPercentile}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">百分位排名</div>
            <div className="text-xs text-muted-foreground mt-1">
              超过 {localReport.abilityPercentile}% 的学习者
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-secondary">
              {localProfile.ability.responseCount}
            </div>
            <div className="text-sm text-muted-foreground mt-1">累计答题</div>
            <div className="text-xs text-muted-foreground mt-1">
              标准误: ±{localProfile.ability.standardError.toFixed(2)}
            </div>
          </div>
        </div>
      </Card>

      {/* 年龄水平对比 */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg">
        <h3 className="text-xl font-bold text-blue-800 mb-4">年龄水平评估</h3>

        <div className="flex flex-col md:flex-row gap-6">
          {/* 年龄标尺 */}
          <div className="flex-1">
            <div className="relative h-16 bg-gradient-to-r from-gray-200 via-blue-200 to-green-200 rounded-full overflow-hidden">
              {/* 年龄刻度 */}
              <div className="absolute inset-0 flex justify-between items-center px-4">
                {[4, 6, 8, 10, 12].map((age) => (
                  <div key={age} className="flex flex-col items-center">
                    <span className="text-xs text-gray-600 font-medium">{age}岁</span>
                  </div>
                ))}
              </div>
              {/* 当前位置指示器 */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all"
                style={{
                  left: `calc(${Math.max(0, Math.min(100, ((ageLevel.equivalentAge - 4) / 9) * 100))}% - 20px)`,
                }}
              >
                <span className="text-white font-bold text-sm">
                  {Math.round(ageLevel.equivalentAge)}
                </span>
              </div>
            </div>
          </div>

          {/* 详情说明 */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {Math.round(ageLevel.equivalentAge)}
                </span>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-800">
                  相当于 {Math.round(ageLevel.equivalentAge)} 岁水平
                </div>
                <div className="text-sm text-blue-600">{ageLevel.gradeLevel}</div>
              </div>
            </div>

            <div className="p-3 bg-white/60 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">该年龄段典型技能：</div>
              <div className="text-sm text-gray-600">{ageLevel.typicalSkills}</div>
            </div>

            <div className="text-sm text-blue-700">
              {ageLevel.description}
            </div>
          </div>
        </div>
      </Card>

      {/* 技能雷达图（简化版） */}
      <Card className="p-6 bg-card border border-border shadow-lg">
        <h3 className="text-xl font-bold text-secondary mb-4">技能掌握度</h3>

        <div className="space-y-4">
          {localReport.skillProfile.map((skill) => (
            <SkillBar key={skill.skillTag} skill={skill} />
          ))}
        </div>

        {localReport.skillProfile.length === 0 && (
          <p className="text-muted-foreground text-center">暂无技能数据</p>
        )}
      </Card>

      {/* 优势与劣势 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-green-50 border border-green-200">
          <h3 className="text-lg font-bold text-green-800 mb-3">优势技能</h3>
          {localProfile.strengths.length > 0 ? (
            <ul className="space-y-2">
              {localProfile.strengths.map((strength) => (
                <li key={strength} className="flex items-center gap-2 text-green-700">
                  <span className="text-green-500">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-600 text-sm">继续练习，发掘你的优势！</p>
          )}
        </Card>

        <Card className="p-6 bg-orange-50 border border-orange-200">
          <h3 className="text-lg font-bold text-orange-800 mb-3">需要加强</h3>
          {localProfile.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {localProfile.weaknesses.map((weakness) => (
                <li key={weakness} className="flex items-center gap-2 text-orange-700">
                  <span className="text-orange-500">!</span>
                  {weakness}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-orange-600 text-sm">表现很棒，继续保持！</p>
          )}
        </Card>
      </div>

      {/* 错误模式分析 */}
      {localReport.errorPatterns.length > 0 && (
        <Card className="p-6 bg-card border border-border shadow-lg">
          <h3 className="text-xl font-bold text-secondary mb-4">常见错误类型</h3>

          <div className="space-y-4">
            {localReport.errorPatterns.map((pattern) => (
              <div
                key={pattern.patternType}
                className={`p-4 rounded-lg border ${
                  pattern.severity === "high"
                    ? "bg-red-50 border-red-200"
                    : pattern.severity === "medium"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">
                    {getErrorPatternName(pattern.patternType)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    占比 {Math.round(pattern.frequency * 100)}%
                  </span>
                </div>
                {pattern.examples.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    示例: {pattern.examples.slice(0, 2).join(" | ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 学习建议 */}
      {localReport.learningRecommendations.length > 0 && (
        <Card className="p-6 bg-card border border-border shadow-lg">
          <h3 className="text-xl font-bold text-secondary mb-4">学习建议</h3>

          <div className="space-y-4">
            {localReport.learningRecommendations.slice(0, 5).map((rec, index) => (
              <div
                key={rec.skillTag}
                className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    rec.priority === "high"
                      ? "bg-red-500"
                      : rec.priority === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {rec.suggestedPractice}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>当前掌握度: {Math.round(rec.currentLevel * 100)}%</span>
                    <span>目标: {Math.round(rec.targetLevel * 100)}%</span>
                    <span>预计需要 {rec.estimatedProblemsToMaster} 道题</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 学习趋势 */}
      {localProfile.learningHistory.length > 1 && (
        <Card className="p-6 bg-card border border-border shadow-lg">
          <h3 className="text-xl font-bold text-secondary mb-4">学习趋势</h3>

          <div className="h-40 flex items-end gap-2">
            {localProfile.learningHistory.slice(-14).map((day) => {
              const normalizedTheta = (day.theta + 3) / 6 // -3 到 3 映射到 0 到 1
              const height = Math.max(10, normalizedTheta * 100)

              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center"
                  title={`${day.date}: 能力值 ${day.theta.toFixed(2)}, 正确率 ${Math.round(day.accuracy * 100)}%`}
                >
                  <div
                    className="w-full bg-primary rounded-t transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                    {day.date.slice(5)}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>早期</span>
            <span>最近</span>
          </div>
        </Card>
      )}

      {/* 关闭按钮 */}
      {onClose && (
        <div className="text-center">
          <Button onClick={onClose} variant="outline">
            关闭报告
          </Button>
        </div>
      )}
    </div>
  )
}

// AI 报告视图组件
function AIReportView({
  report,
  onClose,
  onSwitchToLocal,
  localProfile,
}: {
  report: AIReport
  onClose?: () => void
  onSwitchToLocal: () => void
  localProfile: StudentProfile
}) {
  return (
    <div className="relative space-y-6 bg-white rounded-lg p-6">
      {onClose && (
        <button
          type="button"
          aria-label="关闭报告"
          onClick={onClose}
          className="absolute right-0 -top-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm hover:text-foreground hover:border-primary/60"
        >
          ×
        </button>
      )}

      {/* AI 报告标识 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            AI 智能评估报告
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onSwitchToLocal}>
          查看本地报告
        </Button>
      </div>

      {/* 总体评价 */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">总体评价</h2>
        <p className="text-lg text-gray-700 leading-relaxed">{report.overallSummary}</p>
        <div className="mt-4 p-4 bg-purple-100 rounded-lg">
          <p className="text-purple-700 italic">{report.encouragement}</p>
        </div>
      </Card>

      {/* 年龄水平评估 */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
        <h3 className="text-xl font-bold text-blue-800 mb-4">年龄水平评估</h3>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {Math.round(report.ageAssessment.equivalentAge)}
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-800">
                {report.ageAssessment.gradeLevel}
              </div>
              <div className="text-sm text-blue-600">
                相当于 {report.ageAssessment.equivalentAge} 岁水平
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="p-3 bg-white/60 rounded-lg">
              <p className="text-gray-700">{report.ageAssessment.description}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <p className="text-blue-800 font-medium">与同龄对比：</p>
              <p className="text-blue-700">{report.ageAssessment.comparisonToTypical}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 已掌握的技能 */}
      {report.skillsMastered.length > 0 && (
        <Card className="p-6 bg-green-50 border border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-4">已掌握的技能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.skillsMastered.map((skill, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-green-800">{skill.skill}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      skill.level === "excellent"
                        ? "bg-green-500 text-white"
                        : skill.level === "good"
                        ? "bg-green-300 text-green-800"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {skill.level === "excellent"
                      ? "优秀"
                      : skill.level === "good"
                      ? "良好"
                      : "发展中"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{skill.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 需要加强的技能 */}
      {report.skillsNeedWork.length > 0 && (
        <Card className="p-6 bg-orange-50 border border-orange-200">
          <h3 className="text-xl font-bold text-orange-800 mb-4">需要加强的技能</h3>
          <div className="space-y-4">
            {report.skillsNeedWork.map((skill, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-orange-800">{skill.skill}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">
                      {Math.round(skill.currentLevel * 100)}%
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-orange-600 font-medium">
                      {Math.round(skill.targetLevel * 100)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${skill.currentLevel * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">{skill.suggestion}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 错误模式分析 */}
      {report.errorPatterns.length > 0 && (
        <Card className="p-6 bg-red-50 border border-red-200">
          <h3 className="text-xl font-bold text-red-800 mb-4">错误模式分析</h3>
          <div className="space-y-4">
            {report.errorPatterns.map((pattern, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-red-800">{pattern.type}</span>
                  <span className="text-sm text-red-600">
                    出现频率: {Math.round(pattern.frequency * 100)}%
                  </span>
                </div>
                {pattern.examples.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">典型错误：</span>
                    <span className="text-sm text-gray-700 ml-1">
                      {pattern.examples.join("、")}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div className="p-2 bg-red-50 rounded">
                    <span className="text-xs text-red-600 font-medium">原因：</span>
                    <p className="text-sm text-gray-700">{pattern.cause}</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <span className="text-xs text-green-600 font-medium">解决方法：</span>
                    <p className="text-sm text-gray-700">{pattern.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 练习建议 */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
        <h3 className="text-xl font-bold text-indigo-800 mb-4">练习方案</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <div className="text-3xl font-bold text-indigo-600 mb-1">
                {report.practiceRecommendation.dailyAmount}
              </div>
              <div className="text-sm text-gray-600">建议每日练习题量</div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <div className="text-sm font-medium text-indigo-800 mb-2">重点练习领域：</div>
              <div className="flex flex-wrap gap-2">
                {report.practiceRecommendation.focusAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-indigo-200">
            <div className="text-sm font-medium text-indigo-800 mb-2">一周练习计划：</div>
            <p className="text-gray-700 whitespace-pre-line">
              {report.practiceRecommendation.weeklyPlan}
            </p>
          </div>
        </div>

        {report.practiceRecommendation.tips.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-sm font-medium text-yellow-800 mb-2">学习小贴士：</div>
            <ul className="space-y-1">
              {report.practiceRecommendation.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-yellow-500">💡</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* 学习趋势（使用本地数据） */}
      {localProfile.learningHistory.length > 1 && (
        <Card className="p-6 bg-card border border-border shadow-lg">
          <h3 className="text-xl font-bold text-secondary mb-4">学习趋势</h3>

          <div className="h-40 flex items-end gap-2">
            {localProfile.learningHistory.slice(-14).map((day) => {
              const normalizedTheta = (day.theta + 3) / 6
              const height = Math.max(10, normalizedTheta * 100)

              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center"
                  title={`${day.date}: 能力值 ${day.theta.toFixed(2)}, 正确率 ${Math.round(day.accuracy * 100)}%`}
                >
                  <div
                    className="w-full bg-primary rounded-t transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                    {day.date.slice(5)}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>早期</span>
            <span>最近</span>
          </div>
        </Card>
      )}

      {/* 关闭按钮 */}
      {onClose && (
        <div className="text-center">
          <Button onClick={onClose} variant="outline">
            关闭报告
          </Button>
        </div>
      )}
    </div>
  )
}

// 技能进度条组件
function SkillBar({ skill }: { skill: SkillMastery }) {
  const percentage = Math.round(skill.masteryLevel * 100)
  const trendIcon =
    skill.trend === "improving" ? "↗" : skill.trend === "declining" ? "↘" : "→"
  const trendColor =
    skill.trend === "improving"
      ? "text-green-600"
      : skill.trend === "declining"
      ? "text-red-600"
      : "text-gray-600"

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">{getSkillDisplayName(skill.skillTag)}</span>
        <span className="text-sm text-muted-foreground">
          {percentage}% <span className={trendColor}>{trendIcon}</span>
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            percentage >= 80
              ? "bg-green-500"
              : percentage >= 50
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">
        {skill.responseCount} 道题 · 近期正确率 {Math.round(skill.recentAccuracy * 100)}%
      </div>
    </div>
  )
}

// 辅助函数
function getSkillDisplayName(skillTag: string): string {
  const names: Record<string, string> = {
    "basic-addition": "基础加法",
    "single-digit": "个位数加法",
    "sum-to-ten": "凑十",
    "bridge-ten": "过十法",
    teens: "十几加法",
    "two-digit": "两位数加法",
    carrying: "进位加法",
    "large-numbers": "大数加法",
    "speed-challenge": "速度挑战",
  }
  return names[skillTag] ?? skillTag
}

function getErrorPatternName(patternType: string): string {
  const names: Record<string, string> = {
    "off-by-one": "计数差1错误",
    "carrying-error": "进位错误",
    "digit-reversal": "数位颠倒",
    "place-value-error": "位值混淆",
    "operation-confusion": "运算混淆",
  }
  return names[patternType] ?? patternType
}

export default LearningReport
