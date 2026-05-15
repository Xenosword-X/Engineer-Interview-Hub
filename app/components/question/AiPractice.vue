<!-- components/question/AiPractice.vue -->
<script setup lang="ts">
interface AiFeedback {
  accuracy: { score: number; summary: string }
  gaps: string[]
  example: string
}

interface EvaluateResponse {
  feedback:   AiFeedback
  usedToday:  number
  dailyLimit: number | null
}

const props = defineProps<{ slug: string; questionText: string }>()
const { t, locale } = useI18n()
const user = useSupabaseUser()

// UI state
const uiState  = ref<'idle' | 'loading' | 'result' | 'limit'>('idle')
const answer   = ref('')
const feedback = ref<AiFeedback | null>(null)
const usedToday  = ref(0)
const dailyLimit = ref<number | null>(10)
const errorMsg = ref('')

// Voice input (MediaRecorder → Whisper API); pass locale so Whisper uses correct language
const { isRecording, isTranscribing, isSupported, start: startVoice, stop: stopVoice } =
  useVoiceInput((transcript: string) => { answer.value = transcript }, locale)

const scoreColour = computed(() => {
  const s = feedback.value?.accuracy.score ?? 0
  if (s >= 80) return 'high'
  if (s >= 60) return 'mid'
  return 'low'
})

const remainingText = computed(() => {
  if (dailyLimit.value === null) return t('ai_evaluate.remaining_unlimited')
  return t('ai_evaluate.remaining', { used: usedToday.value, total: dailyLimit.value })
})

async function submit() {
  if (!answer.value.trim() || uiState.value === 'loading') return
  uiState.value = 'loading'
  errorMsg.value = ''

  try {
    const res = await $fetch<EvaluateResponse>('/api/ai/evaluate', {
      method: 'POST',
      body: {
        slug:         props.slug,
        questionText: props.questionText,
        answer:       answer.value,
        locale:       locale.value,
      },
    })
    feedback.value   = res.feedback
    usedToday.value  = res.usedToday
    dailyLimit.value = res.dailyLimit
    uiState.value    = 'result'
  } catch (err: any) {
    if (err?.status === 429) {
      uiState.value = 'limit'
    } else {
      errorMsg.value = err?.data?.message === 'AI scoring failed'
        ? t('ai_evaluate.error_timeout')
        : t('ai_evaluate.error_generic')
      uiState.value = 'idle'
    }
  }
}

function retry() {
  answer.value   = ''
  feedback.value = null
  uiState.value  = 'idle'
}
</script>

