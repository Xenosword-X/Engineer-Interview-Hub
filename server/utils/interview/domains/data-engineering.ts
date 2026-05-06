import type { DomainConfig, SystemPromptState } from './types'
import type { QuestionPoolItem } from '../types'
import type { UpcomingTurnPlan } from '../validateAiResponse'

const ROLE_GUIDANCE_ZH: Record<string, string> = {
  junior: `[職等校準 · 初階資料工程師]\n- 題目深度：基礎 SQL 查詢與 JOIN、ETL 概念、常見資料格式（CSV/JSON/Parquet）。\n- 不做跨 turn 追問。\n- behavioral：學習動機、資料處理的第一個專案經驗。`,
  mid: `[職等校準 · 中階資料工程師]\n- 題目深度：SQL 最佳化與索引、Pipeline 設計模式（ELT vs ETL）、Spark 基礎操作、資料倉儲 schema 設計。\n- 出題時整合實務場景（例：「設計一個每日 ETL pipeline，把 RDBMS 資料同步到 Data Warehouse，說明你的設計考量」）。\n- 不做跨 turn 追問。`,
  senior: `[職等校準 · 資深資料工程師]\n- 題目深度：大規模 Pipeline 設計、資料品質監控、Streaming vs Batch 取捨、多租戶資料平台設計。\n- 出題時要求量化與架構決策（例：「每日 10TB 資料，如何在成本與延遲之間取捨，選擇 Spark/Flink/dbt 各有什麼理由」）。\n- 不做跨 turn 追問。`,
}

const ROLE_GUIDANCE_EN: Record<string, string> = {
  junior: `[ROLE CALIBRATION · Junior Data Engineer]\n- Depth: basic SQL, JOINs, ETL concepts, common formats (CSV/JSON/Parquet).\n- No cross-turn follow-ups.\n- Behavioral: learning motivation, first data project experience.`,
  mid: `[ROLE CALIBRATION · Mid-level Data Engineer]\n- Depth: SQL optimization & indexing, ELT vs ETL patterns, basic Spark, data warehouse schema design.\n- Bake practical scenarios into questions.\n- No cross-turn follow-ups.`,
  senior: `[ROLE CALIBRATION · Senior Data Engineer]\n- Depth: large-scale pipeline design, data quality monitoring, streaming vs batch tradeoffs, multi-tenant data platform.\n- Ask for quantified decisions (e.g. "10TB/day — how do you balance cost vs latency choosing between Spark/Flink/dbt").\n- No cross-turn follow-ups.`,
}

function buildPool(pool: QuestionPoolItem[], lang: 'zh' | 'en'): string {
  if (!pool.length) return ''
  const lines = pool.map(q => `- id: ${q.id}, category: ${q.category}, title: ${q.title}, difficulty: ${q.difficulty}, used: ${q.used}`).join('\n')
  return lang === 'zh'
    ? `\n[TECHNICAL QUESTION POOL]\n${lines}\n優先選 used=false；無合適則自行出題（isGeneratedQuestion=true, pickedQuestionId=null）。`
    : `\n[TECHNICAL QUESTION POOL]\n${lines}\nPrefer used=false. If nothing fits, generate (isGeneratedQuestion=true, pickedQuestionId=null).`
}

function buildPhaseGuidanceZh(plan: UpcomingTurnPlan, usedCats: string[]): string {
  if (plan.phase === 'behavioral') return plan.isLastInPhase ? `behavioral 最後一題（${plan.progressCurrent}/${plan.progressTotalInPhase}）。簡短回應後問最後一個問題。` : `behavioral 第 ${plan.progressCurrent}/${plan.progressTotalInPhase} 題，切換不同面向。`
  if (plan.phase === 'technical') {
    const usedLine = usedCats.length ? `已涵蓋：${usedCats.join(', ')}——本題選不同類別。` : `第一題，任意類別。`
    return `technical 第 ${plan.progressCurrent}/${plan.progressTotalInPhase} 題。${usedLine} 1 turn = 1 新題，禁止追問。`
  }
  return `面試結束，1-2 句結語，不再問題。`
}

function buildPhaseGuidanceEn(plan: UpcomingTurnPlan, usedCats: string[]): string {
  if (plan.phase === 'behavioral') return plan.isLastInPhase ? `Last behavioral (${plan.progressCurrent}/${plan.progressTotalInPhase}).` : `Behavioral ${plan.progressCurrent}/${plan.progressTotalInPhase}. Different dimension each turn.`
  if (plan.phase === 'technical') {
    return `Technical ${plan.progressCurrent}/${plan.progressTotalInPhase}. ${usedCats.length ? `Covered: ${usedCats.join(', ')} — pick different.` : 'Any category.'} 1 turn = 1 new question, no follow-ups.`
  }
  return `Wrapping up. 1-2 closing sentences. No more questions.`
}

