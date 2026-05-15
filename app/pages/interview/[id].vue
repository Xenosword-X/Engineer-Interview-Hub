<!-- pages/interview/[id].vue -->
<script setup lang="ts">
import type { InterviewSession, InterviewSummary, InterviewTurn } from '@@/server/utils/interview/types'

definePageMeta({ layout: 'home' })

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const sessionId = route.params.id as string

const user = useSupabaseUser()

const { data, pending, error } = await useFetch<{
  session: InterviewSession
  turns: InterviewTurn[]
  summary: InterviewSummary | null
}>(`/api/interview/${sessionId}`, { immediate: !!user.value })

const localSummary = ref<InterviewSummary | null>(null)

const view = computed(() => {
  if (!data.value) return 'loading'
  // localSummary is set after end API succeeds; data.value.session.status is the SSR
  // snapshot and never refetches, so we must check local state too — otherwise the
  // page stays stuck on InterviewStage even after the user confirmed end.
  if (localSummary.value) return 'summary'
  const s = data.value.session
  if (s.status === 'completed') return 'summary'
  if (s.status === 'error') return 'error'
  if (s.status === 'aborted') return 'aborted'
  return 'active'
})

const initialAiText = computed(() => data.value?.turns?.[0]?.content ?? '')
const initialAudioBase64 = ref('')

onMounted(() => {
  const stored = sessionStorage.getItem(`interview_init_${sessionId}`)
  if (stored) {
    const { aiAudioBase64 } = JSON.parse(stored)
    initialAudioBase64.value = aiAudioBase64
    sessionStorage.removeItem(`interview_init_${sessionId}`)
  }
})

function handleCompleted(s: InterviewSummary) {
  localSummary.value = s
}

const displaySummary = computed(() => localSummary.value ?? data.value?.summary ?? null)
</script>

<template>
  <div>
    <!-- Not logged in -->
    <div v-if="!user" class="iv-id-shell">
      <div class="iv-id-card">
        <span class="iv-id-eyebrow">AI POWERED</span>
        <h1 class="iv-id-title">{{ t('interview.setup.title') }}</h1>
        <p class="iv-id-desc">{{ t('auth.login_required') }}</p>
        <ClientOnly>
          <LoginButton />
        </ClientOnly>
      </div>
    </div>

    <!-- Loading -->
    <div v-else-if="pending" class="iv-id-loading">
      <span class="iv-id-spin" />
      <span>{{ t('interview.loading') }}</span>
    </div>

    <!-- Error / not found -->
    <div v-else-if="error || !data" class="iv-id-shell">
      <div class="iv-id-card">
        <p class="iv-id-err-text">{{ t('interview.errors.not_found') }}</p>
        <NuxtLink :to="localePath('/interview')" class="iv-id-back-link">
          {{ t('interview.errors.back_to_setup') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Active interview — lazy loaded (only shown after session starts) -->
    <LazyInterviewStage
      v-else-if="view === 'active'"
      :session-id="sessionId"
      :initial-ai-text="initialAiText"
      :initial-audio-base64="initialAudioBase64"
      @completed="handleCompleted"
    />

    <!-- Summary — lazy loaded (only shown after interview completes) -->
    <LazyInterviewSummary
      v-else-if="view === 'summary' || localSummary !== null"
      :summary="displaySummary!"
      :session="data!.session"
    />

    <!-- Aborted / error — lazy loaded (only shown on abort/error) -->
    <LazyInterviewAborted
      v-else-if="view === 'aborted' || view === 'error'"
      :status="data!.session.status"
    />
  </div>
</template>

<style scoped>
.iv-id-shell {
  min-height: calc(100vh - 3.5rem);
  background: var(--color-bg, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.iv-id-card {
  max-width: 380px;
  width: 100%;
  background: #ffffff;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(99,102,241,0.07);
}

.iv-id-eyebrow {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--color-primary, #6366f1);
  background: var(--color-primary-light, #eef2ff);
  border: 1px solid var(--color-primary-border, #c7d2fe);
  border-radius: 4px;
  padding: 2px 10px;
  margin-bottom: 14px;
}

.iv-id-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.5rem;
  color: var(--color-text-primary, #0f172a);
  margin-bottom: 10px;
}

.iv-id-desc {
  font-size: 13px;
  color: var(--color-text-muted, #64748b);
  margin-bottom: 24px;
}

.iv-id-err-text {
  font-size: 14px;
  color: #ef4444;
  margin-bottom: 16px;
}

.iv-id-back-link {
  font-size: 13px;
  color: var(--color-primary, #6366f1);
  text-decoration: underline;
}

.iv-id-loading {
  min-height: calc(100vh - 3.5rem);
  background: var(--color-bg, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 13px;
  color: var(--color-text-muted, #64748b);
}

.iv-id-spin {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border, #e2e8f0);
  border-top-color: var(--color-primary, #6366f1);
  border-radius: 50%;
  animation: iv-spin 0.7s linear infinite;
}

@keyframes iv-spin { to { transform: rotate(360deg); } }
</style>
