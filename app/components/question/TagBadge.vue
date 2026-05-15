<!-- components/question/TagBadge.vue -->
<script setup lang="ts">
const props = defineProps<{ category: string }>()

const styleMap: Record<string, { cls: string; dot: string }> = {
  // Frontend
  javascript:         { cls: 'bg-amber-50  text-amber-800  border-amber-200',   dot: '#f59e0b' },
  vue:                { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: '#22c55e' },
  css:                { cls: 'bg-pink-50   text-pink-800   border-pink-200',    dot: '#ec4899' },
  typescript:         { cls: 'bg-blue-50   text-blue-800   border-blue-200',    dot: '#3b82f6' },
  html:               { cls: 'bg-orange-50 text-orange-800 border-orange-200',  dot: '#f97316' },
  'web-vitals':       { cls: 'bg-violet-50 text-violet-800 border-violet-200',  dot: '#8b5cf6' },
  browser:            { cls: 'bg-sky-50    text-sky-800    border-sky-200',     dot: '#0ea5e9' },
  'network-security': { cls: 'bg-blue-50   text-blue-800   border-blue-200',    dot: '#3b82f6' },
  behavioral:         { cls: 'bg-teal-50   text-teal-800   border-teal-200',    dot: '#14b8a6' },
  // Backend
  'api-design':       { cls: 'bg-indigo-50 text-indigo-800 border-indigo-200',  dot: '#6366f1' },
  language:           { cls: 'bg-violet-50 text-violet-800 border-violet-200',  dot: '#7c3aed' },
  database:           { cls: 'bg-blue-50   text-blue-800   border-blue-200',    dot: '#2563eb' },
  'system-design':    { cls: 'bg-cyan-50   text-cyan-800   border-cyan-200',    dot: '#0891b2' },
  security:           { cls: 'bg-red-50    text-red-800    border-red-200',     dot: '#dc2626' },
  performance:        { cls: 'bg-amber-50  text-amber-800  border-amber-200',   dot: '#d97706' },
  // Data Engineering
  'sql-transformation':         { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: '#059669' },
  'pipeline-orchestration':     { cls: 'bg-teal-50    text-teal-800    border-teal-200',    dot: '#0d9488' },
  'warehouse-modeling':         { cls: 'bg-green-50   text-green-800   border-green-200',   dot: '#16a34a' },
  'batch-processing':           { cls: 'bg-sky-50     text-sky-800     border-sky-200',     dot: '#0284c7' },
  'stream-processing':          { cls: 'bg-purple-50  text-purple-800  border-purple-200',  dot: '#9333ea' },
  'data-quality-observability': { cls: 'bg-yellow-50  text-yellow-800  border-yellow-200',  dot: '#ca8a04' },
  // DevOps
  'containers-platform':    { cls: 'bg-blue-50   text-blue-800   border-blue-200',   dot: '#2563eb' },
  'infrastructure-as-code': { cls: 'bg-violet-50 text-violet-800 border-violet-200', dot: '#7c3aed' },
  'delivery-automation':    { cls: 'bg-green-50  text-green-800  border-green-200',  dot: '#16a34a' },
  'cloud-architecture':     { cls: 'bg-cyan-50   text-cyan-800   border-cyan-200',   dot: '#0891b2' },
  observability:            { cls: 'bg-amber-50  text-amber-800  border-amber-200',  dot: '#f59e0b' },
  'reliability-sre':        { cls: 'bg-red-50    text-red-800    border-red-200',    dot: '#ef4444' },
}

const entry = computed(() =>
  styleMap[props.category] ?? { cls: 'bg-slate-50 text-slate-700 border-slate-200', dot: '#64748b' }
)
</script>

<template>
  <span :class="['iv-tag border', entry.cls]">
    <span class="iv-tag-dot" :style="{ background: entry.dot }" aria-hidden="true" />
    {{ $t(`categories.${category}`) }}
  </span>
</template>

<style scoped>
.iv-tag {
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
.iv-tag-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
