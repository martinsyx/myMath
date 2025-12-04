/**
 * IRT Module Index
 *
 * 项目反应理论 (Item Response Theory) 模块
 * 用于精确评估学生能力和生成个性化学习报告
 */

// 类型定义
export type {
  ItemParameters,
  AbilityEstimate,
  ResponseRecord,
  SkillMastery,
  StudentProfile,
  DiagnosticResult,
  ErrorPattern,
  LearningRecommendation,
  ItemBankConfig,
} from './types'

export { DEFAULT_ITEM_BANK_CONFIG } from './types'

// IRT 核心算法
export {
  calculateProbability,
  calculateItemInformation,
  calculateTestInformation,
  calculateStandardError,
  estimateMLE,
  estimateEAP,
  selectNextItem,
  thetaToPercentile,
} from './irt-core'

// 题库标定
export {
  calibrateItem,
  calibrateItemBank,
  generateInitialItemParameters,
  needsRecalibration,
  type CalibrationResult,
} from './item-calibration'

// 学习报告
export {
  analyzeSkillMastery,
  analyzeErrorPatterns,
  generateRecommendations,
  generateDiagnosticReport,
  generateReportSummary,
  buildStudentProfile,
} from './learning-report'
