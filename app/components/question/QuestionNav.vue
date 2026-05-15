<!-- components/question/QuestionNav.vue -->
<script setup lang="ts">
import type { QuestionMeta } from '~/composables/useQuestions'
defineProps<{
  prev: QuestionMeta | null
  next: QuestionMeta | null
}>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="flex gap-3 mt-8 pt-6 border-t border-[--color-border]">
    <NuxtLink
      v-if="prev"
      :to="localePath(`/questions/${prev.slug}`)"
      class="flex-1 border border-[--color-border] rounded-[9px] px-4 py-3 hover:border-[--color-border-hover] transition-colors focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:outline-none"
    >
      <p class="text-[10px] text-[--color-text-muted] mb-1">← {{ t('detail.prev') }}</p>
      <p class="text-sm font-medium text-[--color-text-primary] line-clamp-1">{{ prev.title }}</p>
    </NuxtLink>
    <div v-else class="flex-1" />

    <NuxtLink
      v-if="next"
      :to="localePath(`/questions/${next.slug}`)"
      class="flex-1 border border-[--color-border] rounded-[9px] px-4 py-3 text-right hover:border-[--color-border-hover] transition-colors focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:outline-none"
    >
      <p class="text-[10px] text-[--color-text-muted] mb-1">{{ t('detail.next') }} →</p>
      <p class="text-sm font-medium text-[--color-text-primary] line-clamp-1">{{ next.title }}</p>
    </NuxtLink>
    <div v-else class="flex-1" />
  </div>
</template>
