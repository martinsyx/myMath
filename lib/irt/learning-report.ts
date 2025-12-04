/**
 * Learning Report Generator
 * 个性化学习报告生成器
 *
 * 基于 IRT 模型和学习数据生成详细的诊断报告
 */

import type {
  AbilityEstimate,
  ResponseRecord,
  ItemParameters,
  StudentProfile,
  SkillMastery,
  DiagnosticResult,
  ErrorPattern,
  LearningRecommendation,
} from './types'
import { estimateEAP, thetaToPercentile, calculateProbability } from './irt-core'

// 技能定义
const SKILL_DEFINITIONS: Record<string, {
  name: string
  description: string
  prerequisites: string[]
  difficulty: number // 0-1，用于排序学习路径
}> = {
  'single-digit': {
    name: '个位数加法',
    description: '1-9之间的两个数相加',
    prerequisites: [],
    difficulty: 0.1,
  },
  'sum-to-ten': {
    name: '凑十',
    description: '两数之和刚好为10的组合',
    prerequisites: ['single-digit'],
    difficulty: 0.2,
  },
  'bridge-ten': {
    name: '过十法',
    description: '结果超过10的个位数加法（如 7+5）',
    prerequisites: ['sum-to-ten'],
    difficulty: 0.3,
  },
  'teens': {
    name: '十几加法',
    description: '涉及10-19的加法',
    prerequisites: ['bridge-ten'],
    difficulty: 0.4,
  },
  'two-digit': {
    name: '两位数加法',
    description: '20-99之间的加法（不进位）',
    prerequisites: ['teens'],
    difficulty: 0.5,
  },
  'carrying': {
    name: '进位加法',
    description: '需要进位的两位数加法',
    prerequisites: ['two-digit', 'bridge-ten'],
    difficulty: 0.7,
  },
  'large-numbers': {
    name: '大数加法',
    description: '50-99之间的加法',
    prerequisites: ['carrying'],
    difficulty: 0.8,
  },
  'speed-challenge': {
    name: '速度挑战',
    description: '在限定时间内完成计算',
    prerequisites: ['carrying'],
    difficulty: 0.9,
  },
}

/**
 * 分析每个技能的掌握程度
 */
export function analyzeSkillMastery(
  responses: ResponseRecord[],
  itemsMap: Map<string, ItemParameters>
): Record<string, SkillMastery> {
  const skillStats: Record<string, {
    correct: number
    total: number
    recentCorrect: number
    recentTotal: number
    times: number[]
  }> = {}

  // 按时间排序
  const sortedResponses = [...responses].sort((a, b) => a.timestamp - b.timestamp)
  const recentCount = Math.min(20, Math.floor(responses.length * 0.3))

  sortedResponses.forEach((response, index) => {
    const item = itemsMap.get(response.itemId)
    if (!item) return

    for (const skill of item.skillTags) {
      if (!skillStats[skill]) {
        skillStats[skill] = { correct: 0, total: 0, recentCorrect: 0, recentTotal: 0, times: [] }
      }

      const stats = skillStats[skill]
      stats.total++
      stats.times.push(response.responseTimeMs)

      if (response.isCorrect) {
        stats.correct++
      }

      // 最近的作答
      if (index >= sortedResponses.length - recentCount) {
        stats.recentTotal++
        if (response.isCorrect) {
          stats.recentCorrect++
        }
      }
    }
  })

  // 转换为 SkillMastery
  const result: Record<string, SkillMastery> = {}

  for (const [skillTag, stats] of Object.entries(skillStats)) {
    const accuracy = stats.total > 0 ? stats.correct / stats.total : 0
    const recentAccuracy = stats.recentTotal > 0 ? stats.recentCorrect / stats.recentTotal : accuracy

    // 计算趋势
    let trend: 'improving' | 'stable' | 'declining' = 'stable'
    if (stats.recentTotal >= 3) {
      const diff = recentAccuracy - accuracy
      if (diff > 0.1) trend = 'improving'
      else if (diff < -0.1) trend = 'declining'
    }

    // 掌握程度：基于准确率和样本量
    const confidenceFactor = Math.min(1, stats.total / 10) // 10题以上才有完全置信
    const masteryLevel = accuracy * confidenceFactor

    result[skillTag] = {
      skillTag,
      masteryLevel,
      confidence: confidenceFactor,
      responseCount: stats.total,
      recentAccuracy,
      trend,
    }
  }

  return result
}

/**
 * 分析错误模式
 */
