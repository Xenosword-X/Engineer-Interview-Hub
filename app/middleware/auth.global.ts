// middleware/auth.global.ts
// Default-deny guard for routes that require a logged-in Supabase user.
// Admin pages are exempt — they use their own session via server/middleware/admin-auth.ts.
const PRIVATE_PREFIXES = ['/bookmarks']

export default defineNuxtRouteMiddleware((to) => {
  // useSupabaseUser is null on the server pre-hydration; let the client decide.
  if (import.meta.server) return

  // Strip i18n locale prefix (strategy: 'prefix' → /zh/foo or /en/foo)
  const path = to.path.replace(/^\/(zh|en)(?=\/|$)/, '') || '/'

  // Interview pages handle logged-out state in-page, so they stay public here.
  const isPrivate = PRIVATE_PREFIXES.some(p => path === p || path.startsWith(p + '/'))
  if (!isPrivate) return

  if (!useSupabaseUser().value) {
    const localePath = useLocalePath()
    return navigateTo(localePath('/'))
  }
})
