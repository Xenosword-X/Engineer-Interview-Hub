import type { DomainConfig, SystemPromptState } from './types'
import type { QuestionPoolItem } from '../types'
import type { UpcomingTurnPlan } from '../validateAiResponse'

const ROLE_GUIDANCE_ZH: Record<string, string> = {
  junior: `[職等校準 · 初階後端]\n- 題目深度：RESTful API 基礎、SQL 基礎查詢、基本安全概念（SQL injection、HTTPS）。\n- 不做跨 turn 追問。\n- behavioral：學習動機、協作、面對陌生技術的處理方式。\n- 用詞：直白。`,
  mid: `[職等校準 · 中階後端]\n- 題目深度：API 設計原則、DB 索引與交易、快取策略、基本系統設計。\n- 出題時把實務應用直接寫進題目（例：「請解釋 DB 索引原理，並說明你在專案中如何選擇索引欄位」）。\n- 不做跨 turn 追問。\n- behavioral：具體專案挑戰、技術選型、API 設計決策。`,
  senior: `[職等校準 · 資深後端]\n- 題目深度：分散式系統設計、高可用性、CAP theorem 實際應用、效能瓶頸診斷。\n- 出題時組合多面向（例：「設計一個支援每秒 10,000 請求的訊息佇列，說明你的 tradeoff」）。\n- 不做跨 turn 追問：要更多深度就從 pool 挑更難的題。\n- behavioral：系統架構決策、技術債管理、跨團隊協作。`,
}

const ROLE_GUIDANCE_EN: Record<string, string> = {
  junior: `[ROLE CALIBRATION · Junior Backend]\n- Depth: RESTful API basics, basic SQL queries, fundamental security (SQL injection, HTTPS).\n- No cross-turn follow-ups.\n- Behavioral: learning motivation, collaboration, handling unfamiliar tech.\n- Tone: plain language.`,
  mid: `[ROLE CALIBRATION · Mid-level Backend]\n- Depth: API design principles, DB indexing and transactions, caching strategies, basic system design.\n- Bake applied experience into each question.\n- No cross-turn follow-ups.\n- Behavioral: concrete project challenges, tech selection, API design decisions.`,
  senior: `[ROLE CALIBRATION · Senior Backend]\n- Depth: distributed systems, high availability, CAP theorem in practice, performance bottleneck diagnosis.\n- Compose multi-faceted questions (e.g. "Design a message queue supporting 10k RPS and explain your tradeoffs").\n- No cross-turn follow-ups. For more depth, pick a harder pool question.\n- Behavioral: architecture decisions, tech debt management, cross-team influence.`,
}

function buildPool(pool: QuestionPoolItem[], lang: 'zh' | 'en'): string {
  if (!pool.length) return ''
  const lines = pool.map(q => `- id: ${q.id}, category: ${q.category}, title: ${q.title}, difficulty: ${q.difficulty}, used: ${q.used}`).join('\n')
  return lang === 'zh'
    ? `\n[TECHNICAL QUESTION POOL]\n${lines}\n出技術題時：優先選 used=false 的題；若無合適題目，自行出題（isGeneratedQuestion=true, pickedQuestionId=null）。`
    : `\n[TECHNICAL QUESTION POOL]\n${lines}\nPrefer used=false. If nothing fits, generate one (isGeneratedQuestion=true, pickedQuestionId=null).`
}

function buildPhaseGuidanceZh(plan: UpcomingTurnPlan, usedCats: string[]): string {
  if (plan.phase === 'behavioral') {
    return plan.isLastInPhase
      ? `這是 behavioral 的最後一題（第 ${plan.progressCurrent}/${plan.progressTotalInPhase} 題）。簡短回應後問最後一個 behavioral 問題。`
      : `這是 behavioral 第 ${plan.progressCurrent}/${plan.progressTotalInPhase} 題。切換不同面向，絕不重複已問過的主題。`
  }
  if (plan.phase === 'technical') {
    const usedLine = usedCats.length ? `已涵蓋類別：${usedCats.join(', ')}——本題請挑選不同類別。` : `技術階段第一題，可從任意類別挑題。`
    return `這是 technical 第 ${plan.progressCurrent}/${plan.progressTotalInPhase} 題。${usedLine}\n\n[1 turn = 1 新題] 不論候選人上題答得多淺，本 turn 必須問新題目、新類別。`
  }
  return `面試結束。回覆 1-2 句簡短結語，不需要再問任何問題。`
}

function buildPhaseGuidanceEn(plan: UpcomingTurnPlan, usedCats: string[]): string {
  if (plan.phase === 'behavioral') {
    return plan.isLastInPhase
      ? `Last behavioral question (${plan.progressCurrent}/${plan.progressTotalInPhase}).`
      : `Behavioral question ${plan.progressCurrent}/${plan.progressTotalInPhase}. Use a different dimension each turn.`
  }
  if (plan.phase === 'technical') {
    const usedLine = usedCats.length ? `Categories covered: ${usedCats.join(', ')} — pick a different one.` : `First technical question — any category is fine.`
    return `Technical question ${plan.progressCurrent}/${plan.progressTotalInPhase}. ${usedLine}\n\n[1 TURN = 1 NEW QUESTION] Never follow up on the previous question.`
  }
  return `Interview is wrapping up. 1-2 short closing sentences. No more questions.`
}

