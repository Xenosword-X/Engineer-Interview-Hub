<!-- components/auth/UserMenu.vue -->
<script setup lang="ts">
const { t } = useI18n()
const client = useSupabaseClient()
const user   = useSupabaseUser()
const localePath = useLocalePath()
const route  = useRoute()

const isOpen  = ref(false)
const menuRef = ref<HTMLElement | null>(null)

// First letter of email, uppercased
const initials = computed(() => {
  const email = user.value?.email ?? ''
  return email.charAt(0).toUpperCase()
})

// Close dropdown when clicking outside
function onClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}
onMounted(()  => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

async function signOut() {
  await client.auth.signOut()
  isOpen.value = false
  // If on bookmarks page, redirect to home
  if (route.path.includes('/bookmarks')) {
    navigateTo(localePath('/'))
  }
}
</script>

<template>
  <div ref="menuRef" class="relative">
    <!-- Avatar button -->
    <button
      @click="isOpen = !isOpen"
      class="w-8 h-8 rounded-full bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center hover:bg-indigo-600 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
      :aria-label="user?.email ?? 'User menu'"
      :aria-expanded="isOpen"
    >
      {{ initials }}
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-10 w-52 bg-white border border-[--color-border] rounded-xl shadow-lg shadow-slate-200/60 py-1 z-50"
        role="menu"
      >
        <!-- Email -->
        <div class="px-4 py-2.5 border-b border-[--color-border]">
          <p class="text-xs text-[--color-text-muted] truncate">{{ user?.email }}</p>
        </div>

        <!-- My Bookmarks -->
        <NuxtLink
          :to="localePath('/bookmarks')"
          @click="isOpen = false"
          class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[--color-text-secondary] hover:bg-slate-50 hover:text-[--color-text-primary] transition-colors"
          role="menuitem"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          {{ t('auth.my_bookmarks') }}
        </NuxtLink>

        <div class="border-t border-[--color-border] my-1" />

        <!-- Sign out -->
        <button
          @click="signOut"
          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[--color-text-secondary] hover:bg-slate-50 hover:text-red-600 transition-colors"
          role="menuitem"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          {{ t('auth.sign_out') }}
        </button>
      </div>
    </Transition>
  </div>
</template>
