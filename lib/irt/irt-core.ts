/**
 * IRT Core Algorithms
 *
 * 实现 3PL 模型的核心计算：
 * 1. 项目特征曲线 (ICC) - 计算答对概率
 * 2. 最大似然估计 (MLE) - 估计学生能力
 * 3. 期望后验估计 (EAP) - 贝叶斯能力估计
 * 4. 信息函数 - 计算题目提供的信息量
 */

import type { ItemParameters, AbilityEstimate, ResponseRecord } from './types'

/**
 * 3PL 项目特征曲线 (Item Characteristic Curve)
 * 计算给定能力值 θ 时答对题目的概率
 *
 * P(θ) = c + (1-c) / (1 + exp(-Da(θ-b)))
 *
 * @param theta - 学生能力值
 * @param item - 题目参数
 * @returns 答对概率 [0, 1]
 */
export function calculateProbability(theta: number, item: ItemParameters): number {
  const D = 1.702 // 常数，使 logistic 函数近似正态ogive
  const { discrimination: a, difficulty: b, guessing: c } = item

  const exponent = -D * a * (theta - b)
  const probability = c + (1 - c) / (1 + Math.exp(exponent))

  return Math.max(0, Math.min(1, probability))
}

/**
 * 项目信息函数 (Item Information Function)
 * 衡量题目在特定能力水平上提供的测量精度
 *
 * I(θ) = D²a²(P-c)²(1-P) / ((1-c)²P)
 *
 * @param theta - 学生能力值
 * @param item - 题目参数
 * @returns 信息量（越大越能精确测量该能力水平）
 */
export function calculateItemInformation(theta: number, item: ItemParameters): number {
  const D = 1.702
  const { discrimination: a, guessing: c } = item
  const P = calculateProbability(theta, item)

  if (P <= c || P >= 1) return 0

  const numerator = D * D * a * a * Math.pow(P - c, 2) * (1 - P)
  const denominator = Math.pow(1 - c, 2) * P

  return denominator > 0 ? numerator / denominator : 0
}

/**
 * 测验信息函数 (Test Information Function)
 * 所有题目在特定能力水平上的信息量之和
 */
export function calculateTestInformation(theta: number, items: ItemParameters[]): number {
  return items.reduce((sum, item) => sum + calculateItemInformation(theta, item), 0)
}

/**
 * 标准误差 (Standard Error of Measurement)
 * SE(θ) = 1 / sqrt(I(θ))
 */
export function calculateStandardError(theta: number, items: ItemParameters[]): number {
  const information = calculateTestInformation(theta, items)
  return information > 0 ? 1 / Math.sqrt(information) : 999
}

/**
 * 对数似然函数
 * L(θ) = Σ[uᵢ·log(Pᵢ) + (1-uᵢ)·log(1-Pᵢ)]
 *
 * @param theta - 待估计的能力值
 * @param responses - 作答记录
 * @param items - 题目参数（按 itemId 索引）
 */
export function logLikelihood(
  theta: number,
  responses: ResponseRecord[],
  itemsMap: Map<string, ItemParameters>
): number {
  let ll = 0

  for (const response of responses) {
    const item = itemsMap.get(response.itemId)
    if (!item) continue

    const P = calculateProbability(theta, item)
    const u = response.isCorrect ? 1 : 0

    // 避免 log(0)
    const safeP = Math.max(0.0001, Math.min(0.9999, P))
    ll += u * Math.log(safeP) + (1 - u) * Math.log(1 - safeP)
  }

  return ll
}

/**
 * 最大似然估计 (Maximum Likelihood Estimation)
 * 使用牛顿-拉夫森迭代法求解
 *
 * @param responses - 作答记录
 * @param itemsMap - 题目参数映射
 * @param initialTheta - 初始能力估计
 * @returns 能力估计值
 */
export function estimateMLE(
  responses: ResponseRecord[],
  itemsMap: Map<string, ItemParameters>,
  initialTheta = 0
): AbilityEstimate {
  const D = 1.702
  let theta = initialTheta
  const maxIterations = 50
  const tolerance = 0.001

  // 过滤有效作答
  const validResponses = responses.filter((r) => itemsMap.has(r.itemId))

  if (validResponses.length === 0) {
    return {
      odid: responses[0]?.odid ?? '',
      theta: 0,
      standardError: 999,
      confidence95: [-3, 3],
      updatedAt: Date.now(),
      responseCount: 0,
    }
  }

  // 检查全对或全错的边界情况
  const allCorrect = validResponses.every((r) => r.isCorrect)
  const allIncorrect = validResponses.every((r) => !r.isCorrect)

  if (allCorrect) {
    return createEstimate(responses[0]?.odid ?? '', 3, validResponses.length, itemsMap, validResponses)
  }
  if (allIncorrect) {
    return createEstimate(responses[0]?.odid ?? '', -3, validResponses.length, itemsMap, validResponses)
  }

  // 牛顿-拉夫森迭代
  for (let i = 0; i < maxIterations; i++) {
    let firstDerivative = 0
    let secondDerivative = 0

    for (const response of validResponses) {
      const item = itemsMap.get(response.itemId)!
      const { discrimination: a, guessing: c } = item
      const P = calculateProbability(theta, item)
      const u = response.isCorrect ? 1 : 0

      const W = D * a * (P - c) / (1 - c)
      const Q = 1 - P

      // 一阶导数
      firstDerivative += W * (u - P) / P

      // 二阶导数（负值）
      secondDerivative -= W * W * Q / P
    }

    if (Math.abs(secondDerivative) < 0.0001) break

    const delta = firstDerivative / secondDerivative
    theta = theta - delta

    // 边界限制
    theta = Math.max(-4, Math.min(4, theta))

    if (Math.abs(delta) < tolerance) break
  }

  return createEstimate(responses[0]?.odid ?? '', theta, validResponses.length, itemsMap, validResponses)
}