export function analyzeErrorPatterns(
  responses: ResponseRecord[],
  problemDetails: Map<string, { num1: number; num2: number; correctAnswer: number; userAnswer?: number }>
): ErrorPattern[] {
  const patterns: Record<string, { count: number; examples: string[] }> = {
    'off-by-one': { count: 0, examples: [] },
    'carrying-error': { count: 0, examples: [] },
    'digit-reversal': { count: 0, examples: [] },
    'place-value-error': { count: 0, examples: [] },
    'operation-confusion': { count: 0, examples: [] },
  }

  for (const response of responses) {
    if (response.isCorrect) continue

    const details = problemDetails.get(response.itemId)
    if (!details || details.userAnswer === undefined) continue

    const { num1, num2, correctAnswer, userAnswer } = details
    const diff = Math.abs(correctAnswer - userAnswer)
    const example = `${num1}+${num2}=${userAnswer} (正确: ${correctAnswer})`

    // 差1错误（计数问题）
    if (diff === 1) {
      patterns['off-by-one'].count++
      if (patterns['off-by-one'].examples.length < 3) {
        patterns['off-by-one'].examples.push(example)
      }
    }

    // 进位错误（差10或差9/11）
    if (diff === 10 || diff === 9 || diff === 11) {
      patterns['carrying-error'].count++
      if (patterns['carrying-error'].examples.length < 3) {
        patterns['carrying-error'].examples.push(example)
      }
    }

    // 数位颠倒（如23写成32）
    if (correctAnswer >= 10 && userAnswer >= 10) {
      const correctDigits = String(correctAnswer).split('').reverse().join('')
      if (String(userAnswer) === correctDigits) {
        patterns['digit-reversal'].count++
        if (patterns['digit-reversal'].examples.length < 3) {
          patterns['digit-reversal'].examples.push(example)
        }
      }
    }

    // 位值错误（如忽略了十位）
    if (correctAnswer >= 10 && userAnswer < 10 && userAnswer === correctAnswer % 10) {
      patterns['place-value-error'].count++
      if (patterns['place-value-error'].examples.length < 3) {
        patterns['place-value-error'].examples.push(example)
      }
    }
  }

  const totalErrors = responses.filter((r) => !r.isCorrect).length

  return Object.entries(patterns)
    .filter(([, data]) => data.count > 0)
    .map(([type, data]) => ({
      patternType: type as ErrorPattern['patternType'],
      frequency: totalErrors > 0 ? data.count / totalErrors : 0,
      examples: data.examples,
      severity: (data.count >= 5 ? 'high' : data.count >= 2 ? 'medium' : 'low') as ErrorPattern['severity'],
    }))
    .sort((a, b) => b.frequency - a.frequency)
}

/**
 * 生成学习建议
 */
export function generateRecommendations(
  skillMastery: Record<string, SkillMastery>,
  ability: AbilityEstimate
): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = []

  // 找出未掌握的技能
  const unmasteredSkills = Object.entries(skillMastery)
    .filter(([, mastery]) => mastery.masteryLevel < 0.8)
    .sort((a, b) => {
      // 按难度排序，优先练习较简单的
      const diffA = SKILL_DEFINITIONS[a[0]]?.difficulty ?? 0.5
      const diffB = SKILL_DEFINITIONS[b[0]]?.difficulty ?? 0.5
      return diffA - diffB
    })

  for (const [skillTag, mastery] of unmasteredSkills) {
    const skillDef = SKILL_DEFINITIONS[skillTag]
    if (!skillDef) continue

    // 检查前置技能是否已掌握
    const prerequisitesMet = skillDef.prerequisites.every((prereq) => {
      const prereqMastery = skillMastery[prereq]
      return prereqMastery && prereqMastery.masteryLevel >= 0.7
    })

    // 确定优先级
    let priority: 'high' | 'medium' | 'low' = 'medium'
    if (!prerequisitesMet) {
      priority = 'low' // 先要学前置技能
    } else if (mastery.trend === 'declining') {
      priority = 'high' // 退步中，需要重点关注
    } else if (mastery.responseCount < 5) {
      priority = 'medium' // 样本不足，需要更多练习
    } else if (mastery.masteryLevel < 0.5) {
      priority = 'high'
    }

    // 估计达到掌握需要的题目数
    const currentCorrectRate = mastery.masteryLevel / Math.max(0.1, mastery.confidence)
    const targetRate = 0.85
    const improvementNeeded = targetRate - currentCorrectRate
    const estimatedProblems = Math.ceil(improvementNeeded * 50) // 粗略估计

    recommendations.push({
      skillTag,
      priority,
      currentLevel: mastery.masteryLevel,
      targetLevel: 0.85,
      suggestedPractice: generatePracticeDescription(skillTag, mastery),
      estimatedProblemsToMaster: Math.max(5, estimatedProblems),
    })
  }

  // 按优先级排序
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

