// server/utils/interview/pickQuestionPool.ts
import type { QuestionPoolItem } from './types'

interface RawQuestion {
  id: string
  slug: string
  difficulty: string
  translations: Array<{ category: string; title: string }>
}

// Lower rank = better fit for the role. The AI sees questions sorted by this,
// so its top picks match the candidate's seniority by default.
const ROLE_DIFFICULTY_RANK: Record<string, Record<string, number>> = {
  // Frontend (existing + new seniority format)
  'frontend-junior':  { basic: 0, intermediate: 1, advanced: 3 },
  'frontend-mid':     { intermediate: 0, basic: 1, advanced: 1 },
  'frontend-senior':  { advanced: 0, intermediate: 1, basic: 3 },
  // Backend
  'backend-junior':   { basic: 0, intermediate: 1, advanced: 3 },
  'backend-senior':   { advanced: 0, intermediate: 1, basic: 3 },
  // Data Engineering
  'data-engineering-junior':  { basic: 0, intermediate: 1, advanced: 3 },
  'data-engineering-senior':  { advanced: 0, intermediate: 1, basic: 3 },
  // DevOps
  'devops-junior':    { basic: 0, intermediate: 1, advanced: 3 },
  'devops-senior':    { advanced: 0, intermediate: 1, basic: 3 },
  // Full-stack
  'fullstack-junior': { basic: 0, intermediate: 1, advanced: 3 },
  'fullstack-senior': { advanced: 0, intermediate: 1, basic: 3 },
}

function difficultyRank(role: string, difficulty: string): number {
  return ROLE_DIFFICULTY_RANK[role]?.[difficulty] ?? 2
}

/**
 * Build a category-diverse question pool for the upcoming technical turn.
 *
 * - Filters by `targetCategories` first (each question must belong to one of them).
 * - Drops categories already covered (`usedCategories`) so the AI can't keep
 *   piling on the same area.
 * - Within each category, prefers unused questions first, then ranks by difficulty
 *   fit for `targetRole` (junior → basic, senior → advanced).
 * - Round-robin samples across remaining categories so the AI's menu
 *   shows breadth, not 10 React questions in a row.
 */
export function pickQuestionPool(
  questions: RawQuestion[],
  targetCategories: string[],
  locale: 'zh' | 'en',
  usedQuestionIds: string[],
  usedCategories: string[] = [],
  targetRole: string = 'frontend-mid'
): QuestionPoolItem[] {
  const allowedCategories = new Set(
    targetCategories.filter(c => !usedCategories.includes(c))
  )

  const byCategory = new Map<string, QuestionPoolItem[]>()
  for (const q of questions) {
    const matched = q.translations.find(t => allowedCategories.has(t.category))
    if (!matched) continue
    const cat = matched.category
    const item: QuestionPoolItem = {
      id: q.id,
      title: matched.title || q.slug,
      difficulty: q.difficulty,
      category: cat,
      used: usedQuestionIds.includes(q.id),
    }
    const arr = byCategory.get(cat) ?? []
    arr.push(item)
    byCategory.set(cat, arr)
  }

  // Within each category: unused first, then role-appropriate difficulty first.
  for (const arr of byCategory.values()) {
    arr.sort((a, b) => {
      const usedDiff = Number(a.used) - Number(b.used)
      if (usedDiff !== 0) return usedDiff
      return difficultyRank(targetRole, a.difficulty) - difficultyRank(targetRole, b.difficulty)
    })
  }

  // Round-robin across categories: take 1 from each, then 2nd from each, etc.
  // Cap at 12 entries — enough variety without flooding the prompt.
  const result: QuestionPoolItem[] = []
  const cats = Array.from(byCategory.keys())
  let depth = 0
  while (result.length < 12) {
    let added = false
    for (const cat of cats) {
      const arr = byCategory.get(cat)!
      const item = arr[depth]
      if (item) {
        result.push(item)
        added = true
        if (result.length >= 12) break
      }
    }
    if (!added) break
    depth++
  }

  return result
}