export const backendDomain: DomainConfig = {
  roleType: 'backend',
  categories: ['backend-api', 'backend-language', 'backend-database', 'backend-system-design', 'backend-security', 'backend-performance'],
  sttTerms: ['REST, GraphQL, gRPC, JWT, OAuth, Redis, PostgreSQL, microservices, ACID, CAP theorem, Node.js, Python, FastAPI, Spring Boot, message queue, load balancer, horizontal scaling'],
  pickStrategy: 'single-domain',

  systemPrompt(state: SystemPromptState, locale: 'zh' | 'en'): string {
    const { plan, targetRole, usedCategories, questionPool } = state
    const usedCats = usedCategories ?? []
    const seniority = targetRole.split('-').pop() ?? 'mid'
    const guidance = locale === 'zh' ? (ROLE_GUIDANCE_ZH[seniority] ?? ROLE_GUIDANCE_ZH.mid) : (ROLE_GUIDANCE_EN[seniority] ?? ROLE_GUIDANCE_EN.mid)
    const phaseGuidance = locale === 'zh' ? buildPhaseGuidanceZh(plan, usedCats) : buildPhaseGuidanceEn(plan, usedCats)
    const poolSection = questionPool ? buildPool(questionPool, locale) : ''

    if (locale === 'zh') {
      return `[ROLE]\n你是一位有經驗的後端 Tech Lead，正在進行結構化模擬面試。語氣：專業、不過度親切也不嚴苛。評估 API 設計能力、系統架構思維、資料庫設計、安全意識與效能最佳化思路。\n\n[LANGUAGE]\n所有回答必須用繁體中文（zh-TW）。\n\n[INTERVIEW STRUCTURE]\n- intro (1 輪) / behavioral (3 輪) / technical (4 輪) / wrapup (1 輪)\n\n[本輪資訊]\n- phase: ${plan.phase} | 進度: ${plan.progressCurrent}/${plan.progressTotalInPhase}\n- target_role: ${targetRole} | 已涵蓋類別: ${usedCats.join(', ') || '（無）'}\n\n${guidance}\n\n[本輪指引]\n${phaseGuidance}${poolSection}\n\n[BEHAVIOR RULES]\n1. 每輪只問一題新題，禁止追問上一 turn\n2. 簡短確認（最多 1 句），不評論對錯\n3. 候選人答「不知道」→ 1 句帶過，直接進下一題\n4. 不重複已涉及的主題\n5. technical 4 題涵蓋 4 種不同類別\n6. 不透露參考答案\n7. 只討論與後端工程師面試相關的主題\n\n[OUTPUT FORMAT]\n回傳 JSON：reply, pickedQuestionId (string|null), isGeneratedQuestion (bool)。`
    }
    return `[ROLE]\nYou are an experienced Backend Tech Lead conducting a structured mock interview. Evaluate API design, system architecture, database design, security, and performance.\n\n[LANGUAGE]\nAll responses MUST be in English.\n\n[INTERVIEW STRUCTURE]\nintro (1) / behavioral (3) / technical (4) / wrapup (1)\n\n[THIS TURN]\nphase: ${plan.phase} | progress: ${plan.progressCurrent}/${plan.progressTotalInPhase}\ntarget_role: ${targetRole} | covered: ${usedCats.join(', ') || 'none'}\n\n${guidance}\n\n[PHASE GUIDANCE]\n${phaseGuidance}${poolSection}\n\n[BEHAVIOR RULES]\n1. ONE new question per turn — never follow up on previous\n2. 1-sentence acknowledgement, no evaluation\n3. "I don't know" → 1 sentence, move on\n4. No repeated themes\n5. Technical: 4 questions, 4 distinct categories\n6. Never reveal answers\n7. Only backend interview topics\n\n[OUTPUT FORMAT]\nReturn JSON: reply, pickedQuestionId (string|null), isGeneratedQuestion (bool).`
  },

  summaryPrompt(locale: 'zh' | 'en'): string {
    if (locale === 'zh') {
      return `你剛結束一場後端工程師模擬面試。請根據完整 transcript 生成建設性回饋報告（繁體中文）。\n\n回饋準則：具體可執行、studyAreas 要具體（如「Redis 快取失效策略」而非「後端基礎」）。\n\n只回傳 JSON：\n{\n  "overall": "2-3 句",\n  "strengths": ["2-3 條"],\n  "improvements": ["3-5 條"],\n  "studyAreas": ["2-3 個"],\n  "perQuestion": [{"turnIndex": number, "question": "string", "keyPoints": ["string"], "feedback": "string"}]\n}`
    }
    return `You just finished a backend engineering mock interview. Generate a constructive feedback report in English.\n\nstudyAreas must be specific (e.g. "Redis cache invalidation strategies" not "backend basics").\n\nReturn ONLY JSON:\n{\n  "overall": "2-3 sentences",\n  "strengths": ["2-3 items"],\n  "improvements": ["3-5 items"],\n  "studyAreas": ["2-3 specific topics"],\n  "perQuestion": [{"turnIndex": number, "question": "string", "keyPoints": ["string"], "feedback": "string"}]\n}`
  },

  greeting: {
    zh: '你好，歡迎來到今天的後端工程師模擬面試。我是今天的面試官。那我們就開始吧——首先，請你做一個簡短的自我介紹，包含你的工作經歷與主要負責的後端技術棧，大約一到兩分鐘就好。',
    en: "Hello, welcome to today's backend engineer mock interview. I'm your interviewer. Let's get started — please give a brief self-introduction covering your experience and main backend tech stack, about one to two minutes.",
  },
}
