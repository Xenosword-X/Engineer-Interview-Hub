<!-- components/interview/InterviewStage.vue -->
<script setup lang="ts">
import type { InterviewSummary } from '~/server/utils/interview/types'

const props = defineProps<{
  sessionId: string
  initialAiText: string
  initialAudioBase64: string
}>()

const emit = defineEmits<{ completed: [summary: InterviewSummary] }>()

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const sessionIdRef = toRef(props, 'sessionId')
const { state, turns, phase, progress, submitTurn, endInterview, abortInterview, initTurns } =
  useInterviewSession(sessionIdRef)
const { elapsedSec, start, stop, isSupported, MAX_DURATION_SEC } = useAudioRecorder()
const sessionElapsed = ref(0)

onMounted(() => {
  initTurns(props.initialAiText)
  const sessionTimer = setInterval(() => sessionElapsed.value++, 1000)
  onUnmounted(() => clearInterval(sessionTimer))
})

// Play greeting audio reactively — the parent [id].vue sets this in its own
// onMounted (after us), so we must watch for the value arriving rather than
// reading the prop once during our own onMounted.
watch(() => props.initialAudioBase64, (val) => {
  if (!val) return
  const audio = new Audio(`data:audio/mpeg;base64,${val}`)
  audio.play().catch(() => {})
})

const showEndConfirm = ref(false)
const isFinalizing = ref(false)
const endFailed = ref(false)

async function handleStartRecording() {
  if (!isSupported.value) return alert(t('interview.errors.no_mic'))
  state.value = 'recording'
  await start()
}

async function handleStopRecording() {
  const blob = await stop()
  state.value = 'idle'
  const result = await submitTurn(blob)
  if (result?.isFinal || result?.forceEnd) {
    await triggerEnd()
  }
}

function handleEndClick() {
  showEndConfirm.value = true
}

async function triggerEnd() {
  isFinalizing.value = true
  endFailed.value = false
  try {
    const s = await endInterview()
    if (s) {
      emit('completed', s)
      // Don't reset isFinalizing — parent will swap to InterviewSummary view; the
      // loading screen stays up until the swap completes, avoiding a flash back to
      // the recorder UI between summary arriving and view switching.
    } else {
      endFailed.value = true
    }
  } catch (e) {
    endFailed.value = true
  }
}

async function confirmEnd() {
  showEndConfirm.value = false
  // Manual cancel: don't generate a report, just mark the session aborted and bounce
  // back to the setup page. The natural-end path (isFinal in handleStopRecording)
  // still calls triggerEnd() and shows the summary as before.
  await abortInterview()
  router.push(localePath('/interview'))
}
</script>

