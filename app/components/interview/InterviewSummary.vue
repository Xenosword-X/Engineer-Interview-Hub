<!-- components/interview/InterviewSummary.vue -->
<script setup lang="ts">
import type { InterviewSession, InterviewSummary } from '~/server/utils/interview/types'

const props = defineProps<{ summary: InterviewSummary; session: InterviewSession }>()
const { t } = useI18n()
const localePath = useLocalePath()

const expandedQuestions = ref<Set<number>>(new Set())

function toggleQuestion(idx: number) {
  const next = new Set(expandedQuestions.value)
  next.has(idx) ? next.delete(idx) : next.add(idx)
  expandedQuestions.value = next
}

function formatDate(iso: string) {
  const dateLocale = props.session.locale === 'zh' ? 'zh-TW' : 'en-US'
  return new Date(iso).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })
}

const roleLabel = computed(() => {
  const part = props.session.target_role.split('-')[1]
  return t(`interview.setup.role_${part}`)
})
</script>

<template>
  <div class="iv-sum-shell">
    <div class="iv-sum-inner">

      <!-- Header -->
      <div class="iv-sum-head">
        <span class="iv-sum-eyebrow">INTERVIEW REPORT</span>
        <h1 class="iv-sum-title">面試總評</h1>
        <div class="iv-sum-meta">
          <span>{{ formatDate(session.started_at) }}</span>
          <span class="iv-sum-meta-sep">·</span>
          <span>{{ roleLabel }}</span>
        </div>
      </div>

      <!-- Overall -->
      <div class="iv-sum-card iv-sum-card--primary">
        <p class="iv-sum-card-label">
          <span class="iv-sum-dot" style="background: var(--color-primary, #6366f1)" />
          {{ t('interview.summary.overall') }}
        </p>
        <p class="iv-sum-overall-text">{{ summary.overall }}</p>
      </div>

      <!-- Two-column: Strengths + Improvements -->
      <div class="iv-sum-two-col">
        <div class="iv-sum-card iv-sum-card--green">
          <p class="iv-sum-card-label">
            <span class="iv-sum-dot" style="background: #22c55e" />
            {{ t('interview.summary.strengths') }}
          </p>
          <ul class="iv-sum-list">
            <li v-for="(item, i) in summary.strengths" :key="i" class="iv-sum-list-item iv-sum-list-item--green">{{ item }}</li>
          </ul>
        </div>
        <div class="iv-sum-card iv-sum-card--amber">
          <p class="iv-sum-card-label">
            <span class="iv-sum-dot" style="background: #f59e0b" />
            {{ t('interview.summary.improvements') }}
          </p>
          <ul class="iv-sum-list">
            <li v-for="(item, i) in summary.improvements" :key="i" class="iv-sum-list-item iv-sum-list-item--amber">{{ item }}</li>
          </ul>
        </div>
      </div>

      <!-- Study Areas -->
      <div class="iv-sum-card">
        <p class="iv-sum-card-label">
          <span class="iv-sum-dot" style="background: #0ea5e9" />
          {{ t('interview.summary.study_areas') }}
        </p>
        <div class="iv-sum-tags">
          <span v-for="(item, i) in summary.studyAreas" :key="i" class="iv-sum-tag">{{ item }}</span>
        </div>
      </div>

      <!-- Per Question -->
      <div class="iv-sum-card">
        <p class="iv-sum-card-label iv-sum-card-label--mb">
          <span class="iv-sum-dot" style="background: var(--color-primary, #6366f1)" />
          {{ t('interview.summary.per_question') }}
        </p>
        <div class="iv-sum-accordion">
          <div v-for="(q, i) in summary.perQuestion" :key="i" class="iv-sum-acc-item">
            <button @click="toggleQuestion(i)" class="iv-sum-acc-trigger">
              <span class="iv-sum-acc-num">Q{{ i + 1 }}</span>
              <span class="iv-sum-acc-q">{{ q.question }}</span>
              <svg :class="['iv-sum-acc-chevron', expandedQuestions.has(i) && 'iv-sum-acc-chevron--open']"
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            <div v-if="expandedQuestions.has(i)" class="iv-sum-acc-body">
              <div v-if="q.keyPoints.length" class="iv-sum-acc-section">
                <p class="iv-sum-acc-sec-label">{{ t('interview.summary.key_points') }}</p>
                <ul class="iv-sum-acc-kp-list">
                  <li v-for="(pt, j) in q.keyPoints" :key="j">{{ pt }}</li>
                </ul>
              </div>
              <div class="iv-sum-acc-section">
                <p class="iv-sum-acc-sec-label">{{ t('interview.summary.feedback') }}</p>
                <p class="iv-sum-acc-feedback">{{ q.feedback }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="iv-sum-actions">
        <NuxtLink :to="localePath('/interview')" class="iv-sum-action-btn iv-sum-action-btn--primary">
          {{ t('interview.summary.back_to_setup') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/interview/history')" class="iv-sum-action-btn iv-sum-action-btn--ghost">
          {{ t('interview.summary.view_history') }}
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<style scoped>
.iv-sum-shell {
  min-height: calc(100vh - 3.5rem);
  background: var(--color-bg, #f8fafc);
  padding: 2rem 1rem 4rem;
}

.iv-sum-inner {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.iv-sum-head {
  text-align: center;
  padding: 1.25rem 0 0.5rem;
}

.iv-sum-eyebrow {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--color-primary, #6366f1);
  background: var(--color-primary-light, #eef2ff);
  border: 1px solid var(--color-primary-border, #c7d2fe);
  border-radius: 4px;
  padding: 2px 10px;
  margin-bottom: 10px;
}

.iv-sum-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.875rem;
  color: var(--color-text-primary, #0f172a);
  margin-bottom: 8px;
}

.iv-sum-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted, #64748b);
}
.iv-sum-meta-sep { color: var(--color-border, #e2e8f0); }

.iv-sum-card {
  background: #ffffff;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.iv-sum-card--primary { border-left: 3px solid var(--color-primary, #6366f1); }
.iv-sum-card--green   { border-left: 3px solid #22c55e; }
.iv-sum-card--amber   { border-left: 3px solid #f59e0b; }

.iv-sum-card-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-text-muted, #64748b);
  margin-bottom: 10px;
}
.iv-sum-card-label--mb { margin-bottom: 12px; }

.iv-sum-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.iv-sum-overall-text {
  font-size: 14px;
  color: var(--color-text-secondary, #374151);
  line-height: 1.75;
}

.iv-sum-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 520px) {
  .iv-sum-two-col { grid-template-columns: 1fr; }
}

.iv-sum-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.iv-sum-list-item {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary, #374151);
  padding-left: 14px;
  position: relative;
}
.iv-sum-list-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-border, #e2e8f0);
}
.iv-sum-list-item--green::before { background: #22c55e; }
.iv-sum-list-item--amber::before { background: #f59e0b; }

.iv-sum-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.iv-sum-tag {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  color: #0ea5e9;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
}

/* Accordion */
.iv-sum-accordion {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.iv-sum-acc-item {
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 10px;
  overflow: hidden;
}

.iv-sum-acc-trigger {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 14px;
  background: var(--color-bg, #f8fafc);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
  border: none;
  color: inherit;
}
.iv-sum-acc-trigger:hover { background: var(--color-primary-light, #eef2ff); }

.iv-sum-acc-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--color-primary, #6366f1);
  font-weight: 600;
  flex-shrink: 0;
  padding-top: 1px;
}

.iv-sum-acc-q {
  flex: 1;
  font-size: 13px;
  color: var(--color-text-primary, #0f172a);
  line-height: 1.5;
}

.iv-sum-acc-chevron {
  flex-shrink: 0;
  color: var(--color-text-muted, #64748b);
  transition: transform 0.2s ease;
  margin-top: 2px;
}
.iv-sum-acc-chevron--open { transform: rotate(180deg); }

.iv-sum-acc-body {
  padding: 12px 14px;
  border-top: 1px solid var(--color-border, #e2e8f0);
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.iv-sum-acc-section { display: flex; flex-direction: column; gap: 4px; }

.iv-sum-acc-sec-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--color-text-muted, #64748b);
}

.iv-sum-acc-kp-list {
  margin: 0;
  padding: 0 0 0 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.iv-sum-acc-kp-list li {
  font-size: 12px;
  color: var(--color-text-secondary, #374151);
  line-height: 1.5;
}

.iv-sum-acc-feedback {
  font-size: 12px;
  color: var(--color-text-secondary, #374151);
  line-height: 1.6;
}

/* Actions */
.iv-sum-actions {
  display: flex;
  gap: 10px;
  padding-top: 4px;
}

.iv-sum-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 11px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
}

.iv-sum-action-btn--primary {
  background: var(--color-primary, #6366f1);
  color: white;
  box-shadow: 0 2px 10px rgba(99,102,241,0.2);
}
.iv-sum-action-btn--primary:hover {
  background: #4f46e5;
  box-shadow: 0 4px 14px rgba(99,102,241,0.3);
}

.iv-sum-action-btn--ghost {
  background: #ffffff;
  color: var(--color-text-secondary, #374151);
  border: 1px solid var(--color-border, #e2e8f0);
}
.iv-sum-action-btn--ghost:hover {
  background: var(--color-bg, #f8fafc);
  border-color: var(--color-border-hover, #a5b4fc);
}
</style>
