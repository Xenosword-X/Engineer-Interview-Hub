import type { QuestionPoolItem } from '../types'
import type { UpcomingTurnPlan } from '../validateAiResponse'

export type RoleType = 'frontend' | 'backend' | 'data-engineering' | 'devops' | 'fullstack'
export type Seniority = 'junior' | 'mid' | 'senior'  // mid 保留向後相容

export interface SystemPromptState {
  plan: UpcomingTurnPlan
  targetRole: string
  targetCategories: string[]
  questionPool?: QuestionPoolItem[]
  usedCategories?: string[]
}

export interface DomainConfig {
  roleType: RoleType
  categories: string[]
  sttTerms: string[]
  pickStrategy: 'single-domain' | 'composite'
  systemPrompt: (state: SystemPromptState, locale: 'zh' | 'en') => string
  summaryPrompt: (locale: 'zh' | 'en') => string
  greeting: Record<'zh' | 'en', string>
}
