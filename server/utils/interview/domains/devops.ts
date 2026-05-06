import type { DomainConfig, SystemPromptState } from './types'
import type { QuestionPoolItem } from '../types'
import type { UpcomingTurnPlan } from '../validateAiResponse'

const ROLE_GUIDANCE_ZH: Record<string, string> = {
  junior: `[職等校準 · 初階 DevOps]\n- 題目深度：Docker 基礎操作、CI/CD 概念、基本 Linux 指令與腳本、版本控制工作流程。\n- 不做跨 turn 追問。\n- behavioral：學習動機、第一個部署或自動化的經驗。`,
  mid: `[職等校準 · 中階 DevOps]\n- 題目深度：Kubernetes 核心概念（Pod/Service/Deployment）、CI/CD pipeline 設計、基礎 Terraform、監控與 alerting 設定。\n- 出題時整合實務場景（例：「設計一個零停機部署策略，說明你會選 blue-green 還是 canary，以及原因」）。\n- 不做跨 turn 追問。`,
  senior: `[職等校準 · 資深 DevOps / SRE]\n- 題目深度：大規模 K8s 叢集管理、SLO/SLI/Error Budget 設計、多雲策略、Chaos Engineering、平台工程。\n- 出題時要求量化（例：「你設計的系統 SLA 是 99.9%，說明你的 Error Budget 策略及具體的 alerting 閾值設定」）。\n- 不做跨 turn 追問。`,
}

const ROLE_GUIDANCE_EN: Record<string, string> = {
  junior: `[ROLE CALIBRATION · Junior DevOps]\n- Depth: Docker basics, CI/CD concepts, basic Linux/scripting, version control workflows.\n- No cross-turn follow-ups.\n- Behavioral: learning motivation, first deployment or automation experience.`,
  mid: `[ROLE CALIBRATION · Mid-level DevOps]\n- Depth: Kubernetes core (Pod/Service/Deployment), CI/CD pipeline design, basic Terraform, monitoring & alerting.\n- Bake practical scenarios into questions (e.g. "zero-downtime deployment: blue-green vs canary and why").\n- No cross-turn follow-ups.`,
  senior: `[ROLE CALIBRATION · Senior DevOps/SRE]\n- Depth: large-scale K8s cluster management, SLO/SLI/Error Budget design, multi-cloud strategy, Chaos Engineering, platform engineering.\n- Require quantified answers (e.g. "99.9% SLA — describe your Error Budget policy and specific alerting thresholds").\n- No cross-turn follow-ups.`,
}

function buildPool(pool: QuestionPoolItem[], lang: 'zh' | 'en'): string {
  if (!pool.length) return ''
  const lines = pool.map(q => `- id: ${q.id}, category: ${q.category}, title: ${q.title}, difficulty: ${q.difficulty}, used: ${q.used}`).join('\n')
  return lang === 'zh'
    ? `\n[TECHNICAL QUESTION POOL]\n${lines}\n優先選 used=false；無合適則自行出題（isGeneratedQuestion=true, pickedQuestionId=null）。`
    : `\n[TECHNICAL QUESTION POOL]\n${lines}\nPrefer used=false. If nothing fits, generate (isGeneratedQuestion=true, pickedQuestionId=null).`
}

function buildPhaseGuidanceZh(plan: UpcomingTurnPlan, usedCats: string[]): string {
  if (plan.phase === 'behavioral') return plan.isLastInPhase ? `behavioral 最後一題（${plan.progressCurrent}/${plan.progressTotalInPhase}）。` : `behavioral 第 ${plan.progressCurrent}/${plan.progressTotalInPhase} 題，切換不同面向。`
  if (plan.phase === 'technical') return `technical 第 ${plan.progressCurrent}/${plan.progressTotalInPhase} 題。${usedCats.length ? `已涵蓋：${usedCats.join(', ')}——選不同類別。` : '任意類別。'} 1 turn = 1 新題，禁止追問。`
  return `面試結束，1-2 句結語，不再問題。`
}

function buildPhaseGuidanceEn(plan: UpcomingTurnPlan, usedCats: string[]): string {
  if (plan.phase === 'behavioral') return plan.isLastInPhase ? `Last behavioral (${plan.progressCurrent}/${plan.progressTotalInPhase}).` : `Behavioral ${plan.progressCurrent}/${plan.progressTotalInPhase}. Different dimension each turn.`
  if (plan.phase === 'technical') return `Technical ${plan.progressCurrent}/${plan.progressTotalInPhase}. ${usedCats.length ? `Covered: ${usedCats.join(', ')} — different category.` : 'Any category.'} 1 turn = 1 new question.`
  return `Wrapping up. 1-2 closing sentences.`
}