/**
 * 期望后验估计 (Expected A Posteriori)
 * 使用贝叶斯方法，假设能力值服从标准正态分布先验
 *
 * 比 MLE 更稳定，特别是在作答数量少时
 */
export function estimateEAP(
  responses: ResponseRecord[],
  itemsMap: Map<string, ItemParameters>,
  quadraturePoints = 41
): AbilityEstimate {
  const validResponses = responses.filter((r) => itemsMap.has(r.itemId))

  if (validResponses.length === 0) {
    return {
      odid: responses[0]?.odid ?? '',
      theta: 0,
      standardError: 1,
      confidence95: [-2, 2],
      updatedAt: Date.now(),
      responseCount: 0,
    }
  }

  // 设置积分节点（从 -4 到 4）
  const thetaMin = -4
  const thetaMax = 4
  const step = (thetaMax - thetaMin) / (quadraturePoints - 1)

  let numerator = 0
  let denominator = 0
  let numeratorVariance = 0

  for (let i = 0; i < quadraturePoints; i++) {
    const thetaPoint = thetaMin + i * step

    // 先验：标准正态分布
    const prior = Math.exp(-0.5 * thetaPoint * thetaPoint) / Math.sqrt(2 * Math.PI)

    // 似然
    let likelihood = 1
    for (const response of validResponses) {
      const item = itemsMap.get(response.itemId)!
      const P = calculateProbability(thetaPoint, item)
      likelihood *= response.isCorrect ? P : (1 - P)
    }

    const posterior = likelihood * prior

    numerator += thetaPoint * posterior * step
    denominator += posterior * step
    numeratorVariance += thetaPoint * thetaPoint * posterior * step
  }

  const thetaEAP = denominator > 0 ? numerator / denominator : 0
  const variance = denominator > 0 ? (numeratorVariance / denominator) - (thetaEAP * thetaEAP) : 1
  const standardError = Math.sqrt(Math.max(0.01, variance))

  return {
    odid: validResponses[0]?.odid ?? '',
    theta: Math.max(-4, Math.min(4, thetaEAP)),
    standardError,
    confidence95: [thetaEAP - 1.96 * standardError, thetaEAP + 1.96 * standardError],
    updatedAt: Date.now(),
    responseCount: validResponses.length,
  }
}

/**
 * 选择下一道最优题目（自适应测试）
 * 使用最大信息量准则：选择在当前能力估计处信息量最大的题目
 */
export function selectNextItem(
  currentTheta: number,
  availableItems: ItemParameters[],
  usedItemIds: Set<string>
): ItemParameters | null {
  const unusedItems = availableItems.filter((item) => !usedItemIds.has(item.itemId))

  if (unusedItems.length === 0) return null

  let maxInfo = -Infinity
  let bestItem: ItemParameters | null = null

  for (const item of unusedItems) {
    const info = calculateItemInformation(currentTheta, item)
    if (info > maxInfo) {
      maxInfo = info
      bestItem = item
    }
  }

  return bestItem
}

/**
 * 能力值转换为百分位排名
 * 假设总体能力服从标准正态分布
 */
export function thetaToPercentile(theta: number): number {
  // 使用标准正态CDF的近似
  const z = theta
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = z < 0 ? -1 : 1
  const x = Math.abs(z) / Math.sqrt(2)

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  const cdf = 0.5 * (1.0 + sign * y)
  return Math.round(cdf * 100)
}

/**
 * 创建能力估计对象的辅助函数
 */
function createEstimate(
  odid: string,
  theta: number,
  count: number,
  itemsMap: Map<string, ItemParameters>,
  responses: ResponseRecord[]
): AbilityEstimate {
  const items = responses.map((r) => itemsMap.get(r.itemId)!).filter(Boolean)
  const se = calculateStandardError(theta, items)

  return {
    odid,
    theta,
    standardError: se,
    confidence95: [theta - 1.96 * se, theta + 1.96 * se],
    updatedAt: Date.now(),
    responseCount: count,
  }
}
