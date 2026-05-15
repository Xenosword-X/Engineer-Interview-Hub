// composables/useInterviewSession.ts
import type { Phase, InterviewTurn, InterviewSummary } from '~/server/utils/interview/types'

type InterviewState = 'idle' | 'recording' | 'uploading' | 'ai_thinking' | 'ai_speaking' | 'error'

interface TurnResult {
  userTranscript: string
  userTurnIndex: number
  aiText: string
  aiAudioBase64: string
  aiAudioMimeType: string
  aiTurnIndex: number
  phase: Phase
  progress: { current: number; totalInPhase: number; phaseLabel: string }
  isFinal: boolean
  silent?: boolean
  forceEnd?: boolean
  forceEndReason?: string
}

export function useInterviewSession(sessionId: Ref<string>) {
  const state = ref<InterviewState>('idle')
  const turns = ref<Array<{ role: 'assistant' | 'user'; content: string; turnIndex: number }>>([])
  const phase = ref<Phase>('intro')
  const progress = ref({ current: 1, totalInPhase: 1, phaseLabel: 'intro' })
  const isFinal = ref(false)
  const consecutiveErrors = ref(0)
  const summary = ref<InterviewSummary | null>(null)

  async function submitTurn(audioBlob: Blob): Promise<TurnResult | null> {
    if (state.value !== 'idle') return null
    state.value = 'uploading'

    const form = new FormData()
    form.append('sessionId', sessionId.value)
    form.append('audio', audioBlob, 'recording.webm')

    try {
      const result = await $fetch<TurnResult>('/api/interview/turn', { method: 'POST', body: form })

      consecutiveErrors.value = 0

      if (result.forceEnd) {
        isFinal.value = true
        state.value = 'idle'
        return result
      }

      if (!result.silent) {
        if (result.userTranscript) {
          turns.value.push({ role: 'user', content: result.userTranscript, turnIndex: result.userTurnIndex })
        }
        turns.value.push({ role: 'assistant', content: result.aiText, turnIndex: result.aiTurnIndex })
      }

      phase.value = result.phase
      progress.value = result.progress
      isFinal.value = result.isFinal

      await playAudio(result.aiAudioBase64, result.aiAudioMimeType)
      state.value = 'idle'
      return result
    } catch (e) {
      consecutiveErrors.value++
      state.value = consecutiveErrors.value >= 3 ? 'error' : 'idle'
      console.error('[useInterviewSession] turn error:', e)
      return null
    }
  }

  async function endInterview(): Promise<InterviewSummary | null> {
    try {
      const result = await $fetch<{ summary: InterviewSummary }>('/api/interview/end', {
        method: 'POST',
        body: { sessionId: sessionId.value },
      })
      summary.value = result.summary
      return result.summary
    } catch (e) {
      console.error('[useInterviewSession] end error:', e)
      return null
    }
  }

  // Manual cancellation — server marks session as 'aborted' and skips summary.
  async function abortInterview(): Promise<boolean> {
    try {
      await $fetch('/api/interview/end', {
        method: 'POST',
        body: { sessionId: sessionId.value, abort: true },
      })
      return true
    } catch (e) {
      console.error('[useInterviewSession] abort error:', e)
      return false
    }
  }

  function playAudio(base64: string, mimeType: string): Promise<void> {
    return new Promise((resolve) => {
      if (!process.client) { resolve(); return }
      state.value = 'ai_speaking'
      const audio = new Audio(`data:${mimeType};base64,${base64}`)
      audio.onended = () => resolve()
      audio.onerror = () => resolve()
      audio.play().catch(() => resolve())
    })
  }

  function initTurns(initialAiText: string) {
    turns.value = [{ role: 'assistant', content: initialAiText, turnIndex: 0 }]
  }

  return { state, turns, phase, progress, isFinal, consecutiveErrors, summary, submitTurn, endInterview, abortInterview, initTurns }
}
