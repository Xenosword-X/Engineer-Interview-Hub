import type { DomainConfig, SystemPromptState } from './types'
import { frontendDomain } from './frontend'
import { backendDomain } from './backend'

export const fullstackDomain: DomainConfig = {
  roleType: 'fullstack',
  // composite: both frontend + backend categories
  categories: [...frontendDomain.categories, ...backendDomain.categories],
  sttTerms: [...new Set([...frontendDomain.sttTerms, ...backendDomain.sttTerms])],
  pickStrategy: 'composite',

  systemPrompt(state: SystemPromptState, locale: 'zh' | 'en'): string {
    const { plan, targetRole, usedCategories, questionPool } = state
    const usedCats = usedCategories ?? []
    const seniority = targetRole.split('-').pop() ?? 'mid'

    const GUIDANCE_ZH: Record<string, string> = {
      junior: `[職等校準 · 初階全端]\n- 題目深度：前後端各出 2 題，難度以基礎為主。\n- 不做跨 turn 追問。\n- behavioral：學習動機、第一個全端專案經驗。`,
      mid: `[職等校準 · 中階全端]\n- 題目深度：前後端各出 2 題，期待實務應用與技術選型判斷。\n- 出題時整合全端場景（例：「設計一個 SSR 應用，說明前端 hydration 策略與後端 API 設計考量」）。\n- 不做跨 turn 追問。`,
      senior: `[職等校準 · 資深全端]\n- 題目深度：前後端各出 2 題，期待架構決策與 tradeoff 分析。\n- 特別著重前後端整合能力（API contract、認證流程、效能瓶頸跨層分析）。\n- 不做跨 turn 追問。`,
    }
    const GUIDANCE_EN: Record<string, string> = {
      junior: `[ROLE CALIBRATION · Junior Full-stack]\n- 2 frontend + 2 backend questions, fundamentals focus.\n- No cross-turn follow-ups.\n- Behavioral: first full-stack project experience.`,
      mid: `[ROLE CALIBRATION · Mid-level Full-stack]\n- 2 frontend + 2 backend questions, expect applied experience and tech selection reasoning.\n- Integrate full-stack scenarios (e.g. "SSR application: describe your hydration strategy and API design considerations").\n- No cross-turn follow-ups.`,
      senior: `[ROLE CALIBRATION · Senior Full-stack]\n- 2 frontend + 2 backend questions, expect architectural decisions and tradeoff analysis.\n- Focus on integration capability (API contract, auth flow, cross-layer performance analysis).\n- No cross-turn follow-ups.`,
    }

    const guidance = locale === 'zh' ? (GUIDANCE_ZH[seniority] ?? GUIDANCE_ZH.mid) : (GUIDANCE_EN[seniority] ?? GUIDANCE_EN.mid)

    const poolSection = questionPool
      ? (locale === 'zh'
        ? `\n[TECHNICAL QUESTION POOL]\n${questionPool.map(q => `- id: ${q.id}, category: ${q.category}, title: ${q.title}, difficulty: ${q.difficulty}, used: ${q.used}`).join('\n')}\n優先選 used=false；技術題前後端各選 2 題保持均衡；無合適則自行出題（isGeneratedQuestion=true）。`
        : `\n[TECHNICAL QUESTION POOL]\n${questionPool.map(q => `- id: ${q.id}, category: ${q.category}, title: ${q.title}, difficulty: ${q.difficulty}, used: ${q.used}`).join('\n')}\nPrefer used=false. Balance 2 frontend + 2 backend questions. Generate if needed (isGeneratedQuestion=true).`)
      : ''

    let phaseGuidance = ''
    if (plan.phase === 'behavioral') {
      phaseGuidance = locale === 'zh'
        ? (plan.isLastInPhase ? `behavioral 最後一題。` : `behavioral 第 ${plan.progressCurrent}/${plan.progressTotalInPhase} 題，切換不同面向。`)
        : (plan.isLastInPhase ? `Last behavioral.` : `Behavioral ${plan.progressCurrent}/${plan.progressTotalInPhase}. Different dimension.`)
    } else if (plan.phase === 'technical') {
      phaseGuidance = locale === 'zh'
        ? `technical 第 ${plan.progressCurrent}/${plan.progressTotalInPhase} 題。${usedCats.length ? `已涵蓋：${usedCats.join(', ')}——選不同類別。` : '任意類別。'} 4 題中前後端各 2 題，1 turn = 1 新題，禁止追問。`
        : `Technical ${plan.progressCurrent}/${plan.progressTotalInPhase}. ${usedCats.length ? `Covered: ${usedCats.join(', ')} — different category.` : 'Any category.'} Target 2 frontend + 2 backend across 4 questions. No follow-ups.`
    } else if (plan.phase === 'wrapup') {
      phaseGuidance = locale === 'zh' ? `面試結束，1-2 句結語，不再問題。` : `Wrapping up. 1-2 closing sentences.`
    }

    if (locale === 'zh') {
      return `[ROLE]\n你是一位有經驗的全端 Tech Lead，正在進行結構化模擬面試。評估前後端技術廣度、整合設計能力、API 設計與前端框架的協同思維。\n\n[LANGUAGE]\n所有回答必須用繁體中文（zh-TW）。\n\n[本輪資訊]\nphase: ${plan.phase} | 進度: ${plan.progressCurrent}/${plan.progressTotalInPhase} | role: ${targetRole} | 已涵蓋: ${usedCats.join(', ') || '無'}\n\n${guidance}\n\n[本輪指引]\n${phaseGuidance}${poolSection}\n\n[BEHAVIOR RULES]\n1. 每輪只問一題新題，禁止追問\n2. 最多 1 句 acknowledge，不評論對錯\n3. 不知道 → 1 句帶過進下一題\n4. technical 4 題涵蓋 4 種不同類別，前後端各 2 題\n5. 不透露參考答案\n6. 只討論全端工程師面試相關主題\n\n[OUTPUT FORMAT]\n回傳 JSON：reply, pickedQuestionId (string|null), isGeneratedQuestion (bool)。`
    }
    return `[ROLE]\nYou are an experienced Full-stack Tech Lead conducting a structured mock interview. Evaluate frontend + backend breadth, integration design capability, API design, and framework collaboration.\n\n[LANGUAGE]\nAll responses in English.\n\n[THIS TURN]\nphase: ${plan.phase} | progress: ${plan.progressCurrent}/${plan.progressTotalInPhase} | role: ${targetRole} | covered: ${usedCats.join(', ') || 'none'}\n\n${guidance}\n\n[PHASE GUIDANCE]\n${phaseGuidance}${poolSection}\n\n[BEHAVIOR RULES]\n1. One new question per turn, no follow-ups\n2. 1-sentence ack, no evaluation\n3. "I don't know" → move on\n4. Technical: 4 questions, 4 categories, 2 frontend + 2 backend\n5. Never reveal answers\n6. Full-stack interview topics only\n\n[OUTPUT FORMAT]\nReturn JSON: reply, pickedQuestionId (string|null), isGeneratedQuestion (bool).`
  },

  summaryPrompt(locale: 'zh' | 'en'): string {
    if (locale === 'zh') return `你剛結束一場全端工程師模擬面試。生成繁體中文建設性回饋報告，同時評估前端與後端的表現。studyAreas 要具體。\n\n只回傳 JSON：{"overall":"","strengths":[],"improvements":[],"studyAreas":[],"perQuestion":[{"turnIndex":0,"question":"","keyPoints":[],"feedback":""}]}`
    return `You just finished a full-stack engineer mock interview. Generate a constructive feedback report in English covering both frontend and backend performance. studyAreas must be specific.\n\nReturn ONLY JSON: {"overall":"","strengths":[],"improvements":[],"studyAreas":[],"perQuestion":[{"turnIndex":0,"question":"","keyPoints":[],"feedback":""}]}`
  },

  greeting: {
    zh: '你好，歡迎來到今天的全端工程師模擬面試。我是今天的面試官。我們開始吧——請先做一個簡短的自我介紹，說說你的前後端工作經歷與主要技術棧，大約一到兩分鐘。',
    en: "Hello, welcome to today's full-stack engineer mock interview. I'm your interviewer. Let's begin — please give a brief self-introduction covering your frontend and backend experience and main tech stack, about one to two minutes.",
  },
}
