<!-- components/bookmark/BookmarkCard.vue -->
<script setup lang="ts">
import type { QuestionMeta } from '~/composables/useQuestions'

defineProps<{ question: QuestionMeta }>()
const emit = defineEmits<{ remove: [slug: string] }>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="iv-bmc group">

    <!-- Remove button -->
    <button
      @click="emit('remove', question.slug)"
      class="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md
             text-[--color-text-muted] hover:text-red-500 hover:bg-red-50
             transition-colors opacity-0 group-hover:opacity-100
             focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
      :aria-label="t('bookmark.remove')"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Link -->
    <NuxtLink :to="localePath(`/questions/${question.slug}`)">
      <h3 class="iv-bmc-title">{{ question.title }}</h3>
      <div class="iv-bmc-tags">
        <TagBadge :category="question.category" />
        <DifficultyBadge :difficulty="question.difficulty" />
      </div>
    </NuxtLink>

  </div>
</template>

<style scoped>
.iv-bmc {
  position: relative;
  border: 1px solid var(--color-border, #e2e8f0);
  border-left: 3px solid var(--color-primary, #6366f1);
  border-radius: 12px;
  padding: 14px 16px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.18s ease;
}
.iv-bmc:hover {
  border-color: var(--color-border-hover, #a5b4fc);
  border-left-color: var(--color-primary, #6366f1);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.10);
  transform: translateY(-1px);
}
.iv-bmc-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary, #0f172a); /* ~16:1 on white ✅ */
  line-height: 1.45;
  margin-bottom: 8px;
  padding-right: 2rem;
  transition: color 0.15s;
}
.iv-bmc:hover .iv-bmc-title { color: var(--color-primary, #6366f1); }
.iv-bmc-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
