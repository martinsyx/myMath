/**
 * Item Calibration System
 * 题库参数标定系统
 *
 * 使用联合最大似然估计 (JMLE) 进行题目参数标定
 * 适用于在线收集数据后批量更新题目参数
 */

import type { ItemParameters, ResponseRecord, ItemBankConfig } from './types'
import { DEFAULT_ITEM_BANK_CONFIG } from './types'
import { calculateProbability } from './irt-core'

// 标定结果
export type CalibrationResult = {
  itemId: string
  oldParameters: ItemParameters | null
  newParameters: ItemParameters
  sampleSize: number
  fitStatistics: {
    infit: number   // 加权均方 (MNSQ) - 期望值为1
    outfit: number  // 非加权均方 - 期望值为1
    rmse: number    // 均方根误差
  }
  converged: boolean
}

// 按题目ID组织的作答数据
type ItemResponseData = {
  itemId: string
  responses: {
    isCorrect: boolean
    estimatedTheta: number // 作答者的能力估计
  }[]
}

/**
 * 使用简化的 JMLE 算法标定单个题目的参数
 *
 * 对于加法题，我们简化模型：
 * - discrimination (a): 基于题目类型设置合理默认值
 * - difficulty (b): 通过作答数据估计
 * - guessing (c): 设置为固定小值（因为不是选择题）
 */
export function calibrateItem(
  data: ItemResponseData,
  config: ItemBankConfig = DEFAULT_ITEM_BANK_CONFIG
): CalibrationResult | null {
  const { itemId, responses } = data

  if (responses.length < config.minCalibrationSample) {
    return null
  }

  // 计算基本统计量
  const totalCorrect = responses.filter((r) => r.isCorrect).length
  const pValue = totalCorrect / responses.length // 通过率

  // 1. 估计难度参数 b
  // 使用 logit 变换：b ≈ 能力均值 - logit(P)
  const avgTheta = responses.reduce((sum, r) => sum + r.estimatedTheta, 0) / responses.length

  // 避免极端值
  const clampedP = Math.max(0.05, Math.min(0.95, pValue))
  const logitP = Math.log(clampedP / (1 - clampedP))

  // 难度估计（考虑猜测参数的影响）
  const c = config.defaultGuessing
  const adjustedP = Math.max(c + 0.01, clampedP)
  const difficulty = avgTheta - Math.log((adjustedP - c) / (1 - adjustedP))

  // 2. 估计区分度参数 a
  // 使用点二列相关系数的近似方法
  const discrimination = estimateDiscrimination(responses, difficulty, c)

  // 3. 计算拟合统计量
  const fitStats = calculateFitStatistics(responses, {
    discrimination,
    difficulty,
    guessing: c,
  })

  const newParameters: ItemParameters = {
    itemId,
    discrimination: Math.max(0.3, Math.min(3, discrimination)),
    difficulty: Math.max(-4, Math.min(4, difficulty)),
    guessing: c,
    skillTags: [], // 需要外部设置
    problemType: '', // 需要外部设置
    sampleSize: responses.length,
    lastCalibrated: Date.now(),
  }

  return {
    itemId,
    oldParameters: null,
    newParameters,
    sampleSize: responses.length,
    fitStatistics: fitStats,
    converged: true,
  }
}

/**
 * 估计区分度参数
 * 使用修正的点二列相关方法
 */
function estimateDiscrimination(
  responses: { isCorrect: boolean; estimatedTheta: number }[],
  difficulty: number,
  guessing: number
): number {
  const n = responses.length
  if (n < 10) return 1.0 // 样本太小，返回默认值

  // 计算点二列相关系数
  const correctThetas = responses.filter((r) => r.isCorrect).map((r) => r.estimatedTheta)
  const incorrectThetas = responses.filter((r) => !r.isCorrect).map((r) => r.estimatedTheta)

  if (correctThetas.length === 0 || incorrectThetas.length === 0) {
    return 1.0
  }

  const meanCorrect = correctThetas.reduce((a, b) => a + b, 0) / correctThetas.length
  const meanIncorrect = incorrectThetas.reduce((a, b) => a + b, 0) / incorrectThetas.length

  // 总体标准差
  const allThetas = responses.map((r) => r.estimatedTheta)
  const meanAll = allThetas.reduce((a, b) => a + b, 0) / n
  const variance = allThetas.reduce((sum, t) => sum + (t - meanAll) ** 2, 0) / n
  const sd = Math.sqrt(variance)

  if (sd < 0.1) return 1.0

  // 点二列相关
  const p = correctThetas.length / n
  const rpb = ((meanCorrect - meanIncorrect) / sd) * Math.sqrt(p * (1 - p))

  // 转换为区分度参数
  // a ≈ rpb * D，其中 D = 1.702
  const D = 1.702
  const a = Math.abs(rpb) * D * 1.5 // 1.5 是经验调整因子

  return Math.max(0.3, Math.min(2.5, a))
}

/**
 * 计算拟合统计量（Infit 和 Outfit）
 */
