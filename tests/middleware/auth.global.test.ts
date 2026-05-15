import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const navigateToMock = vi.fn((target: string) => target)
const userRef = ref<null | { id: string }>(null)
const localePathMock = vi.fn((path: string) => `/en${path === '/' ? '' : path}`)

let authMiddleware: (to: { path: string }) => unknown

beforeAll(async () => {
  Object.assign(globalThis, {
    defineNuxtRouteMiddleware: (middleware: (to: { path: string }) => unknown) => middleware,
    navigateTo: navigateToMock,
    useLocalePath: () => localePathMock,
    useSupabaseUser: () => userRef,
  })

  authMiddleware = (await import('../../app/middleware/auth.global')).default
})

describe('auth.global middleware', () => {
  beforeEach(() => {
    userRef.value = null
    navigateToMock.mockClear()
    localePathMock.mockClear()
  })

  it('allows guests to enter the interview setup page', () => {
    const result = authMiddleware({ path: '/en/interview' })

    expect(result).toBeUndefined()
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('allows guests to enter interview history page', () => {
    const result = authMiddleware({ path: '/zh/interview/history' })

    expect(result).toBeUndefined()
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('redirects guests away from bookmarks', () => {
    const result = authMiddleware({ path: '/en/bookmarks' })

    expect(localePathMock).toHaveBeenCalledWith('/')
    expect(navigateToMock).toHaveBeenCalledWith('/en')
    expect(result).toBe('/en')
  })
})
