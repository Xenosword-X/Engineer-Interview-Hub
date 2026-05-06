<!-- components/question/CategoryCard.vue -->
<script setup lang="ts">
import type { Category } from '~/composables/useCategories'
const props = defineProps<{ category: Category }>()
const localePath = useLocalePath()

const iconBgMap: Record<string, string> = {
  // Frontend
  javascript:          'bg-amber-100   text-amber-700',
  vue:                 'bg-emerald-100 text-emerald-700',
  css:                 'bg-pink-100    text-pink-700',
  'network-security':  'bg-blue-100    text-blue-700',
  html:                'bg-orange-100  text-orange-700',
  'web-vitals':        'bg-violet-100  text-violet-700',
  browser:             'bg-sky-100     text-sky-700',
  behavioral:          'bg-teal-100    text-teal-700',
  // Backend
  'api-design':        'bg-indigo-100  text-indigo-700',
  language:            'bg-cyan-100    text-cyan-700',
  database:            'bg-rose-100    text-rose-700',
  'system-design':     'bg-purple-100  text-purple-700',
  security:            'bg-red-100     text-red-700',
  performance:         'bg-lime-100    text-lime-700',
  // Data Engineering
  sql:                 'bg-yellow-100  text-yellow-700',
  nosql:               'bg-fuchsia-100 text-fuchsia-700',
  pipeline:            'bg-green-100   text-green-700',
  warehouse:           'bg-amber-100   text-amber-800',
  streaming:           'bg-sky-100     text-sky-800',
  'batch-processing':  'bg-teal-100    text-teal-800',
  // DevOps
  containers:          'bg-blue-100    text-blue-700',
  kubernetes:          'bg-violet-100  text-violet-800',
  'ci-cd':             'bg-orange-100  text-orange-700',
  cloud:               'bg-indigo-100  text-indigo-800',
  monitoring:          'bg-emerald-100 text-emerald-800',
  infrastructure:      'bg-slate-100   text-slate-700',
}
const iconClass = computed(() => iconBgMap[props.category.key] ?? 'bg-slate-100 text-slate-600')
</script>

<template>
  <NuxtLink
    :to="`${localePath('/questions')}?tag=${category.key}`"
    :class="['iv-cat', `iv-cat--${category.key}`]"
  >
    <div :class="['iv-cat-icon', iconClass]">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" :d="category.icon" />
      </svg>
    </div>
    <p class="iv-cat-name">{{ $t(`categories.${category.key}`) }}</p>
    <p class="iv-cat-count">{{ $t('categories.count_label', { count: category.count }) }}</p>
  </NuxtLink>
</template>

<style scoped>
.iv-cat {
  display: block;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 14px;
  padding: 1rem;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  text-decoration: none;
  transition: all 0.2s ease;
}

/* Coloured top accent bar */
.iv-cat::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--cat-accent, #6366f1);
  border-radius: 14px 14px 0 0;
}

.iv-cat:hover {
  border-color: var(--color-border-hover, #a5b4fc);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12);
  transform: translateY(-2px);
}

.iv-cat:focus-visible {
  outline: 2px solid var(--color-primary, #6366f1);
  outline-offset: 2px;
}

/* Per-category accent colours */
/* Frontend */
.iv-cat--javascript         { --cat-accent: #f59e0b; }
.iv-cat--vue                { --cat-accent: #22c55e; }
.iv-cat--css                { --cat-accent: #ec4899; }
.iv-cat--network-security   { --cat-accent: #3b82f6; }
.iv-cat--html               { --cat-accent: #f97316; }
.iv-cat--web-vitals         { --cat-accent: #8b5cf6; }
.iv-cat--browser            { --cat-accent: #0ea5e9; }
.iv-cat--behavioral         { --cat-accent: #14b8a6; }
/* Backend */
.iv-cat--api-design         { --cat-accent: #6366f1; }
.iv-cat--language           { --cat-accent: #06b6d4; }
.iv-cat--database           { --cat-accent: #f43f5e; }
.iv-cat--system-design      { --cat-accent: #a855f7; }
.iv-cat--security           { --cat-accent: #ef4444; }
.iv-cat--performance        { --cat-accent: #84cc16; }
/* Data Engineering */
.iv-cat--sql                { --cat-accent: #eab308; }
.iv-cat--nosql              { --cat-accent: #d946ef; }
.iv-cat--pipeline           { --cat-accent: #22c55e; }
.iv-cat--warehouse          { --cat-accent: #f59e0b; }
.iv-cat--streaming          { --cat-accent: #0ea5e9; }
.iv-cat--batch-processing   { --cat-accent: #14b8a6; }
/* DevOps */
.iv-cat--containers         { --cat-accent: #3b82f6; }
.iv-cat--kubernetes         { --cat-accent: #7c3aed; }
.iv-cat--ci-cd              { --cat-accent: #f97316; }
.iv-cat--cloud              { --cat-accent: #6366f1; }
.iv-cat--monitoring         { --cat-accent: #10b981; }
.iv-cat--infrastructure     { --cat-accent: #64748b; }

.iv-cat-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.iv-cat-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary, #0f172a); /* ~16:1 on white ✅ */
  margin-bottom: 2px;
  line-height: 1.3;
}

.iv-cat-count {
  font-size: 11px;
  color: var(--color-text-muted, #64748b); /* 4.35:1 on white ✅ */
}
</style>
