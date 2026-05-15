<!-- components/interview/InterviewStatusBar.vue -->
<script setup lang="ts">
import type { Phase } from '~/server/utils/interview/types'

defineProps<{
  phase: Phase
  progress: { current: number; totalInPhase: number; phaseLabel: string }
  elapsedSec: number
}>()

const emit = defineEmits<{ end: [] }>()
const { t } = useI18n()

const phases: Phase[] = ['intro', 'behavioral', 'technical', 'wrapup']

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function phaseIndex(p: Phase) {
  return phases.indexOf(p)
}
</script>

<template>
  <div class="iv-bar">
    <!-- Phase breadcrumb -->
    <div class="iv-phases">
      <template v-for="(ph, i) in phases" :key="ph">
        <div :class="['iv-phase-item', phaseIndex(phase) === i && 'iv-phase-item--active', phaseIndex(phase) > i && 'iv-phase-item--done']">
          <span class="iv-phase-dot" />
          <span class="iv-phase-name">{{ t(`interview.phase.${ph}`) }}</span>
        </div>
        <span v-if="i < phases.length - 1" class="iv-phase-sep" />
      </template>
    </div>

    <!-- Right: progress + timer + end -->
    <div class="iv-bar-right">
      <span class="iv-q-count">
        <span class="iv-q-num">{{ progress.current }}</span>
        <span class="iv-q-sep">/</span>
        <span class="iv-q-total">{{ progress.totalInPhase }}</span>
      </span>
      <span class="iv-timer">{{ formatTime(elapsedSec) }}</span>
      <button @click="emit('end')" class="iv-end-btn">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
        </svg>
        {{ t('interview.stage.end_btn') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.iv-bar {
  position: sticky;
  top: 3.5rem;
  z-index: 30;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border, #e2e8f0);
  padding: 0 1rem;
  height: 44px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.iv-phases {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.iv-phase-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--color-border, #e2e8f0);
  transition: color 0.2s;
}

.iv-phase-item--done { color: var(--color-text-muted, #64748b); }
.iv-phase-item--active { color: var(--color-primary, #6366f1); }

.iv-phase-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.iv-phase-name {
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 480px) {
  .iv-phase-item:not(.iv-phase-item--active) .iv-phase-name { display: none; }
}

.iv-phase-sep {
  width: 14px;
  height: 1px;
  background: var(--color-border, #e2e8f0);
  flex-shrink: 0;
  margin: 0 4px;
}

.iv-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.iv-q-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}
.iv-q-num { color: var(--color-text-primary, #0f172a); font-weight: 600; }
.iv-q-sep { color: var(--color-border, #e2e8f0); margin: 0 1px; }
.iv-q-total { color: var(--color-text-muted, #64748b); }

.iv-timer {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--color-text-muted, #64748b);
}

.iv-end-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.iv-end-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}
</style>
