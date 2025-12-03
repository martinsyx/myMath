# 能力评估设计方案

## 目标
- 精准描述学生在加法技能上的实时水平，支持“晋升/回退”与年龄段映射。
- 为动态出题提供数据支撑，并让家长通过可视化了解孩子表现。
- 设计可扩展的评估框架，未来可引入 IRT/CAT 或更多技能领域。

## 数据模型
```ts
type ProblemAttempt = {
  problemId: string;
  difficulty: "L0" | "L1" | "L2" | "L3" | string;
  skillTags: string[];
  isCorrect: boolean;
  durationMs: number;
  attempts: number; // 单题多次提交
  timestamp: number;
  targetTimeMs?: number;
  source?: "rule" | "ai";
};

type PerformanceSummary = {
  windowSize: number;
  accuracy: number;
  avgDurationMs: number;
  slowRate: number;
  streak: { correct: number; incorrect: number };
  currentLevel: string;
  recommendedLevel: string;
  levelConfidence: number; // 0~1
  ageBand: string; // 例如 “小学一年级-上”
};
```

## 评估指标
1. **准确率**：最近 `windowSize`（默认 10）题的正确率。
2. **平均用时**：同窗口内 `durationMs` 的平均值；可额外计算中位数避免异常值。
3. **超时率**：`durationMs > targetTimeMs` 的比例。
4. **连对/连错**：用于快速晋升或触发干预。
5. **层级信心**：基于样本量与波动度，衡量当前推荐是否可靠。
6. **历史最高等级**：辅助展示“已达到过的最高水平”。

## 算法设计
### 规则版（快速上线）
1. **层级定义**：
   - L0：1~10 以内
   - L1：1~20 以内
   - L2：1~50 以内（含进位）
   - L3：1~100 以内（多次进位）
2. **晋升逻辑**（窗口=5 或 10）：
   - 准确率 ≥ 80%，平均用时 ≤ 6s，超时率 < 20%。
   - 若满足条件，`recommendedLevel = currentLevel + 1` 且 `levelConfidence` = min(1, accuracy / 0.8)。
3. **降级逻辑**：
   - 连续 3 题错误或准确率 < 50%。
   - `recommendedLevel = currentLevel - 1` 并提示复习。
4. **年龄映射**：
   - 依据教材标准，建立映射表：例如 L0→“幼儿园中班”，L1→“小学一年级上学期”，L2→“一年级下/二年级初”，L3→“二年级中后”。
   - `PerformanceSummary.ageBand` 直接引用映射。

### 进阶版：IRT/CAT 思路
1. **题目参数化**：为题库标注难度 `b`、区分度 `a`、猜测度 `c`（可先只用 `b`）。
2. **能力估计**：使用 1PL 或 2PL 模型更新 `θ`：
   ```math
   P(\theta, b) = 1/(1+exp(-a(\theta-b)))
   ```
   - 答对：`θ += k * (1 - P)`
   - 答错：`θ -= k * P`
   - `k` 随样本量衰减，保证稳定。
3. **时间因素**：将 `durationMs` 标准化为 `speedScore`（相对目标时间），再与正确性组合：  
   `overall = w_acc * correctness + w_speed * speedScore`。
4. **年龄/智力映射**：
   - 依据实际用户数据，统计不同 `θ` 的年龄分布。
   - 初期可人工设定区间：`θ<-1`→幼儿园，`-1~0`→一年级早期，`0~1`→一年级后期/二年级初等。

## 展示与反馈
- 在 `AdditionPracticePage` scoreboard 旁新增表现卡片：准确率、平均用时、当前等级、预测年龄段。
- 若检测到回退，给出友好提示，如“建议复习 1-20 以内的加法”。
- 可选生成“能力成长曲线”，展示 `θ` 或等级随时间的变化。

## 实现步骤
1. **前端记录**：确保 `ProblemAttempt` 数据完整并上传至后端（可选）。
2. **指标计算**：实现 `summarizePerformance`，返回 `PerformanceSummary`（包含等级、年龄映射）。
3. **与动态出题联动**：`PerformanceSummary.recommendedLevel` 作为 `/api/problem-generator` 的关键输入。
4. **可视化**：在 UI 中展示摘要、晋升/回退状态、年龄段文案；提供 tooltip 说明算法依据。
5. **后续优化**：
   - 引入 IRT/CAT，引导题库标注。
   - 利用历史数据校准年龄映射与阈值。
   - 将评估结果同步到用户账号，实现跨设备追踪。

## 维护与迭代建议
- 文档将作为 Codex 开发参照，更新时需要记录算法版本和变更点。
- 建议在 `docs/CHANGELOG.md`（未来可建）同步记录每轮调参。
- 结合实际运营反馈定期复盘晋升/降级门槛，避免难度波动过大或评估过宽松。