<template>
  <div class="iv-stage">

    <!-- Error banner -->
    <div v-if="state === 'error'" class="iv-error-banner">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"/>
      </svg>
      <span>{{ t('interview.errors.session_error') }}</span>
      <NuxtLink :to="localePath('/interview')" class="iv-error-link">
        {{ t('interview.errors.back_to_setup') }}
      </NuxtLink>
    </div>

    <template v-else>
      <InterviewStatusBar
        :phase="phase"
        :progress="progress"
        :elapsed-sec="sessionElapsed"
        @end="handleEndClick"
      />

      <InterviewTranscript :turns="turns" />

      <div class="iv-recorder-wrap">
        <InterviewRecorder
          :state="state"
          :elapsed-sec="elapsedSec"
          :max-sec="MAX_DURATION_SEC"
          @start-recording="handleStartRecording"
          @stop-recording="handleStopRecording"
        />
      </div>
    </template>

    <!-- Finalizing overlay — covers transcript while server generates summary -->
    <div v-if="isFinalizing" class="iv-finalizing">
      <div class="iv-finalizing-card">
        <template v-if="endFailed">
          <span class="iv-finalizing-error-icon">✕</span>
          <h2 class="iv-finalizing-title">{{ t('interview.stage.finalizing_error_title') }}</h2>
          <p class="iv-finalizing-desc">{{ t('interview.stage.finalizing_error_desc') }}</p>
          <button class="iv-retry-btn" @click="triggerEnd">{{ t('interview.stage.finalizing_retry') }}</button>
        </template>
        <template v-else>
          <span class="iv-finalizing-spin" />
          <h2 class="iv-finalizing-title">{{ t('interview.stage.finalizing_title') }}</h2>
          <p class="iv-finalizing-desc">{{ t('interview.stage.finalizing_desc') }}</p>
        </template>
      </div>
    </div>

    <!-- End confirm dialog (rendered inline; z-index 9999 keeps it above everything) -->
    <div v-if="showEndConfirm" class="iv-overlay" @click.self="showEndConfirm = false">
      <div class="iv-dialog">
        <p class="iv-dialog-title">{{ t('interview.stage.end_confirm') }}</p>
        <div class="iv-dialog-actions">
          <button @click="confirmEnd" class="iv-dialog-btn iv-dialog-btn--danger">
            {{ t('interview.stage.confirm_end') }}
          </button>
          <button @click="showEndConfirm = false" class="iv-dialog-btn iv-dialog-btn--ghost">
            {{ t('interview.stage.cancel') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.iv-stage {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 3.5rem);
  background: var(--color-bg, #f8fafc);
}

.iv-error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
  font-size: 13px;
  color: #ef4444;
}

.iv-error-link {
  margin-left: auto;
  color: #ef4444;
  text-decoration: underline;
  font-size: 12px;
}

.iv-recorder-wrap {
  border-top: 1px solid var(--color-border, #e2e8f0);
  flex-shrink: 0;
}

.iv-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  backdrop-filter: blur(4px);
  animation: iv-fade-in 0.15s ease;
}

@keyframes iv-fade-in { from { opacity: 0; } to { opacity: 1; } }

.iv-dialog {
  background: #ffffff;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 16px;
  padding: 24px;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(15,23,42,0.15);
  animation: iv-slide-up 0.18s ease;
}

@keyframes iv-slide-up {
  from { transform: translateY(10px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

.iv-dialog-title {
  font-size: 14px;
  color: var(--color-text-primary, #0f172a);
  line-height: 1.6;
  margin-bottom: 18px;
}

.iv-dialog-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.iv-dialog-btn {
  width: 100%;
  padding: 11px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.iv-dialog-btn--danger {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
}
.iv-dialog-btn--danger:hover { background: #fee2e2; }

.iv-dialog-btn--ghost {
  background: var(--color-bg, #f8fafc);
  color: var(--color-text-muted, #64748b);
  border: 1px solid var(--color-border, #e2e8f0);
}
.iv-dialog-btn--ghost:hover { background: var(--color-border, #e2e8f0); }

/* Finalizing overlay — shown after wrap-up while server generates summary */
.iv-finalizing {
  position: fixed;
  inset: 0;
  background: rgba(248, 250, 252, 0.94);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;          /* below the dialog (9999) */
  padding: 16px;
  animation: iv-fade-in 0.2s ease;
}

.iv-finalizing-card {
  background: #ffffff;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 20px;
  padding: 36px 28px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04), 0 24px 60px rgba(99,102,241,0.10);
  animation: iv-slide-up 0.25s ease;
}

.iv-finalizing-spin {
  display: inline-block;
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border, #e2e8f0);
  border-top-color: var(--color-primary, #6366f1);
  border-radius: 50%;
  animation: iv-spin 0.85s linear infinite;
  margin-bottom: 18px;
}

.iv-finalizing-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.25rem;
  color: var(--color-text-primary, #0f172a);
  margin: 0 0 8px;
  line-height: 1.4;
}

.iv-finalizing-desc {
  font-size: 13px;
  color: var(--color-text-muted, #64748b);
  line-height: 1.6;
  margin: 0;
}

@keyframes iv-spin { to { transform: rotate(360deg); } }

.iv-finalizing-error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fef2f2;
  color: #ef4444;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 18px;
}

.iv-retry-btn {
  margin-top: 18px;
  width: 100%;
  padding: 11px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: var(--color-primary, #6366f1);
  color: #ffffff;
  border: none;
  transition: opacity 0.15s ease;
}
.iv-retry-btn:hover { opacity: 0.88; }
</style>
