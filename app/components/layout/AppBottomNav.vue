<!-- components/layout/AppBottomNav.vue -->
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const user  = useSupabaseUser()
const client = useSupabaseClient()

async function handleProfile() {
  if (user.value) {
    navigateTo(localePath('/bookmarks'))
  } else {
    await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${localePath('/auth/callback')}` },
    })
  }
}

function isActive(path: string) {
  const resolved = localePath(path)
  if (path === '/') return route.path === resolved
  return route.path.startsWith(resolved)
}

const isProfileActive = computed(() =>
  route.path.startsWith(localePath('/bookmarks'))
)
</script>

<template>
  <nav
    class="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-sm border-t border-[--color-border] flex items-center justify-around"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(3.5rem + env(safe-area-inset-bottom))' }"
    aria-label="Bottom navigation"
  >
    <!-- Home -->
    <NuxtLink :to="localePath('/')" :class="['iv-bn-item', isActive('/') && 'iv-bn-item--active']" aria-label="Home">
      <span v-if="isActive('/')" class="iv-bn-bar" aria-hidden="true" />
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
      <span class="iv-bn-label">{{ t('bottom_nav.home') }}</span>
    </NuxtLink>

    <!-- Questions -->
    <NuxtLink :to="localePath('/questions')" :class="['iv-bn-item', isActive('/questions') && 'iv-bn-item--active']" aria-label="Questions">
      <span v-if="isActive('/questions')" class="iv-bn-bar" aria-hidden="true" />
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
      <span class="iv-bn-label">{{ t('bottom_nav.questions') }}</span>
    </NuxtLink>

    <!-- AI Interview -->
    <NuxtLink :to="localePath('/interview')" :class="['iv-bn-item', isActive('/interview') && 'iv-bn-item--active']" aria-label="AI Interview">
      <span v-if="isActive('/interview')" class="iv-bn-bar" aria-hidden="true" />
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
      <span class="iv-bn-label">{{ t('bottom_nav.ai') }}</span>
    </NuxtLink>

    <!-- Profile / Bookmarks -->
    <button
      @click="handleProfile"
      :class="['iv-bn-item', isProfileActive && 'iv-bn-item--active']"
      :aria-label="t('bottom_nav.profile')"
    >
      <span v-if="isProfileActive" class="iv-bn-bar" aria-hidden="true" />
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
      <span class="iv-bn-label">{{ t('bottom_nav.profile') }}</span>
    </button>
  </nav>
</template>

<style scoped>
.iv-bn-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 14px;
  min-width: 44px;
  min-height: 44px;
  justify-content: center;
  color: var(--color-text-muted, #64748b); /* 4.35:1 on white ✅ */
  text-decoration: none;
  position: relative;
  border: none;
  background: none;
  cursor: pointer;
  transition: color 0.15s;
}
.iv-bn-item--active {
  color: var(--color-primary, #6366f1);
}

/* Active indicator bar at top */
.iv-bn-bar {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 2px;
  border-radius: 0 0 3px 3px;
  background: var(--color-primary, #6366f1);
}

.iv-bn-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.2px;
}
</style>
