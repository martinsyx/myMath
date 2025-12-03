# 动态出题设计方案

## 目标
- 根据实时准确率、用时、历史表现等维度生成个性化题目。
- 保证题目在数值与题型上逐步递进，且兼顾趣味性与稳定性。
- 支撑未来引入 AI / IRT 等高级算法，但短期内即可上线可控版本。

## 核心输入
| 名称 | 说明 |
| --- | --- |
| `ProblemAttempt[]` | 前端记录的每题日志：`problemId`、`difficulty`、`isCorrect`、`durationMs`、`timestamp`、`attempts` 等。 |
| `PerformanceSummary` | 由 `lib/performance-metrics.ts` 计算，包含滑动窗口准确率、平均用时、超时率、当前等级、建议难度等。 |
| 控制参数 | `problemCount`、`numberRange`、题型偏好、可选时间限制。 |

## 产出
标准化 `Problem[]` 数组，字段：`id`、`num1`、`num2`、`operation`、`difficulty`、`targetTimeMs`、`skillTags`。所有字段将在 `components/addition/AdditionPracticePage.tsx` 中消费。

## 架构流程
1. **前端记录表现**：`AdditionPracticePage` 在作答时写入 `ProblemAttempt`，储存在 state + `localStorage`。
2. **汇总指标**：前端调用 `summarizePerformance(attempts)` 得到 `PerformanceSummary`。
3. **调用生成接口**：前端 `generateNewProblems` 通过 `fetch("/api/problem-generator")` POST `{ recentAttempts, targetRange, problemCount }`。
4. **服务端生成**：
   - `app/api/problem-generator/route.ts` 会优先调用 Codex（`generateAIProblemSet`）传入 `PerformanceSummary`、最近作答日志、题量与范围。
   - AI 返回的 JSON 经过 `normalizeAIProblems` 去重、范围裁剪后直接回传前端；若 AI 失败或不足题量，则自动退回规则算法生成 (`generateRuleBasedProblemSet`)，并标记 `meta.fallback = true`。
   - 全量响应会写入 `meta.source`，前端 UI 根据该值提示“AI 题目”或“规则题目”。
5. **回传结果**：若成功，返回个性化题集；失败则 fall back 到 `generateRandomProblems` 并附带 `fallback: true` 标识。

## 规则算法（Base 版本）
1. **难度层级**：预设 `level`（L0:1-10、L1:1-20、L2:1-50、L3:1-100），可扩展进位、连加等标签。
2. **晋升条件**（窗口大小 5~10 题）：
   - 准确率 ≥ 80%。
   - 平均用时 ≤ 期望（如 6 秒）。
   - 超时率 < 20%。
3. **降级条件**：
   - 连续 3 题错误或超时。
   - 窗口准确率 < 50%。
4. **题目选取**：
   - 在当前 `level` 的题库中随机挑题，确保 `skillTags` 多样。
   - 若 `level` 上升则直接提高 `numberRange`，否则保持。
   - 若用户对某类题连续错误，可在同等级内重复该技能但降低数值。

## AI 生成策略（已上线）
1. **Prompt 约束**：`lib/adaptive-problem-generator.ts` 中的 `AI_PROMPT_TEMPLATE` 要求模型只输出固定 JSON（`problems` 数组），并明确题量、数字范围、难度标签及目标时间字段，避免额外文本。
2. **上下文信息**：`generateAIProblemSet` 会给模型提供准确率、平均用时、慢速率、推荐等级及最近 8 题的对错与耗时，帮助 AI 做科学决策。
3. **结果清洗**：`normalizeAIProblems` 限制 `num1/num2` 落在允许范围，移除重复或顺序互换的题目，填充必要字段；若 AI 返回不足，Route 会退回规则算法并设置 `meta.fallback = true`。
4. **去重与随机性**：AI 被要求输出“尽量随机且不重复”，同时服务器端按 `num1/num2` 配对查重，确保最终集合独一无二。

## 实现步骤
1. **数据结构**：在 `AdditionPracticePage` 新增 `ProblemAttempt`、`currentProblemStart` 等状态。
2. **指标模块**：实现 `lib/performance-metrics.ts`，封装滑动窗口计算。
3. **后端 API**：`app/api/problem-generator/route.ts` 完成参数校验、规则生成、AI 调用、fallback。
4. **前端体验**：`generateNewProblems` 异步化，加入加载提示、失败 toast、目标用时展示。
5. **测试**：为指标模块与 Route 写单测；使用 mock fetch 验证 fallback 行为。

## 可迭代方向
- 引入 IRT/CAT 算法以精细计算难度。
- 结合 AI 自动生成题面描述、引导语。
- 增加题型（填空、对错判断），并在生成器中统一调度。
- 根据历史表现推荐复习模式或闯关模式。