export const dataEngineeringDomain: DomainConfig = {
  roleType: 'data-engineering',
  categories: ['data-sql', 'data-nosql', 'data-pipeline', 'data-warehouse', 'data-streaming', 'data-batch'],
  sttTerms: ['ETL, ELT, Spark, Kafka, Airflow, dbt, Snowflake, BigQuery, Parquet, Delta Lake, CDC, Redshift, Hadoop, HDFS, data lineage, schema registry, Apache Flink, data catalog'],
  pickStrategy: 'single-domain',

  systemPrompt(state: SystemPromptState, locale: 'zh' | 'en'): string {
    const { plan, targetRole, usedCategories, questionPool } = state
    const usedCats = usedCategories ?? []
    const seniority = targetRole.split('-').pop() ?? 'mid'
    const guidance = locale === 'zh' ? (ROLE_GUIDANCE_ZH[seniority] ?? ROLE_GUIDANCE_ZH.mid) : (ROLE_GUIDANCE_EN[seniority] ?? ROLE_GUIDANCE_EN.mid)
    const phaseGuidance = locale === 'zh' ? buildPhaseGuidanceZh(plan, usedCats) : buildPhaseGuidanceEn(plan, usedCats)
    const poolSection = questionPool ? buildPool(questionPool, locale) : ''

    if (locale === 'zh') {
      return `[ROLE]\n你是一位有經驗的資料工程師 / Data Platform Lead，正在進行結構化模擬面試。評估 SQL 最佳化、Pipeline 設計、分散式運算框架使用能力、資料品質與可觀測性思維。\n\n[LANGUAGE]\n所有回答必須用繁體中文（zh-TW）。\n\n[本輪資訊]\nphase: ${plan.phase} | 進度: ${plan.progressCurrent}/${plan.progressTotalInPhase} | role: ${targetRole} | 已涵蓋: ${usedCats.join(', ') || '無'}\n\n${guidance}\n\n[本輪指引]\n${phaseGuidance}${poolSection}\n\n[BEHAVIOR RULES]\n1. 每輪只問一題新題，禁止追問\n2. 最多 1 句 acknowledge，不評論對錯\n3. 不知道 → 1 句帶過進下一題\n4. technical 4 題涵蓋 4 種不同類別\n5. 不透露參考答案\n6. 只討論資料工程面試相關主題\n\n[OUTPUT FORMAT]\n回傳 JSON：reply, pickedQuestionId (string|null), isGeneratedQuestion (bool)。`
    }
    return `[ROLE]\nYou are an experienced Data Engineer / Data Platform Lead conducting a structured mock interview. Evaluate SQL optimization, pipeline design, distributed processing frameworks, data quality, and observability.\n\n[LANGUAGE]\nAll responses in English.\n\n[THIS TURN]\nphase: ${plan.phase} | progress: ${plan.progressCurrent}/${plan.progressTotalInPhase} | role: ${targetRole} | covered: ${usedCats.join(', ') || 'none'}\n\n${guidance}\n\n[PHASE GUIDANCE]\n${phaseGuidance}${poolSection}\n\n[BEHAVIOR RULES]\n1. One new question per turn, no follow-ups\n2. 1-sentence ack, no evaluation\n3. "I don't know" → move on\n4. Technical: 4 questions, 4 categories\n5. Never reveal answers\n6. Data engineering topics only\n\n[OUTPUT FORMAT]\nReturn JSON: reply, pickedQuestionId (string|null), isGeneratedQuestion (bool).`
  },

  summaryPrompt(locale: 'zh' | 'en'): string {
    if (locale === 'zh') return `你剛結束一場資料工程師模擬面試。生成繁體中文建設性回饋報告。studyAreas 要具體（如「Kafka consumer group rebalancing」而非「資料串流」）。\n\n只回傳 JSON：{"overall":"","strengths":[],"improvements":[],"studyAreas":[],"perQuestion":[{"turnIndex":0,"question":"","keyPoints":[],"feedback":""}]}`
    return `You just finished a data engineering mock interview. Generate a constructive feedback report in English. studyAreas must be specific (e.g. "Kafka consumer group rebalancing" not "streaming").\n\nReturn ONLY JSON: {"overall":"","strengths":[],"improvements":[],"studyAreas":[],"perQuestion":[{"turnIndex":0,"question":"","keyPoints":[],"feedback":""}]}`
  },

  greeting: {
    zh: '你好，歡迎來到今天的資料工程師模擬面試。我是今天的面試官。我們開始吧——請先做一個簡短的自我介紹，說說你的工作經歷與主要使用的資料技術棧，大約一到兩分鐘。',
    en: "Hello, welcome to today's data engineering mock interview. I'm your interviewer. Let's begin — please give a brief self-introduction covering your experience and main data tech stack, about one to two minutes.",
  },
}