export const devopsDomain: DomainConfig = {
  roleType: 'devops',
  categories: ['devops-container', 'devops-k8s', 'devops-cicd', 'devops-cloud', 'devops-monitoring', 'devops-iac'],
  sttTerms: ['Docker, Kubernetes, Helm, Terraform, Ansible, Prometheus, Grafana, GitHub Actions, Jenkins, SLA, SLO, SLI, ELK Stack, AWS, GCP, Azure, blue-green deployment, canary release, Istio, ArgoCD'],
  pickStrategy: 'single-domain',

  systemPrompt(state: SystemPromptState, locale: 'zh' | 'en'): string {
    const { plan, targetRole, usedCategories, questionPool } = state
    const usedCats = usedCategories ?? []
    const seniority = targetRole.split('-').pop() ?? 'mid'
    const guidance = locale === 'zh' ? (ROLE_GUIDANCE_ZH[seniority] ?? ROLE_GUIDANCE_ZH.mid) : (ROLE_GUIDANCE_EN[seniority] ?? ROLE_GUIDANCE_EN.mid)
    const phaseGuidance = locale === 'zh' ? buildPhaseGuidanceZh(plan, usedCats) : buildPhaseGuidanceEn(plan, usedCats)
    const poolSection = questionPool ? buildPool(questionPool, locale) : ''

    if (locale === 'zh') {
      return `[ROLE]\n你是一位有經驗的 DevOps Engineer / SRE，正在進行結構化模擬面試。評估基礎建設設計、CI/CD 自動化、容器化與 K8s 操作、監控可觀測性、以及 reliability engineering 思維。\n\n[LANGUAGE]\n所有回答必須用繁體中文（zh-TW）。\n\n[本輪資訊]\nphase: ${plan.phase} | 進度: ${plan.progressCurrent}/${plan.progressTotalInPhase} | role: ${targetRole} | 已涵蓋: ${usedCats.join(', ') || '無'}\n\n${guidance}\n\n[本輪指引]\n${phaseGuidance}${poolSection}\n\n[BEHAVIOR RULES]\n1. 每輪只問一題新題，禁止追問\n2. 最多 1 句 acknowledge，不評論對錯\n3. 不知道 → 1 句帶過進下一題\n4. technical 4 題涵蓋 4 種不同類別\n5. 不透露參考答案\n6. 只討論 DevOps/SRE 面試相關主題\n\n[OUTPUT FORMAT]\n回傳 JSON：reply, pickedQuestionId (string|null), isGeneratedQuestion (bool)。`
    }
    return `[ROLE]\nYou are an experienced DevOps Engineer / SRE conducting a structured mock interview. Evaluate infrastructure design, CI/CD automation, containerization & K8s, monitoring & observability, and reliability engineering.\n\n[LANGUAGE]\nAll responses in English.\n\n[THIS TURN]\nphase: ${plan.phase} | progress: ${plan.progressCurrent}/${plan.progressTotalInPhase} | role: ${targetRole} | covered: ${usedCats.join(', ') || 'none'}\n\n${guidance}\n\n[PHASE GUIDANCE]\n${phaseGuidance}${poolSection}\n\n[BEHAVIOR RULES]\n1. One new question per turn, no follow-ups\n2. 1-sentence ack, no evaluation\n3. "I don't know" → move on\n4. Technical: 4 questions, 4 categories\n5. Never reveal answers\n6. DevOps/SRE topics only\n\n[OUTPUT FORMAT]\nReturn JSON: reply, pickedQuestionId (string|null), isGeneratedQuestion (bool).`
  },

  summaryPrompt(locale: 'zh' | 'en'): string {
    if (locale === 'zh') return `你剛結束一場 DevOps/SRE 模擬面試。生成繁體中文建設性回饋報告。studyAreas 要具體（如「Kubernetes HPA 自動擴展策略」而非「K8s 基礎」）。\n\n只回傳 JSON：{"overall":"","strengths":[],"improvements":[],"studyAreas":[],"perQuestion":[{"turnIndex":0,"question":"","keyPoints":[],"feedback":""}]}`
    return `You just finished a DevOps/SRE mock interview. Generate a constructive feedback report in English. studyAreas must be specific.\n\nReturn ONLY JSON: {"overall":"","strengths":[],"improvements":[],"studyAreas":[],"perQuestion":[{"turnIndex":0,"question":"","keyPoints":[],"feedback":""}]}`
  },

  greeting: {
    zh: '你好，歡迎來到今天的 DevOps 工程師模擬面試。我是今天的面試官。我們開始吧——請先做一個簡短的自我介紹，說說你的工作經歷與主要使用的 DevOps 技術棧，大約一到兩分鐘。',
    en: "Hello, welcome to today's DevOps engineer mock interview. I'm your interviewer. Let's begin — please give a brief self-introduction covering your experience and main DevOps tech stack, about one to two minutes.",
  },
}