<template>
  <div class="mt-8 border border-[--color-primary-border] rounded-xl overflow-hidden bg-indigo-50/30" id="ai-practice">

    <!-- Header -->
    <div class="px-5 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500">
      <p class="text-sm font-bold text-white">✦ {{ t('ai_evaluate.title') }}</p>
      <p class="text-xs text-white/75 mt-0.5">{{ t('ai_evaluate.subtitle') }}</p>
    </div>

    <!-- ── Unauthenticated ── -->
    <div v-if="!user" class="px-5 py-8 flex flex-col items-center gap-3 text-center">
      <svg class="w-10 h-10 text-indigo-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
      </svg>
      <p class="text-sm text-[--color-text-secondary]">{{ t('ai_evaluate.login_prompt') }}</p>
      <LoginButton />
    </div>

    <!-- ── Daily limit reached ── -->
    <div v-else-if="uiState === 'limit'" class="px-5 py-8 text-center">
      <p class="text-sm font-semibold text-amber-600 mb-2">🚫 {{ t('ai_evaluate.limit_reached') }}</p>
      <button @click="retry" class="text-xs text-indigo-500 underline">{{ t('ai_evaluate.retry') }}</button>
    </div>

    <!-- ── Loading ── -->
    <div v-else-if="uiState === 'loading'" class="px-5 py-10 flex flex-col items-center gap-3">
      <svg class="w-9 h-9 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <p class="text-sm text-[--color-text-muted]">{{ t('ai_evaluate.loading') }}</p>
    </div>

    <!-- ── Result ── -->
    <div v-else-if="uiState === 'result' && feedback" class="px-5 py-4 flex flex-col gap-4">
      <!-- Score badge -->
      <div class="flex items-center gap-3">
        <div :class="[
          'w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shrink-0',
          scoreColour === 'high' ? 'bg-green-100 text-green-700' :
          scoreColour === 'mid'  ? 'bg-yellow-100 text-yellow-700' :
                                   'bg-red-100 text-red-700'
        ]">
          {{ feedback.accuracy.score }}
        </div>
        <div>
          <p class="text-[10px] text-[--color-text-muted] uppercase tracking-wider mb-0.5">{{ t('ai_evaluate.score_label') }}</p>
          <p class="text-sm font-medium text-[--color-text-primary] leading-snug">{{ feedback.accuracy.summary }}</p>
        </div>
      </div>

      <hr class="border-[--color-primary-border]">

      <!-- Gaps -->
      <div>
        <p class="text-[11px] font-semibold text-[--color-text-muted] uppercase tracking-wider mb-2">⚠ {{ t('ai_evaluate.gaps_title') }}</p>
        <ul class="flex flex-col gap-1.5">
          <li v-for="(gap, i) in feedback.gaps" :key="i" class="flex items-start gap-2 text-sm text-[--color-text-secondary]">
            <span class="text-amber-500 mt-0.5 shrink-0">▸</span>
            {{ gap }}
          </li>
        </ul>
      </div>

      <hr class="border-[--color-primary-border]">

      <!-- Example answer -->
      <div>
        <p class="text-[11px] font-semibold text-[--color-text-muted] uppercase tracking-wider mb-2">✨ {{ t('ai_evaluate.example_title') }}</p>
        <div class="bg-slate-50 border border-[--color-border] rounded-lg px-4 py-3 text-sm text-[--color-text-secondary] leading-relaxed">
          {{ feedback.example }}
        </div>
      </div>

      <div class="flex items-center justify-between">
        <button @click="retry" class="text-xs text-indigo-500 hover:underline">{{ t('ai_evaluate.retry') }}</button>
        <span class="text-xs text-[--color-text-muted]">{{ remainingText }}</span>
      </div>
    </div>

    <!-- ── Idle: Input ── -->
    <div v-else>
      <textarea
        v-model="answer"
        :placeholder="t('ai_evaluate.placeholder')"
        rows="4"
        class="w-full px-5 py-4 text-sm text-[--color-text-secondary] bg-white border-b border-[--color-primary-border] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset placeholder:text-[--color-text-muted] resize-none"
      />

      <!-- Toolbar: voice button + char count -->
      <div class="px-5 pt-2 pb-1 flex items-center gap-2">
        <button
          v-if="isSupported"
          @click="isRecording ? stopVoice() : startVoice()"
          :disabled="isTranscribing"
          :class="[
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors',
            isTranscribing
              ? 'bg-indigo-50 border-indigo-200 text-indigo-500 cursor-wait'
              : isRecording
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-slate-50 border-[--color-border] text-[--color-text-muted] hover:border-indigo-300 hover:text-indigo-500'
          ]"
        >
          <!-- Transcribing spinner -->
          <svg v-if="isTranscribing" class="w-3 h-3 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span v-else :class="['w-2 h-2 rounded-full shrink-0', isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-400']" />
          {{ isTranscribing ? t('ai_evaluate.voice_transcribing') : isRecording ? t('ai_evaluate.voice_recording') : t('ai_evaluate.voice_start') }}
        </button>
        <span class="ml-auto text-[10px] text-[--color-text-muted]">{{ answer.length }} / 500</span>
      </div>

      <!-- Footer: remaining count + submit -->
      <div class="flex items-center justify-between px-5 py-3">
        <span class="text-xs text-[--color-text-muted]">{{ remainingText }}</span>
        <button
          @click="submit"
          :disabled="!answer.trim() || isRecording || isTranscribing"
          class="text-sm font-semibold text-white bg-indigo-500 px-4 py-2 rounded-lg hover:bg-indigo-600 disabled:bg-indigo-200 disabled:cursor-not-allowed transition-colors min-h-11"
        >
          {{ t('ai_evaluate.submit') }}
        </button>
      </div>

      <!-- Error message -->
      <p v-if="errorMsg" class="px-5 pb-3 text-xs text-red-500">{{ errorMsg }}</p>
    </div>

  </div>
</template>
