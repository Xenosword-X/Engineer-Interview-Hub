<!-- pages/bookmarks/index.vue -->
<script setup lang="ts">
import type { QuestionMeta } from '~/composables/useQuestions'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { toggleBookmark } = useBookmarks()
const siteUrl = useSiteUrl()

const { data: bookmarkSlugs, refresh, pending } = await useAsyncData(
  'my-bookmarks',
  () => $fetch<string[]>('/api/bookmarks'),
  { server: false, getCachedData: () => null }
)

const { data: allQuestions } = await useAsyncData(
  `questions-${locale.value}`,
  () => $fetch<QuestionMeta[]>('/api/questions', { query: { locale: locale.value } })
)

const bookmarkedQuestions = computed(() =>
  (bookmarkSlugs.value ?? [])
    .map(slug => allQuestions.value?.find(q => q.slug === slug))
    .filter((q): q is NonNullable<typeof q> => q != null)
)

async function handleRemove(slug: string) {
  bookmarkSlugs.value = bookmarkSlugs.value?.filter(s => s !== slug) ?? []
  try {
    await toggleBookmark(slug)
  } catch {
    await refresh()
    alert(t('bookmark.remove_failed'))
  }
}

useSeoMeta({
  title: `${t('bookmark.page_title')} | Engineer Interview Hub`,
  ogUrl: `${siteUrl}/${locale.value}/bookmarks`,
})
useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/${locale.value}/bookmarks` }],
})
</script>

<template>
  <div class="flex flex-col min-h-full">

    <!-- Page header -->
    <header class="px-4 lg:px-8 pt-6 pb-5 border-b border-[--color-border] bg-white">
      <p class="iv-bm-eyebrow">MY LIBRARY</p>
      <div class="flex items-baseline gap-3 mt-1.5">
        <h1 class="iv-bm-title">{{ t('bookmark.page_title') }}</h1>
        <span v-if="!pending" class="iv-bm-count">{{ bookmarkedQuestions.length }}</span>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 px-4 lg:px-8 py-5 max-w-2xl">

      <!-- Loading -->
      <div v-if="pending" class="grid gap-3">
        <AppSkeletonCard v-for="n in 4" :key="n" />
      </div>

      <!-- Empty -->
      <div v-else-if="bookmarkedQuestions.length === 0" class="flex flex-col items-center py-16 text-center">
        <svg class="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
        <p class="text-lg font-semibold text-[--color-text-primary] mb-2">{{ t('bookmark.empty_title') }}</p>
        <p class="text-sm text-[--color-text-muted] mb-6">{{ t('bookmark.empty_desc') }}</p>
        <AppButton :href="localePath('/questions')" variant="secondary">
          {{ t('bookmark.browse') }}
        </AppButton>
      </div>

      <!-- List -->
      <div v-else class="grid gap-3">
        <BookmarkCard
          v-for="q in bookmarkedQuestions"
          :key="q.slug"
          :question="q"
          @remove="handleRemove"
        />
      </div>

    </div>
  </div>
</template>

<style scoped>
.iv-bm-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-primary, #6366f1);
}

.iv-bm-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.375rem;
  color: var(--color-text-primary, #0f172a);
  line-height: 1.3;
}

.iv-bm-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted, #64748b);
  background: var(--color-bg, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  padding: 2px 10px;
  border-radius: 100px;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
