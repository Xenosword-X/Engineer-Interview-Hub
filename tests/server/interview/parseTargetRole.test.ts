import { describe, it, expect } from 'vitest'
import { parseTargetRole } from '~/server/utils/interview/parseTargetRole'

describe('parseTargetRole', () => {
  it('parses frontend-junior', () => {
    expect(parseTargetRole('frontend-junior')).toEqual({ roleType: 'frontend', seniority: 'junior' })
  })

  it('parses data-engineering-senior', () => {
    expect(parseTargetRole('data-engineering-senior')).toEqual({ roleType: 'data-engineering', seniority: 'senior' })
  })

  it('parses fullstack-junior', () => {
    expect(parseTargetRole('fullstack-junior')).toEqual({ roleType: 'fullstack', seniority: 'junior' })
  })

  it('parses legacy frontend-mid for backward compat', () => {
    expect(parseTargetRole('frontend-mid')).toEqual({ roleType: 'frontend', seniority: 'mid' })
  })

  it('parses devops-senior', () => {
    expect(parseTargetRole('devops-senior')).toEqual({ roleType: 'devops', seniority: 'senior' })
  })
})
