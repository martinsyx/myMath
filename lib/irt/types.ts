/**
 * Item Response Theory (IRT) Types
 *
 * IRT 是一种心理测量模型，用于估计学生能力和题目参数
 * 本项目使用 3PL (3-Parameter Logistic) 模型
 */

// 题目参数（3PL模型）
export type ItemParameters = {
  itemId: string
  // a: 区分度参数 (discrimination) - 题目区分高低能力学生的能力
  // 通常范围 0.5 ~ 2.5，越高越能区分
  discrimination: number
  // b: 难度参数 (difficulty) - 答对概率为50%时对应的能力值
  // 通常范围 -3 ~ 3，与能力值同尺度
  difficulty: number
  // c: 猜测参数 (guessing) - 低能力学生随机猜对的概率
  // 加法题通常较低（0.05-0.1），选择题较高（0.25）
  guessing: number
  // 元数据
  skillTags: string[]
  problemType: string // e.g., "single-digit", "bridge-ten", "carrying"
  sampleSize: number  // 用于标定的样本数
  lastCalibrated: number // 最后标定时间戳
}

// 学生能力估计
export type AbilityEstimate = {
  odid: string       // 匿名用户标识
  theta: number       // 能力值 θ，通常范围 -3 ~ 3
  standardError: number // 标准误差，越小越精确
  confidence95: [number, number] // 95%置信区间
  updatedAt: number
  responseCount: number // 用于估计的作答数量
}

// 单次作答记录
export type ResponseRecord = {
  odid: string
  itemId: string
  isCorrect: boolean
  responseTimeMs: number
  timestamp: number
}

// 技能掌握度
export type SkillMastery = {
  skillTag: string
  masteryLevel: number      // 0-1 掌握程度
  confidence: number        // 估计置信度
  responseCount: number
  recentAccuracy: number
  trend: 'improving' | 'stable' | 'declining'
}

// 学生完整档案
export type StudentProfile = {
odid: string
  ability: AbilityEstimate
  skillMastery: Record<string, SkillMastery>
  learningHistory: {
    date: string
    theta: number
    accuracy: number
    problemsAttempted: number
  }[]
  weaknesses: string[]
  strengths: string[]
  recommendedFocus: string[]
}

// 诊断性评估结果
export type DiagnosticResult = {
  overallAbility: number
  abilityPercentile: number // 百分位排名
  skillProfile: SkillMastery[]
  errorPatterns: ErrorPattern[]
  learningRecommendations: LearningRecommendation[]
  nextOptimalItems: string[] // 下一批最优题目ID
}

export type ErrorPattern = {
  patternType: 'off-by-one' | 'carrying-error' | 'digit-reversal' | 'operation-confusion' | 'place-value-error'
  frequency: number // 出现频率
  examples: string[] // 示例题目
  severity: 'low' | 'medium' | 'high'
}

export type LearningRecommendation = {
  skillTag: string
  priority: 'high' | 'medium' | 'low'
  currentLevel: number
  targetLevel: number
  suggestedPractice: string
  estimatedProblemsToMaster: number
}

// 题库配置
export type ItemBankConfig = {
  minCalibrationSample: number  // 最小标定样本量
  recalibrationInterval: number // 重新标定间隔（天）
  defaultDiscrimination: number
  defaultDifficulty: number
  defaultGuessing: number
}

export const DEFAULT_ITEM_BANK_CONFIG: ItemBankConfig = {
  minCalibrationSample: 30,
  recalibrationInterval: 30,
  defaultDiscrimination: 1.0,
  defaultDifficulty: 0,
  defaultGuessing: 0.05,
}
