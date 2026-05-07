import test from 'node:test'
import assert from 'node:assert/strict'

import { getCategoriesForDomain, getCategoryLabel } from '../shared/question-domain-categories.mjs'

test('returns backend categories for backend domain', () => {
  assert.deepEqual(getCategoriesForDomain('backend'), [
    'api-design',
    'language',
    'database',
    'system-design',
    'security',
    'performance',
  ])
})

test('returns all categories when domain is all', () => {
  const categories = getCategoriesForDomain('all')
  assert.ok(categories.includes('javascript'))
  assert.ok(categories.includes('api-design'))
  assert.ok(categories.includes('sql-transformation'))
  assert.ok(categories.includes('containers-platform'))
})

test('returns translated label when translation exists', () => {
  const t = (key) => ({
    'categories.api-design': 'API 設計',
  }[key] ?? key)

  assert.equal(getCategoryLabel('api-design', t), 'API 設計')
})

test('falls back to raw key when translation is missing', () => {
  const t = (key) => key

  assert.equal(getCategoryLabel('unknown-category', t), 'unknown-category')
})
