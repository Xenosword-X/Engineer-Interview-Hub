<!-- pages/auth/callback.vue -->
<script setup lang="ts">
// @nuxtjs/supabase processes the OAuth code automatically. Wait for the
// session AND user to be ready, then navigate to the saved redirect target.
//
// We deliberately use onMounted (client-only) plus a polling/timeout pattern
// instead of watchEffect because:
//   - watchEffect can fire on the SSR pass and access sessionStorage
//   - The Supabase plugin updates session synchronously but user (claims)
//     asynchronously, so a one-shot watch on user can race with the module's
//     `page:start` hook that re-fetches claims during navigation
//   - We must only consume sessionStorage once, after we are sure auth landed.
const user = useSupabaseUser()
const session = useSupabaseSession()
const localePath = useLocalePath()

definePageMeta({ layout: false })

onMounted(async () => {
  const deadline = Date.now() + 6000
  while (Date.now() < deadline) {
    if (session.value && user.value) break
    await new Promise(r => setTimeout(r, 80))
  }

  const raw = sessionStorage.getItem('auth_redirect') ?? ''
  sessionStorage.removeItem('auth_redirect')
  const safe = raw.startsWith('/') && !raw.startsWith('//')
  const dest = safe ? raw : localePath('/')

  await navigateTo(dest, { replace: true, external: false })
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[--color-bg]">
    <div class="flex flex-col items-center gap-4">
      <svg class="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <p class="text-sm text-[--color-text-muted]">正在登入...</p>
    </div>
  </div>
</template>
