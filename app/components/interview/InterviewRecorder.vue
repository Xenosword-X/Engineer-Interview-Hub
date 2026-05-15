<!-- components/interview/InterviewRecorder.vue -->
<script setup lang="ts">
type RecorderState = 'idle' | 'recording' | 'uploading' | 'ai_thinking' | 'ai_speaking' | 'error'

const props = defineProps<{ state: RecorderState; elapsedSec: number; maxSec: number }>()
const emit = defineEmits<{ startRecording: []; stopRecording: [] }>()
const { t } = useI18n()

const canRecord = computed(() => props.state === 'idle')
const isRecording = computed(() => props.state === 'recording')
const isBusy = computed(() => ['uploading', 'ai_thinking', 'ai_speaking'].includes(props.state))

let clickGuard = false

function handleClick() {
  if (clickGuard) return
  if (isRecording.value) {
    emit('stopRecording')
  } else if (canRecord.value) {
    clickGuard = true
    emit('startRecording')
    setTimeout(() => { clickGuard = false }, 500)
  }
}

function formatDuration(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

const statusText = computed(() => {
  if (props.state === 'idle') return t('interview.stage.status_idle')
  if (props.state === 'recording') return t('interview.stage.status_recording')
  if (props.state === 'uploading') return t('interview.stage.status_uploading')
  if (props.state === 'ai_thinking') return t('interview.stage.status_thinking')
  if (props.state === 'ai_speaking') return t('interview.stage.status_speaking')
  if (props.state === 'error') return t('interview.stage.status_error')
  return ''
})
</script>

<template>
  <div class="iv-recorder">

    <!-- Status label -->
    <p :class="['iv-status-text', state === 'recording' && 'iv-status--rec', state === 'error' && 'iv-status--err', (state === 'ai_thinking' || state === 'ai_speaking') && 'iv-status--ai']">
      {{ statusText }}
    </p>

    <!-- Button + rings -->
    <div class="iv-btn-wrap">
      <span v-if="isRecording" class="iv-ring iv-ring-1" />
      <span v-if="isRecording" class="iv-ring iv-ring-2" />

      <button
        @click="handleClick"
        :disabled="isBusy || state === 'error'"
        :class="['iv-mic-btn', isRecording && 'iv-mic-btn--rec', isBusy && 'iv-mic-btn--busy', state === 'ai_speaking' && 'iv-mic-btn--speak']"
        :aria-label="isRecording ? t('interview.stage.stop_btn') : t('interview.stage.start_btn')"
      >
        <!-- Stop (recording) -->
        <svg v-if="isRecording" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="5" y="5" width="14" height="14" rx="2"/>
        </svg>
        <!-- Mic (idle) -->
        <svg v-else-if="canRecord" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/>
          <path d="M19 11a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V22h2v-2.06A9 9 0 0 0 21 11h-2z"/>
        </svg>
        <!-- Waveform (ai_speaking) -->
        <svg v-else-if="state === 'ai_speaking'" width="26" height="18" viewBox="0 0 28 20" fill="currentColor">
          <rect x="0" y="6" width="3" height="8" rx="1.5" class="iv-wave-bar iv-wave-bar-1"/>
          <rect x="5" y="2" width="3" height="16" rx="1.5" class="iv-wave-bar iv-wave-bar-2"/>
          <rect x="10" y="0" width="3" height="20" rx="1.5" class="iv-wave-bar iv-wave-bar-3"/>
          <rect x="15" y="4" width="3" height="12" rx="1.5" class="iv-wave-bar iv-wave-bar-4"/>
          <rect x="20" y="7" width="3" height="6" rx="1.5" class="iv-wave-bar iv-wave-bar-5"/>
          <rect x="25" y="9" width="3" height="2" rx="1" class="iv-wave-bar iv-wave-bar-6"/>
        </svg>
        <!-- Spinner (uploading/thinking) -->
        <span v-else class="iv-btn-spin" />
      </button>
    </div>

    <!-- Recording timer -->
    <div v-if="isRecording" class="iv-rec-timer">
      <span class="iv-rec-dot" />
      <span class="iv-rec-time">{{ formatDuration(elapsedSec) }}</span>
      <span class="iv-rec-sep">/</span>
      <span class="iv-rec-max">{{ formatDuration(maxSec) }}</span>
    </div>

    <!-- Hint -->
    <p class="iv-hint">
      <span v-if="isRecording">{{ t('interview.stage.stop_btn') }}</span>
      <span v-else-if="canRecord">{{ t('interview.stage.start_btn') }}</span>
    </p>

  </div>
</template>

<style scoped>
.iv-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px 20px;
  background: #ffffff;
}

