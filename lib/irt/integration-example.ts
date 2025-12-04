/**
 * IRT Integration Example
 * IRT 系统集成示例
 *
 * 展示如何在现有的加法练习页面中集成 IRT 评估系统
 */

import type { ProblemAttempt } from '@/lib/performance-metrics'
import {
  logResponseAndUpdateAbility,
  generateFullDiagnosticReport,
  getStudentProfile,
  getAbilityLevelDescription,
  getResponseLog,
  getItemBank,
} from './assessment-service'
import { selectNextItem } from './irt-core'
import { generateReportSummary } from './learning-report'

/**
 * 使用示例 1: 在 checkAnswer 函数中集成 IRT 更新
 *
 * 在现有的 AdditionPracticePage.tsx 的 checkAnswer 函数中添加:
 *
 * ```typescript
 * import { logResponseAndUpdateAbility } from '@/lib/irt/assessment-service'
 *
 * const checkAnswer = (id: number) => {
 *   // ... 现有代码 ...
 *
 *   const submittedAnswer = Number.parseInt(currentProblem.userAnswer, 10)
 *   const isCorrect = submittedAnswer === currentProblem.answer
 *
 *   // 记录到 IRT 系统并获取能力更新
 *   const abilityUpdate = logResponseAndUpdateAbility(
 *     {
 *       problemId: String(currentProblem.id),
 *       difficulty: currentProblem.difficulty,
 *       skillTags: currentProblem.skillTags,
 *       isCorrect,
 *       durationMs: Date.now() - startTime,
 *       attempts: currentProblem.attempts + 1,
 *       timestamp: Date.now(),
 *       targetTimeMs: currentProblem.targetTimeMs,
 *     },
 *     currentProblem.num1,
 *     currentProblem.num2,
 *     submittedAnswer
 *   )
 *
 *   console.log('能力更新:', {
 *     theta: abilityUpdate.theta,
 *     percentile: abilityUpdate.percentile,
 *   })
 *
 *   // ... 后续代码 ...
 * }
 * ```
 */

/**
 * 使用示例 2: 添加学习报告按钮
 *
 * 在 AdditionPracticePage.tsx 中添加:
 *
 * ```typescript
 * import { LearningReport } from '@/components/LearningReport'
 *
 * // 在组件中添加状态
 * const [showReport, setShowReport] = useState(false)
 *
 * // 在 JSX 中添加按钮
 * <Button onClick={() => setShowReport(true)}>
 *   查看学习报告
 * </Button>
 *
 * // 添加报告弹窗
 * {showReport && (
 *   <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
 *     <div className="max-w-4xl mx-auto my-8 p-4">
 *       <LearningReport onClose={() => setShowReport(false)} />
 *     </div>
 *   </div>
 * )}
 * ```
 */

/**
 * 使用示例 3: 使用 IRT 选择最优下一题
 */
export function selectNextOptimalProblem(): {
  num1: number
  num2: number
  difficulty: string
  expectedAccuracy: number
} | null {
  const responses = getResponseLog()
  const itemsMap = getItemBank()

  if (responses.length === 0) {
    // 没有历史数据，返回简单题
    return {
      num1: 3,
      num2: 2,
      difficulty: 'L0',
      expectedAccuracy: 0.95,
    }
  }

  // 获取当前能力估计
  const profile = getStudentProfile()
  if (!profile) return null

  const currentTheta = profile.ability.theta

  // 选择最优题目
  const usedItemIds = new Set(responses.map((r) => r.itemId))
  const nextItem = selectNextItem(currentTheta, Array.from(itemsMap.values()), usedItemIds)

  if (!nextItem) {
    // 题库已用完，生成新题
    const difficulty = currentTheta > 1 ? 50 : currentTheta > 0 ? 20 : 10
    const num1 = Math.floor(Math.random() * difficulty) + 1
    const num2 = Math.floor(Math.random() * difficulty) + 1
    return {
      num1,
      num2,
      difficulty: currentTheta > 1 ? 'L3' : currentTheta > 0 ? 'L1' : 'L0',
      expectedAccuracy: 0.7,
    }
  }

  // 解析题目参数（假设 itemId 格式为 "num1_num2" 或其他）
  // 这里需要根据实际的题目存储方式来解析
  return {
    num1: 5, // 实际应从 nextItem 解析
    num2: 3,
    difficulty: nextItem.problemType,
    expectedAccuracy: 0.7,
  }
}

/**
 * 使用示例 4: 生成文本报告摘要
 */
export function getTextReportSummary(): string | null {
  const report = generateFullDiagnosticReport()
  if (!report) return null

  return generateReportSummary(report)
}

/**
 * 使用示例 5: 获取当前能力等级描述
 */
export function getCurrentAbilityDescription(): {
  level: string
  description: string
  percentile: number
} | null {
  const profile = getStudentProfile()
  if (!profile) return null

  const levelInfo = getAbilityLevelDescription(profile.ability.theta)
  const percentile = Math.round(
    (1 / (1 + Math.exp(-profile.ability.theta))) * 100
  )

  return {
    ...levelInfo,
    percentile,
  }
}

/**
 * 使用示例 6: 检查是否应该推荐特定技能练习
 */
export function getRecommendedSkillFocus(): string[] {
  const profile = getStudentProfile()
  if (!profile) return []

  return profile.recommendedFocus
}