function generatePracticeDescription(skillTag: string, mastery: SkillMastery): string {
  const skillDef = SKILL_DEFINITIONS[skillTag]
  if (!skillDef) return `练习 ${skillTag} 相关题目`

  const accuracy = Math.round(mastery.recentAccuracy * 100)

  if (mastery.trend === 'declining') {
    return `${skillDef.name}技能有所退步（近期正确率${accuracy}%），建议回顾基础并加强练习`
  } else if (mastery.masteryLevel < 0.5) {
    return `${skillDef.name}尚未掌握（正确率${accuracy}%），建议从简单题目开始，逐步提升`
  } else if (mastery.masteryLevel < 0.8) {
    return `${skillDef.name}基本掌握（正确率${accuracy}%），继续练习以达到熟练`
  } else {
    return `${skillDef.name}已掌握，可以尝试更有挑战性的题目`
  }
}

/**
 * 生成完整的诊断报告
 */
export function generateDiagnosticReport(
  responses: ResponseRecord[],
  itemsMap: Map<string, ItemParameters>,
  problemDetails?: Map<string, { num1: number; num2: number; correctAnswer: number; userAnswer?: number }>
): DiagnosticResult {
  // 估计能力
  const ability = estimateEAP(responses, itemsMap)

  // 分析技能掌握度
  const skillMastery = analyzeSkillMastery(responses, itemsMap)

  // 分析错误模式
  const errorPatterns = problemDetails
    ? analyzeErrorPatterns(responses, problemDetails)
    : []

  // 生成建议
  const recommendations = generateRecommendations(skillMastery, ability)

  // 选择下一批最优题目
  const nextOptimalItems = selectOptimalItems(ability.theta, itemsMap, skillMastery, 10)

  return {
    overallAbility: ability.theta,
    abilityPercentile: thetaToPercentile(ability.theta),
    skillProfile: Object.values(skillMastery).sort((a, b) => a.masteryLevel - b.masteryLevel),
    errorPatterns,
    learningRecommendations: recommendations,
    nextOptimalItems,
  }
}

/**
 * 选择最优练习题目
 * 综合考虑：能力匹配度、薄弱技能覆盖、题目多样性
 */
function selectOptimalItems(
  theta: number,
  itemsMap: Map<string, ItemParameters>,
  skillMastery: Record<string, SkillMastery>,
  count: number
): string[] {
  const items = Array.from(itemsMap.values())

  // 找出需要加强的技能
  const weakSkills = new Set(
    Object.entries(skillMastery)
      .filter(([, m]) => m.masteryLevel < 0.8)
      .map(([skill]) => skill)
  )

  // 为每个题目评分
  const scoredItems = items.map((item) => {
    // 1. 能力匹配度：题目难度接近当前能力时信息量最大
    const difficultyMatch = Math.exp(-Math.pow(item.difficulty - theta, 2))

    // 2. 覆盖薄弱技能
    const coversWeakSkill = item.skillTags.some((tag) => weakSkills.has(tag)) ? 1.5 : 1

    // 3. 预期正确率在 0.5-0.8 之间最佳（不太难也不太简单）
    const P = calculateProbability(theta, item)
    const optimalDifficulty = P >= 0.5 && P <= 0.85 ? 1.2 : 0.8

    const score = difficultyMatch * coversWeakSkill * optimalDifficulty * item.discrimination

    return { itemId: item.itemId, score, skillTags: item.skillTags }
  })

  // 选择得分最高的题目，同时保证技能多样性
  const selectedIds: string[] = []
  const selectedSkills = new Set<string>()

  // 按分数排序
  scoredItems.sort((a, b) => b.score - a.score)

  for (const item of scoredItems) {
    if (selectedIds.length >= count) break

    // 检查是否带来新技能（多样性）
    const hasNewSkill = item.skillTags.some((skill) => !selectedSkills.has(skill))

    // 优先选择能覆盖新技能的题目
    if (selectedIds.length < count / 2 && !hasNewSkill) {
      continue
    }

    selectedIds.push(item.itemId)
    item.skillTags.forEach((skill) => selectedSkills.add(skill))
  }

  // 如果不够，用剩余高分题目填充
  for (const item of scoredItems) {
    if (selectedIds.length >= count) break
    if (!selectedIds.includes(item.itemId)) {
      selectedIds.push(item.itemId)
    }
  }

  return selectedIds
}

/**
 * 生成学习报告的文本摘要
 */
