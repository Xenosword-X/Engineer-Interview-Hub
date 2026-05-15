<!-- components/question/QuestionCard.vue -->
<script setup lang="ts">
import type { QuestionMeta } from '~/composables/useQuestions'
defineProps<{ question: QuestionMeta }>()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    :to="localePath(`/questions/${question.slug}`)"
    class="iv-qcard"
  >
    <h3 class="iv-qcard-title">{{ question.title }}</h3>
    <div class="iv-qcard-tags">
      <TagBadge :category="question.category" />
      <DifficultyBadge :difficulty="question.difficulty" />
    </div>
  </NuxtLink>
</template>

<style scoped>
.iv-qcard {
  display: block;
  border: 1px solid var(--color-border, #e2e8f0);
  border-left: 3px solid var(--color-primary, #6366f1);
  border-radius: 12px;
  padding: 14px 16px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  text-decoration: none;
  transition: all 0.18s ease;
}

.iv-qcard:hover {
  border-color: var(--color-border-hover, #a5b4fc);
  border-left-color: var(--color-primary, #6366f1);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.10);
  transform: translateY(-1px);
}

.iv-qcard:focus-visible {
  outline: 2px solid var(--color-primary, #6366f1);
  outline-offset: 2px;
}

.iv-qcard-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary, #0f172a); /* ~16:1 on white ✅ */
  line-height: 1.45;
  margin-bottom: 8px;
  transition: color 0.15s;
}

.iv-qcard:hover .iv-qcard-title {
  color: var(--color-primary, #6366f1); /* 3.1:1 on white — large bold text ✅ */
}

.iv-qcard-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
