import type { RoleType, Seniority } from './domains/types'

export function parseTargetRole(raw: string): { roleType: RoleType; seniority: Seniority } {
  // Use lastIndexOf to handle 'data-engineering-junior' correctly
  const lastDash = raw.lastIndexOf('-')
  if (lastDash === -1) return { roleType: raw as RoleType, seniority: 'mid' }
  return {
    roleType: raw.slice(0, lastDash) as RoleType,
    seniority: raw.slice(lastDash + 1) as Seniority,
  }
}
