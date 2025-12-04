/**
 * IRT Assessment Service
 * IRT 评估服务 - 与现有系统的集成层
 *
 * 这个服务将 IRT 模块与现有的 performance-metrics 系统连接起来
 */

import type { ProblemAttempt, SkillLevel } from '../performance-metrics'
import type {
  ResponseRecord,
  ItemParameters,
  DiagnosticResult,
  StudentProfile,
} from './types'
import {
  estimateEAP,
  generateInitialItemParameters,
  generateDiagnosticReport,
  buildStudentProfile,
  thetaToPercentile,
} from './index'

// 本地存储键
const ITEM_BANK_KEY = 'irt_item_bank'
const RESPONSE_LOG_KEY = 'irt_response_log'
const STUDENT_PROFILE_KEY = 'irt_student_profile'

/**
 * 将 ProblemAttempt 转换为 ResponseRecord
 */
export function convertToResponseRecord(
  attempt: ProblemAttempt,
  odid: string = 'anonymous'
): ResponseRecord {
  return {
    odid,
    itemId: attempt.problemId,
    isCorrect: attempt.isCorrect,
    responseTimeMs: attempt.durationMs,
    timestamp: attempt.timestamp,
  }
}

/**
 * 根据题目信息生成 ItemParameters
 */
export function getOrCreateItemParameters(
  problemId: string,
  num1: number,
  num2: number,
  skillTags: string[],
  difficulty: SkillLevel
): ItemParameters {
  // 尝试从缓存获取
  const cached = getItemFromBank(problemId)
  if (cached) return cached

  // 生成新的参数
  const params = generateInitialItemParameters(num1, num2, problemId)
  params.skillTags = skillTags
  params.problemType = difficulty

  // 保存到缓存
  saveItemToBank(params)

  return params
}

/**
 * 从本地存储获取题目参数
 */
function getItemFromBank(itemId: string): ItemParameters | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(ITEM_BANK_KEY)
    if (!stored) return null

    const bank = JSON.parse(stored) as Record<string, ItemParameters>
    return bank[itemId] ?? null
  } catch {
    return null
  }
}

/**
 * 保存题目参数到本地存储
 */
function saveItemToBank(item: ItemParameters): void {
  if (typeof window === 'undefined') return

  try {
    const stored = localStorage.getItem(ITEM_BANK_KEY)
    const bank = stored ? JSON.parse(stored) : {}
    bank[item.itemId] = item
    localStorage.setItem(ITEM_BANK_KEY, JSON.stringify(bank))
  } catch {
    // 忽略存储错误
  }
}

/**
 * 获取完整的题库
 */
export function getItemBank(): Map<string, ItemParameters> {
  const map = new Map<string, ItemParameters>()

  if (typeof window === 'undefined') return map

  try {
    const stored = localStorage.getItem(ITEM_BANK_KEY)
    if (stored) {
      const bank = JSON.parse(stored) as Record<string, ItemParameters>
      for (const [id, item] of Object.entries(bank)) {
        map.set(id, item)
      }
    }
  } catch {
    // 忽略解析错误
  }

  return map
}

/**
 * 记录作答并更新能力估计
 */
export function logResponseAndUpdateAbility(
  attempt: ProblemAttempt,
  num1: number,
  num2: number,
  userAnswer?: number
): {
  theta: number
  percentile: number
  standardError: number
} {
  const odid = getOrCreateStudentId()

  // 转换并保存作答记录
  const response = convertToResponseRecord(attempt, odid)
  saveResponseLog(response)

  // 确保题目参数存在
  const itemParams = getOrCreateItemParameters(
    attempt.problemId,
    num1,
    num2,
    attempt.skillTags,
    attempt.difficulty
  )

  // 保存题目详情（用于错误分析）
  if (userAnswer !== undefined) {
    saveProblemDetails(attempt.problemId, {
      num1,
      num2,
      correctAnswer: num1 + num2,
      userAnswer,
    })
  }

  // 获取所有作答记录并估计能力
  const allResponses = getResponseLog()
  const itemsMap = getItemBank()

  const ability = estimateEAP(allResponses, itemsMap)

  return {
    theta: ability.theta,
    percentile: thetaToPercentile(ability.theta),
    standardError: ability.standardError,
  }
}

/**
 * 获取或创建学生ID
 */