.iv-status-text {
  font-size: 13px;
  color: var(--color-text-muted, #64748b);
  min-height: 20px;
  transition: color 0.2s;
  font-weight: 500;
}
.iv-status--rec { color: #ef4444; }
.iv-status--err { color: #ef4444; }
.iv-status--ai  { color: var(--color-primary, #6366f1); }

.iv-btn-wrap {
  position: relative;
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.iv-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid rgba(239,68,68,0.2);
  animation: iv-ring-expand 1.6s ease-out infinite;
}
.iv-ring-1 { width: 88px; height: 88px; }
.iv-ring-2 { width: 88px; height: 88px; animation-delay: 0.8s; }

@keyframes iv-ring-expand {
  0%   { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(2.2); opacity: 0; }
}

.iv-mic-btn {
  position: relative;
  z-index: 1;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: var(--color-primary, #6366f1);
  color: white;
  box-shadow: 0 4px 16px rgba(99,102,241,0.3);
}

.iv-mic-btn:hover:not(:disabled) {
  background: #4f46e5;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(99,102,241,0.4);
}

.iv-mic-btn--rec {
  background: #ef4444;
  box-shadow: 0 4px 16px rgba(239,68,68,0.3);
}
.iv-mic-btn--rec:hover:not(:disabled) {
  background: #dc2626;
  box-shadow: 0 6px 20px rgba(239,68,68,0.4);
}

.iv-mic-btn--busy,
.iv-mic-btn:disabled {
  background: var(--color-border, #e2e8f0);
  color: var(--color-text-muted, #64748b);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.iv-mic-btn--speak {
  background: var(--color-primary, #6366f1);
  opacity: 0.85;
  cursor: default;
}

.iv-btn-spin {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(99,102,241,0.2);
  border-top-color: var(--color-primary, #6366f1);
  border-radius: 50%;
  animation: iv-spin 0.8s linear infinite;
}

@keyframes iv-spin { to { transform: rotate(360deg); } }

.iv-wave-bar {
  transform-origin: center bottom;
  animation: iv-wave 1.2s ease-in-out infinite;
}
.iv-wave-bar-1 { animation-delay: 0s; }
.iv-wave-bar-2 { animation-delay: 0.1s; }
.iv-wave-bar-3 { animation-delay: 0.2s; }
.iv-wave-bar-4 { animation-delay: 0.3s; }
.iv-wave-bar-5 { animation-delay: 0.4s; }
.iv-wave-bar-6 { animation-delay: 0.5s; }

@keyframes iv-wave {
  0%, 100% { transform: scaleY(0.5); opacity: 0.6; }
  50%       { transform: scaleY(1);   opacity: 1; }
}

.iv-rec-timer {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.iv-rec-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  animation: iv-blink 1s ease-in-out infinite;
}
@keyframes iv-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }

.iv-rec-time { color: #ef4444; font-weight: 600; }
.iv-rec-sep  { color: var(--color-border, #e2e8f0); }
.iv-rec-max  { color: var(--color-text-muted, #64748b); }

.iv-hint {
  font-size: 11px;
  color: var(--color-text-muted, #64748b);
  min-height: 16px;
}
</style>