export function generateReportSummary(report: DiagnosticResult): string {
  const lines: string[] = []

  // 能力概述
  lines.push(`## 能力评估`)
  lines.push(`- 综合能力值: ${report.overallAbility.toFixed(2)}`)
  lines.push(`- 百分位排名: 超过 ${report.abilityPercentile}% 的同龄学习者`)
  lines.push('')

  // 技能掌握
  lines.push(`## 技能掌握情况`)
  const mastered = report.skillProfile.filter((s) => s.masteryLevel >= 0.8)
  const learning = report.skillProfile.filter((s) => s.masteryLevel >= 0.5 && s.masteryLevel < 0.8)
  const needsWork = report.skillProfile.filter((s) => s.masteryLevel < 0.5)

  if (mastered.length > 0) {
    lines.push(`✅ 已掌握: ${mastered.map((s) => SKILL_DEFINITIONS[s.skillTag]?.name ?? s.skillTag).join('、')}`)
  }
  if (learning.length > 0) {
    lines.push(`📚 学习中: ${learning.map((s) => SKILL_DEFINITIONS[s.skillTag]?.name ?? s.skillTag).join('、')}`)
  }
  if (needsWork.length > 0) {
    lines.push(`⚠️ 需加强: ${needsWork.map((s) => SKILL_DEFINITIONS[s.skillTag]?.name ?? s.skillTag).join('、')}`)
  }
  lines.push('')

  // 错误模式
  if (report.errorPatterns.length > 0) {
    lines.push(`## 常见错误类型`)
    for (const pattern of report.errorPatterns.slice(0, 3)) {
      const typeNames: Record<string, string> = {
        'off-by-one': '计数差1',
        'carrying-error': '进位错误',
        'digit-reversal': '数位颠倒',
        'place-value-error': '位值混淆',
        'operation-confusion': '运算混淆',
      }
      lines.push(`- ${typeNames[pattern.patternType] ?? pattern.patternType}: ${Math.round(pattern.frequency * 100)}% 的错误`)
    }
    lines.push('')
  }

  // 建议
  if (report.learningRecommendations.length > 0) {
    lines.push(`## 学习建议`)
    for (const rec of report.learningRecommendations.slice(0, 3)) {
      const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'
      lines.push(`${priorityIcon} ${rec.suggestedPractice}`)
    }
  }

  return lines.join('\n')
}

/**
 * 生成学生完整档案
 */
export function buildStudentProfile(
  odid: string,
  responses: ResponseRecord[],
  itemsMap: Map<string, ItemParameters>,
  previousHistory: { date: string; theta: number; accuracy: number; problemsAttempted: number }[] = []
): StudentProfile {
  const ability = estimateEAP(responses, itemsMap)
  const skillMastery = analyzeSkillMastery(responses, itemsMap)

  // 计算今日数据
  const today = new Date().toISOString().split('T')[0]
  const todayResponses = responses.filter((r) => {
    const responseDate = new Date(r.timestamp).toISOString().split('T')[0]
    return responseDate === today
  })
  const todayAccuracy = todayResponses.length > 0
    ? todayResponses.filter((r) => r.isCorrect).length / todayResponses.length
    : 0

  // 更新历史记录
  const updatedHistory = [...previousHistory]
  const existingTodayIndex = updatedHistory.findIndex((h) => h.date === today)
  if (existingTodayIndex >= 0) {
    updatedHistory[existingTodayIndex] = {
      date: today,
      theta: ability.theta,
      accuracy: todayAccuracy,
      problemsAttempted: todayResponses.length,
    }
  } else {
    updatedHistory.push({
      date: today,
      theta: ability.theta,
      accuracy: todayAccuracy,
      problemsAttempted: todayResponses.length,
    })
  }

  // 识别优势和劣势
  const strengths = Object.entries(skillMastery)
    .filter(([, m]) => m.masteryLevel >= 0.85)
    .map(([skill]) => SKILL_DEFINITIONS[skill]?.name ?? skill)

  const weaknesses = Object.entries(skillMastery)
    .filter(([, m]) => m.masteryLevel < 0.6)
    .map(([skill]) => SKILL_DEFINITIONS[skill]?.name ?? skill)

  // 推荐关注的技能
  const recommendations = generateRecommendations(skillMastery, ability)
  const recommendedFocus = recommendations
    .filter((r) => r.priority === 'high')
    .map((r) => SKILL_DEFINITIONS[r.skillTag]?.name ?? r.skillTag)

  return {
    odid,
    ability,
    skillMastery,
    learningHistory: updatedHistory.slice(-30), // 保留最近30天
    weaknesses,
    strengths,
    recommendedFocus,
  }
}
