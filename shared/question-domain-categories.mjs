/** @type {Record<string, string[]>} */
export const DOMAIN_CATEGORIES = {
  frontend: ['javascript', 'vue', 'css', 'network-security', 'html', 'web-vitals', 'browser', 'behavioral'],
  backend: ['api-design', 'language', 'database', 'system-design', 'security', 'performance'],
  'data-engineering': ['sql-transformation', 'pipeline-orchestration', 'warehouse-modeling', 'batch-processing', 'stream-processing', 'data-quality-observability'],
  devops: ['containers-platform', 'infrastructure-as-code', 'delivery-automation', 'cloud-architecture', 'observability', 'reliability-sre'],
}

/**
 * @param {string} domain
 * @returns {string[]}
 */
export function getCategoriesForDomain(domain) {
  if (!domain || domain === 'all') {
    return Object.values(DOMAIN_CATEGORIES).flat()
  }
  return DOMAIN_CATEGORIES[domain] ?? DOMAIN_CATEGORIES.frontend
}

/**
 * @param {string} category
 * @param {(key: string) => string} t
 * @returns {string}
 */
export function getCategoryLabel(category, t) {
  const translated = t(`categories.${category}`)
  return translated === `categories.${category}` ? category : translated
}
