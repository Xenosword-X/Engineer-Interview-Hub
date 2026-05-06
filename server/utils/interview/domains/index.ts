import type { RoleType } from './types'
import type { DomainConfig } from './types'
import { frontendDomain } from './frontend'
import { backendDomain } from './backend'
import { dataEngineeringDomain } from './data-engineering'
import { devopsDomain } from './devops'
import { fullstackDomain } from './fullstack'

const DOMAINS: Record<RoleType, DomainConfig> = {
  frontend: frontendDomain,
  backend: backendDomain,
  'data-engineering': dataEngineeringDomain,
  devops: devopsDomain,
  fullstack: fullstackDomain,
}

export function getDomain(roleType: RoleType): DomainConfig {
  return DOMAINS[roleType] ?? frontendDomain
}
