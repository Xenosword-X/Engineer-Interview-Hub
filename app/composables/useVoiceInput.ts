// composables/useVoiceInput.ts
// Records audio with MediaRecorder, sends to OpenAI Whisper for transcription.
// Replaces Web Speech API: no auto-stop timeout, much higher accuracy for Chinese.

export function useVoiceInput(onResult: (text: string) => void, locale?: Ref<string> | string) {
  const isRecording    = ref(false)
  const isTranscribing = ref(false)
  const isSupported    = ref(false)

  // Fallback: read from i18n if no locale passed
  const { locale: i18nLocale } = useI18n()
  const resolvedLocale = computed(() => {
    const l = typeof locale === 'string' ? locale : (locale?.value ?? i18nLocale.value)
    return l.startsWith('zh') ? 'zh' : 'en'
  })

  let mediaRecorder: MediaRecorder | null = null
  let chunks: Blob[] = []

  onMounted(() => {
    // MediaRecorder requires HTTPS or localhost
    isSupported.value = !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder)
  })

  onUnmounted(() => {
    if (mediaRecorder && isRecording.value) mediaRecorder.stop()
  })

  async function start() {
    if (isRecording.value || isTranscribing.value) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunks = []

      // Use webm if supported (Chrome/Firefox), fall back to mp4 (Safari)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      mediaRecorder = new MediaRecorder(stream, { mimeType })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        // Release microphone immediately
        stream.getTracks().forEach(t => t.stop())

        const ext  = mimeType === 'audio/webm' ? 'webm' : 'mp4'
        const blob = new Blob(chunks, { type: mimeType })
        isTranscribing.value = true

        try {
          const form = new FormData()
          form.append('audio', blob, `recording.${ext}`)
          form.append('locale', resolvedLocale.value)

          const res = await $fetch<{ text: string }>('/api/ai/transcribe', {
            method: 'POST',
            body: form,
          })

          if (res.text) onResult(res.text)
        } catch (e) {
          console.error('[useVoiceInput] transcription failed:', e)
        } finally {
          isTranscribing.value = false
        }
      }

      mediaRecorder.start()
      isRecording.value = true
    } catch (e) {
      console.error('[useVoiceInput] getUserMedia failed:', e)
      isRecording.value = false
    }
  }

  function stop() {
    if (!mediaRecorder || !isRecording.value) return
    mediaRecorder.stop()
    isRecording.value = false
  }

  return { isRecording, isTranscribing, isSupported, start, stop }
}