function calculateFitStatistics(
  responses: { isCorrect: boolean; estimatedTheta: number }[],
  params: { discrimination: number; difficulty: number; guessing: number }
): { infit: number; outfit: number; rmse: number } {
  const item: ItemParameters = {
    itemId: '',
    discrimination: params.discrimination,
    difficulty: params.difficulty,
    guessing: params.guessing,
    skillTags: [],
    problemType: '',
    sampleSize: 0,
    lastCalibrated: 0,
  }

  let sumWeightedResidual = 0
  let sumWeight = 0
  let sumSquaredResidual = 0
  let sumSquaredError = 0

  for (const response of responses) {
    const P = calculateProbability(response.estimatedTheta, item)
    const u = response.isCorrect ? 1 : 0
    const residual = u - P
    const variance = P * (1 - P)

    if (variance > 0.001) {
      const standardizedResidual = residual / Math.sqrt(variance)
      sumWeightedResidual += variance * standardizedResidual ** 2
      sumWeight += variance
      sumSquaredResidual += standardizedResidual ** 2
    }

    sumSquaredError += residual ** 2
  }

  const n = responses.length
  const infit = sumWeight > 0 ? sumWeightedResidual / sumWeight : 1
  const outfit = n > 0 ? sumSquaredResidual / n : 1
  const rmse = Math.sqrt(sumSquaredError / n)

  return { infit, outfit, rmse }
}

/**
 * 批量标定题库
 */
export function calibrateItemBank(
  allResponses: ResponseRecord[],
  abilityEstimates: Map<string, number>, // odid -> theta
  existingItems: Map<string, ItemParameters>,
  config: ItemBankConfig = DEFAULT_ITEM_BANK_CONFIG
): CalibrationResult[] {
  // 按题目组织数据
  const itemDataMap = new Map<string, ItemResponseData>()

  for (const response of allResponses) {
    const theta = abilityEstimates.get(response.odid) ?? 0

    if (!itemDataMap.has(response.itemId)) {
      itemDataMap.set(response.itemId, {
        itemId: response.itemId,
        responses: [],
      })
    }

    itemDataMap.get(response.itemId)!.responses.push({
      isCorrect: response.isCorrect,
      estimatedTheta: theta,
    })
  }

  // 标定每个题目
  const results: CalibrationResult[] = []

  for (const [itemId, data] of itemDataMap) {
    const result = calibrateItem(data, config)
    if (result) {
      result.oldParameters = existingItems.get(itemId) ?? null
      // 保留原有的 skillTags 和 problemType
      if (result.oldParameters) {
        result.newParameters.skillTags = result.oldParameters.skillTags
        result.newParameters.problemType = result.oldParameters.problemType
      }
      results.push(result)
    }
  }

  return results
}

/**
 * 生成加法题的初始参数估计
 * 基于题目特征（数字大小、是否需要进位等）设置合理的初始值
 */
export function generateInitialItemParameters(
  num1: number,
  num2: number,
  itemId: string
): ItemParameters {
  const sum = num1 + num2
  const max = Math.max(num1, num2)

  // 分析题目特征
  const isSingleDigit = max <= 9
  const needsCarrying = (num1 % 10) + (num2 % 10) >= 10
  const isBridgeTen = sum > 10 && sum <= 20 && isSingleDigit
  const isLargeNumbers = max >= 50

  // 设置难度（基于经验规则）
  let difficulty = 0
  if (isSingleDigit && sum <= 10) {
    difficulty = -2 + sum * 0.1 // 简单题：-2 到 -1
  } else if (isBridgeTen) {
    difficulty = -0.5 + (sum - 10) * 0.1 // 凑十：-0.5 到 0.5
  } else if (needsCarrying) {
    difficulty = 0.5 + max * 0.01 // 进位：0.5 到 1.5
  } else if (isLargeNumbers) {
    difficulty = 1 + (max - 50) * 0.02 // 大数：1 到 2
  } else {
    difficulty = max * 0.03 - 0.5 // 其他：线性估计
  }

  // 设置区分度
  let discrimination = 1.0
  if (needsCarrying) {
    discrimination = 1.3 // 进位题更能区分能力
  } else if (isBridgeTen) {
    discrimination = 1.2
  } else if (isSingleDigit && sum <= 5) {
    discrimination = 0.7 // 太简单的题区分度低
  }

  // 设置技能标签
  const skillTags: string[] = ['basic-addition']
  if (isSingleDigit) skillTags.push('single-digit')
  if (needsCarrying) skillTags.push('carrying')
  if (isBridgeTen) skillTags.push('bridge-ten')
  if (max >= 10 && max < 20) skillTags.push('teens')
  if (max >= 20) skillTags.push('two-digit')
  if (isLargeNumbers) skillTags.push('large-numbers')

  // 确定题目类型
  let problemType = 'basic'
  if (needsCarrying) problemType = 'carrying'
  else if (isBridgeTen) problemType = 'bridge-ten'
  else if (isSingleDigit) problemType = 'single-digit'
  else if (isLargeNumbers) problemType = 'large-numbers'
  else problemType = 'two-digit'

  return {
    itemId,
    discrimination: Math.max(0.5, Math.min(2, discrimination)),
    difficulty: Math.max(-3, Math.min(3, difficulty)),
    guessing: 0.05, // 加法题猜对率很低
    skillTags,
    problemType,
    sampleSize: 0,
    lastCalibrated: 0,
  }
}

/**
 * 判断是否需要重新标定
 */
export function needsRecalibration(
  item: ItemParameters,
  config: ItemBankConfig = DEFAULT_ITEM_BANK_CONFIG
): boolean {
  // 从未标定
  if (item.lastCalibrated === 0) return true

  // 样本量不足
  if (item.sampleSize < config.minCalibrationSample) return true

  // 超过重新标定间隔
  const daysSinceCalibration = (Date.now() - item.lastCalibrated) / (1000 * 60 * 60 * 24)
  if (daysSinceCalibration > config.recalibrationInterval) return true

  return false
}
