<!-- components/layout/AppDrawer.vue -->
<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const user   = useSupabaseUser()
const client = useSupabaseClient()

async function signOut() {
  await client.auth.signOut()
  emit('close')
  navigateTo(localePath('/'))
}
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/40 lg:hidden"
        @click="emit('close')"
        aria-hidden="true"
      />
    </Transition>

    <!-- Drawer panel -->
    <Transition name="slide-right">
      <div
        v-if="open"
        class="fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl lg:hidden flex flex-col"
        role="dialog"
        aria-label="Navigation menu"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 h-14 border-b border-[--color-border]">
          <span class="font-bold text-sm text-[--color-text-primary]">Engineer Interview Hub</span>
          <button
            @click="emit('close')"
            class="p-2 rounded-md text-[--color-text-secondary] hover:bg-slate-100 min-h-11 min-w-11 flex items-center justify-center"
            aria-label="Close menu"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- User info (logged in) -->
        <div v-if="user" class="px-5 py-4 border-b border-[--color-border] bg-slate-50">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center shrink-0">
              {{ user.email?.charAt(0).toUpperCase() }}
            </div>
            <p class="text-sm text-[--color-text-secondary] truncate">{{ user.email }}</p>
          </div>
        </div>

        <!-- Nav links -->
        <nav class="flex-1 px-4 py-4 flex flex-col gap-1">
          <NuxtLink
            :to="localePath('/questions')"
            @click="emit('close')"
            class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-[--color-text-secondary] hover:bg-slate-100 hover:text-[--color-text-primary]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            {{ t('nav.questions') }}
          </NuxtLink>

          <!-- AI Interview -->
          <NuxtLink
            :to="localePath('/interview')"
            @click="emit('close')"
            class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-[--color-text-secondary] hover:bg-slate-100 hover:text-[--color-text-primary]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            {{ t('nav.ai_interview') }}
          </NuxtLink>

          <!-- My Bookmarks (logged in only) -->
          <NuxtLink
            v-if="user"
            :to="localePath('/bookmarks')"
            @click="emit('close')"
            class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-[--color-text-secondary] hover:bg-slate-100 hover:text-[--color-text-primary]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            {{ t('auth.my_bookmarks') }}
          </NuxtLink>
        </nav>

        <!-- Footer: sign out or login -->
        <div class="px-4 pb-8" :style="{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }">
          <!-- Logged in: sign out button -->
          <button
            v-if="user"
            @click="signOut"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-600 border border-red-100 hover:bg-red-50 transition-colors min-h-11"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            {{ t('auth.sign_out') }}
          </button>
          <!-- Not logged in: login button -->
          <LoginButton v-else class="w-full justify-center" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.25s ease-out; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }
</style>
