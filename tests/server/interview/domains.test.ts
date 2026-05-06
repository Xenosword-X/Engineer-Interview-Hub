import { describe, it, expect } from 'vitest'
import { getDomain } from '~/server/utils/interview/domains/index'

describe('getDomain', () => {
  it('returns frontend domain for roleType frontend', () => {
    const d = getDomain('frontend')
    expect(d.roleType).toBe('frontend')
    expect(d.pickStrategy).toBe('single-domain')
    expect(d.categories.length).toBeGreaterThan(0)
    expect(d.sttTerms.length).toBeGreaterThan(0)
  })

  it('returns backend domain', () => {
    const d = getDomain('backend')
    expect(d.roleType).toBe('backend')
    expect(d.categories).toContain('backend-api')
  })

  it('returns data-engineering domain', () => {
    const d = getDomain('data-engineering')
    expect(d.roleType).toBe('data-engineering')
    expect(d.categories).toContain('data-sql')
  })

  it('returns devops domain', () => {
    const d = getDomain('devops')
    expect(d.roleType).toBe('devops')
    expect(d.categories).toContain('devops-k8s')
  })

  it('returns fullstack composite domain', () => {
    const d = getDomain('fullstack')
    expect(d.roleType).toBe('fullstack')
    expect(d.pickStrategy).toBe('composite')
    // should contain both frontend and backend categories
    expect(d.categories).toContain('javascript')
    expect(d.categories).toContain('backend-api')
  })

  it('all domains have greeting for zh and en', () => {
    for (const role of ['frontend', 'backend', 'data-engineering', 'devops', 'fullstack'] as const) {
      const d = getDomain(role)
      expect(typeof d.greeting.zh).toBe('string')
      expect(typeof d.greeting.en).toBe('string')
      expect(d.greeting.zh.length).toBeGreaterThan(10)
    }
  })

  it('all domains systemPrompt returns non-empty string', () => {
    const mockState = {
      plan: { phase: 'behavioral' as const, progressCurrent: 1, progressTotalInPhase: 3, isLastInPhase: false, isFinal: false },
      targetRole: 'backend-junior',
      targetCategories: ['backend-api'],
    }
    for (const role of ['frontend', 'backend', 'data-engineering', 'devops', 'fullstack'] as const) {
      const d = getDomain(role)
      const prompt = d.systemPrompt({ ...mockState, targetRole: `${role}-junior` }, 'zh')
      expect(prompt.length).toBeGreaterThan(100)
    }
  })
})
