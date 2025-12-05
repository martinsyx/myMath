import { generateSmartProblemSet } from "./enhanced-local-generator"
import { summarizePerformance } from "./performance-metrics"

// 性能测试函数
export function benchmarkProblemGeneration() {
  console.log("🚀 开始题目生成性能测试...")

  const testCases = [
    { problemCount: 5, level: "L0" },
    { problemCount: 10, level: "L1" },
    { problemCount: 15, level: "L2" },
    { problemCount: 20, level: "L3" },
  ]

  const results: any[] = []

  for (const testCase of testCases) {
    const attempts = generateMockAttempts(30, testCase.level)
    const summary = summarizePerformance(attempts)

    const startTime = performance.now()

    const problems = generateSmartProblemSet({
      summary,
      problemCount: testCase.problemCount,
      attempts,
    })

    const endTime = performance.now()
    const duration = endTime - startTime

    results.push({
      level: testCase.level,
      count: testCase.problemCount,
      duration: duration.toFixed(2),
      avgDuration: (duration / testCase.problemCount).toFixed(2),
      problemsGenerated: problems.length,
    })

    console.log(`📊 ${testCase.level} 级别 (${testCase.problemCount}题): ${duration.toFixed(2)}ms (平均 ${(duration / testCase.problemCount).toFixed(2)}ms/题)`)

    // 验证生成的题目质量
    validateProblems(problems, testCase.level)
  }

  console.log("\n📈 性能测试结果汇总:")
  results.forEach(result => {
    console.log(`${result.level}: ${result.duration}ms 生成 ${result.count} 题`)
  })

  return results
}

// 生成模拟答题记录
function generateMockAttempts(count: number, level: any) {
  const attempts = []
  for (let i = 0; i < count; i++) {
    const isCorrect = Math.random() > 0.2 // 80% 正确率
    const baseTime = level === "L0" ? 8000 : level === "L1" ? 7000 : level === "L2" ? 6000 : 5000
    const durationMs = isCorrect
      ? baseTime + (Math.random() - 0.5) * 2000 // ±1秒波动
      : baseTime + Math.random() * 3000 // 错误时可能更慢

    attempts.push({
      problemId: `mock-${i}`,
      difficulty: level,
      skillTags: ["basic-addition"],
      isCorrect,
      durationMs: Math.max(2000, Math.floor(durationMs)),
      attempts: isCorrect ? 1 : Math.floor(Math.random() * 2) + 1,
      timestamp: Date.now() - i * 1000,
      targetTimeMs: baseTime,
    })
  }
  return attempts
}

// 验证生成的题目
function validateProblems(problems: any[], level: string) {
  if (problems.length === 0) {
    console.warn(`⚠️  ${level} 级别未生成任何题目`)
    return
  }

  // 检查重复
  const pairs = problems.map(p => `${Math.min(p.num1, p.num2)}-${Math.max(p.num1, p.num2)}`)
  const duplicates = pairs.filter((pair, index) => pairs.indexOf(pair) !== index)
  if (duplicates.length > 0) {
    console.warn(`⚠️  ${level} 级别发现重复题目:`, duplicates)
  }

  // 检查难度范围
  const maxNumbers = { L0: 9, L1: 19, L2: 49, L3: 99 }
  const maxNum = maxNumbers[level as keyof typeof maxNumbers]
  const outOfRange = problems.filter(p => p.num1 > maxNum || p.num2 > maxNum)
  if (outOfRange.length > 0) {
    console.warn(`⚠️  ${level} 级别发现超出范围的数字:`, outOfRange.map(p => [p.num1, p.num2]))
  }

  // 检查答案正确性
  const wrongAnswers = problems.filter(p => p.answer !== p.num1 + p.num2)
  if (wrongAnswers.length > 0) {
    console.error(`❌ ${level} 级别发现答案错误:`, wrongAnswers.map(p => ({nums: [p.num1, p.num2], answer: p.answer, correct: p.num1 + p.num2})))
  }

  // 统计信息
  const sums = problems.map(p => p.answer)
  const minSum = Math.min(...sums)
  const maxSum = Math.max(...sums)
  const avgSum = sums.reduce((a, b) => a + b, 0) / sums.length

  console.log(`✅ ${level} 级别验证完成: ${problems.length}题, 和的范围 ${minSum}-${maxSum}, 平均和 ${avgSum.toFixed(1)}`)
}

// 内存使用测试
export function testMemoryUsage() {
  console.log("🧠 开始内存使用测试...")

  const initialMemory = process.memoryUsage()
  console.log("初始内存使用:", formatMemoryUsage(initialMemory))

  // 生成大量题目测试内存
  const largeBatches = []
  for (let i = 0; i < 100; i++) {
    const attempts = generateMockAttempts(20, "L2")
    const summary = summarizePerformance(attempts)
    const problems = generateSmartProblemSet({
      summary,
      problemCount: 20,
      attempts,
    })
    largeBatches.push(problems)
  }

  const finalMemory = process.memoryUsage()
  console.log("最终内存使用:", formatMemoryUsage(finalMemory))

  const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
  console.log(`内存增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`)
  console.log(`每批题目平均内存: ${(memoryIncrease / 100 / 1024).toFixed(2)} KB`)
}

function formatMemoryUsage(memory: any) {
  return {
    heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`,
  }
}

// 并发性能测试
export async function testConcurrentGeneration() {
  console.log("⚡ 开始并发性能测试...")

  const startTime = performance.now()

  const promises = []
  for (let i = 0; i < 10; i++) {
    const attempts = generateMockAttempts(20, "L2")
    const summary = summarizePerformance(attempts)

    promises.push(
      new Promise(resolve => {
        const problems = generateSmartProblemSet({
          summary,
          problemCount: 15,
          attempts,
        })
        resolve(problems.length)
      })
    )
  }

  const results = await Promise.all(promises)
  const endTime = performance.now()
  const totalDuration = endTime - startTime

  const totalProblems = results.reduce((sum, count) => sum + count, 0)
  console.log(`并发生成完成: 10个批次, 总共 ${totalProblems} 题, 耗时 ${totalDuration.toFixed(2)}ms`)
  console.log(`平均每批 ${(totalDuration / 10).toFixed(2)}ms, 每题 ${(totalDuration / totalProblems).toFixed(2)}ms`)

  return {
    totalDuration,
    totalProblems,
    avgBatchDuration: totalDuration / 10,
    avgProblemDuration: totalDuration / totalProblems,
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  console.log("🎯 开始本地题目生成器测试...\n")

  benchmarkProblemGeneration()
  console.log("\n" + "=".repeat(50) + "\n")

  testMemoryUsage()
  console.log("\n" + "=".repeat(50) + "\n")

  testConcurrentGeneration().then(() => {
    console.log("\n✅ 所有测试完成！")
  })
}