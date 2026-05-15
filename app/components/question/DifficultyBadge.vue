<!-- components/question/DifficultyBadge.vue -->
<script setup lang="ts">
defineProps<{ difficulty: 'basic' | 'intermediate' | 'advanced' }>()

const styles = {
  basic:        { cls: 'bg-slate-50  text-slate-600  border-slate-200',   dot: '#94a3b8' },
  intermediate: { cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',  dot: '#6366f1' },
  advanced:     { cls: 'bg-violet-50 text-violet-800 border-violet-200',  dot: '#7c3aed' },
} as const
</script>

<template>
  <span :class="['iv-diff border', styles[difficulty].cls]">
    <span class="iv-diff-dot" :style="{ background: styles[difficulty].dot }" aria-hidden="true" />
    {{ $t(`difficulty.${difficulty}`) }}
  </span>
</template>

<style scoped>
.iv-diff {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  line-height: 1.4;
  white-space: nowrap;
}
.iv-diff-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