function getOrCreateStudentId(): string {
  if (typeof window === 'undefined') return 'anonymous'

  let odid = localStorage.getItem('student_odid')
  if (!odid) {
    // 使用固定前缀和简单计数器避免随机数导致的服务器/客户端不一致
    const existingCount = parseInt(localStorage.getItem('student_counter') || '0', 10)
    const newCount = existingCount + 1
    localStorage.setItem('student_counter', newCount.toString())
    odid = `student_${newCount}`
    localStorage.setItem('student_odid', odid)
  }
  return odid
}

/**
 * 保存作答记录
 */
function saveResponseLog(response: ResponseRecord): void {
  if (typeof window === 'undefined') return

  try {
    const stored = localStorage.getItem(RESPONSE_LOG_KEY)
    const log: ResponseRecord[] = stored ? JSON.parse(stored) : []
    log.push(response)

    // 保留最近500条记录
    const trimmed = log.slice(-500)
    localStorage.setItem(RESPONSE_LOG_KEY, JSON.stringify(trimmed))
  } catch {
    // 忽略存储错误
  }
}

/**
 * 获取作答记录
 */
export function getResponseLog(): ResponseRecord[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(RESPONSE_LOG_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * 保存题目详情
 */
function saveProblemDetails(
  problemId: string,
  details: { num1: number; num2: number; correctAnswer: number; userAnswer: number }
): void {
  if (typeof window === 'undefined') return

  try {
    const key = 'irt_problem_details'
    const stored = localStorage.getItem(key)
    const map: Record<string, typeof details> = stored ? JSON.parse(stored) : {}
    map[problemId] = details
    localStorage.setItem(key, JSON.stringify(map))
  } catch {
    // 忽略
  }
}

/**
 * 获取题目详情
 */
export function getProblemDetailsMap(): Map<string, { num1: number; num2: number; correctAnswer: number; userAnswer?: number }> {
  const map = new Map()

  if (typeof window === 'undefined') return map

  try {
    const stored = localStorage.getItem('irt_problem_details')
    if (stored) {
      const data = JSON.parse(stored)
      for (const [id, details] of Object.entries(data)) {
        map.set(id, details)
      }
    }
  } catch {
    // 忽略
  }

  return map
}

/**
 * 生成诊断报告
 */
export function generateFullDiagnosticReport(): DiagnosticResult | null {
  const responses = getResponseLog()
  if (responses.length < 5) return null

  const itemsMap = getItemBank()
  const problemDetails = getProblemDetailsMap()

  return generateDiagnosticReport(responses, itemsMap, problemDetails)
}

/**
 * 获取或更新学生档案
 */
export function getStudentProfile(): StudentProfile | null {
  if (typeof window === 'undefined') return null

  const responses = getResponseLog()
  if (responses.length < 3) return null

  const odid = getOrCreateStudentId()
  const itemsMap = getItemBank()

  // 获取之前的历史记录
  let previousHistory: StudentProfile['learningHistory'] = []
  try {
    const stored = localStorage.getItem(STUDENT_PROFILE_KEY)
    if (stored) {
      const prev = JSON.parse(stored) as StudentProfile
      previousHistory = prev.learningHistory ?? []
    }
  } catch {
    // 忽略
  }

  const profile = buildStudentProfile(odid, responses, itemsMap, previousHistory)

  // 保存更新后的档案
  try {
    localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(profile))
  } catch {
    // 忽略
  }

  return profile
}

/**
 * 将能力值转换为等级描述
 * 描述基于百分位排名和年龄水平，不依赖用户输入年龄
 */
export function getAbilityLevelDescription(theta: number): {
  level: string
  description: string
  color: string
} {
  // 计算百分位和年龄水平
  const percentile = thetaToPercentile(theta)
  const ageLevel = getAgeLevelFromAbility(theta)

  if (theta >= 2) {
    return {
      level: '优秀',
      description: `超过${percentile}%的学习者，达到${Math.round(ageLevel.equivalentAge)}岁水平`,
      color: 'text-green-600'
    }
  } else if (theta >= 1) {
    return {
      level: '良好',
      description: `超过${percentile}%的学习者，达到${Math.round(ageLevel.equivalentAge)}岁水平`,
      color: 'text-blue-600'
    }
  } else if (theta >= 0) {
    return {
      level: '中等',
      description: `超过${percentile}%的学习者，达到${Math.round(ageLevel.equivalentAge)}岁水平`,
      color: 'text-yellow-600'
    }
  } else if (theta >= -1) {
    return {
      level: '需努力',
      description: `达到${Math.round(ageLevel.equivalentAge)}岁水平，建议加强练习`,
      color: 'text-orange-600'
    }
  } else {
    return {
      level: '需加强',
      description: `达到${Math.round(ageLevel.equivalentAge)}岁水平，需重点巩固基础`,
      color: 'text-red-600'
    }
  }
}

/**
 * 年龄水平定义
 * 基于加法技能发展的典型年龄里程碑
 */
const AGE_LEVEL_THRESHOLDS: {
  minTheta: number
  age: number
  gradeLevel: string
  typicalSkills: string
}[] = [
  { minTheta: 2.5, age: 12, gradeLevel: '六年级', typicalSkills: '熟练掌握所有加法，心算快速准确' },
  { minTheta: 2.0, age: 11, gradeLevel: '五年级', typicalSkills: '大数加法熟练，具备速算能力' },
  { minTheta: 1.5, age: 10, gradeLevel: '四年级', typicalSkills: '多位数加法，进位熟练' },
  { minTheta: 1.0, age: 9, gradeLevel: '三年级', typicalSkills: '两位数进位加法' },
  { minTheta: 0.5, age: 8, gradeLevel: '二年级', typicalSkills: '两位数加法，简单进位' },
  { minTheta: 0.0, age: 7, gradeLevel: '一年级', typicalSkills: '20以内加法，过十法' },
  { minTheta: -0.5, age: 6, gradeLevel: '学前大班', typicalSkills: '10以内加法，凑十' },
  { minTheta: -1.0, age: 5, gradeLevel: '学前中班', typicalSkills: '5以内加法，数数' },
  { minTheta: -Infinity, age: 4, gradeLevel: '学前小班', typicalSkills: '认识数字，简单计数' },
]

/**
 * 将能力值转换为对应的年龄水平
 * @param theta 能力值 (-3 ~ 3)
 * @param actualAge 实际年龄（可选），用于对比
 */
export function getAgeLevelFromAbility(theta: number, actualAge?: number): {
  equivalentAge: number
  gradeLevel: string
  typicalSkills: string
  comparison: 'ahead' | 'on-track' | 'behind' | null
  aheadByYears: number | null
  description: string
} {
  // 找到对应的年龄水平
  const level = AGE_LEVEL_THRESHOLDS.find(t => theta >= t.minTheta) ?? AGE_LEVEL_THRESHOLDS[AGE_LEVEL_THRESHOLDS.length - 1]

  // 计算精确的年龄（线性插值）
  const levelIndex = AGE_LEVEL_THRESHOLDS.indexOf(level)
  let equivalentAge = level.age

  if (levelIndex > 0) {
    const prevLevel = AGE_LEVEL_THRESHOLDS[levelIndex - 1]
    const thetaRange = prevLevel.minTheta - level.minTheta
    const thetaProgress = theta - level.minTheta
    if (thetaRange > 0) {
      const ageProgress = (thetaProgress / thetaRange) * (prevLevel.age - level.age)
      equivalentAge = level.age + ageProgress
    }
  }

  // 限制在 4-13 岁范围内
  equivalentAge = Math.max(4, Math.min(13, equivalentAge))

  // 与实际年龄对比
  let comparison: 'ahead' | 'on-track' | 'behind' | null = null
  let aheadByYears: number | null = null
  let description = ''

  if (actualAge !== undefined) {
    const diff = equivalentAge - actualAge
    aheadByYears = Math.round(diff * 10) / 10

    if (diff >= 1) {
      comparison = 'ahead'
      description = `超前 ${Math.round(diff)} 年，表现优异！`
    } else if (diff >= 0.5) {
      comparison = 'ahead'
      description = `略超同龄水平`
    } else if (diff >= -0.5) {
      comparison = 'on-track'
      description = `符合年龄水平`
    } else if (diff >= -1) {
      comparison = 'behind'
      description = `需要加强练习`
    } else {
      comparison = 'behind'
      description = `需要重点关注，建议多加练习`
    }
  } else {
    description = `达到${Math.round(equivalentAge)}岁儿童的典型加法水平`
  }

  return {
    equivalentAge: Math.round(equivalentAge * 10) / 10,
    gradeLevel: level.gradeLevel,
    typicalSkills: level.typicalSkills,
    comparison,
    aheadByYears,
    description,
  }
}

/**
 * 重置所有 IRT 数据
 */
export function resetIRTData(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(ITEM_BANK_KEY)
  localStorage.removeItem(RESPONSE_LOG_KEY)
  localStorage.removeItem(STUDENT_PROFILE_KEY)
  localStorage.removeItem('irt_problem_details')
}
