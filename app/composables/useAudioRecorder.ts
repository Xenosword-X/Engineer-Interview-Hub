// composables/useAudioRecorder.ts
const MAX_DURATION_SEC = 180 // 3 minutes

export function useAudioRecorder() {
  const isRecording = ref(false)
  const isSupported = ref(false)
  const elapsedSec = ref(0)
  const volume = ref(0)

  let mediaRecorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  let timerInterval: ReturnType<typeof setInterval> | null = null
  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let animationFrameId: number | null = null

  onMounted(() => {
    isSupported.value = !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder)
  })

  onUnmounted(() => {
    stopTimer()
    if (mediaRecorder && isRecording.value) mediaRecorder.stop()
    audioContext?.close()
  })

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null }
  }

  function startVolumeMonitor(stream: MediaStream) {
    audioContext = new AudioContext()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    audioContext.createMediaStreamSource(stream).connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)

    function tick() {
      analyser!.getByteFrequencyData(data)
      volume.value = Math.round(data.reduce((a, b) => a + b, 0) / data.length)
      animationFrameId = requestAnimationFrame(tick)
    }
    tick()
  }

  async function start(): Promise<void> {
    if (isRecording.value || !isSupported.value) return

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    chunks = []
    elapsedSec.value = 0

    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
    mediaRecorder = new MediaRecorder(stream, { mimeType })
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

    startVolumeMonitor(stream)
    timerInterval = setInterval(() => {
      elapsedSec.value++
      if (elapsedSec.value >= MAX_DURATION_SEC) stop()
    }, 1000)

    mediaRecorder.start()
    isRecording.value = true

    // Watch for track end (mic revoked)
    stream.getTracks()[0].onended = () => stop()
  }

  function stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!mediaRecorder || !isRecording.value) {
        resolve(new Blob())
        return
      }
      stopTimer()
      volume.value = 0
      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder?.mimeType ?? 'audio/webm'
        const blob = new Blob(chunks, { type: mimeType })
        resolve(blob)
      }
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(t => t.stop())
      isRecording.value = false
    })
  }

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return { isRecording, isSupported, elapsedSec, volume, start, stop, formatDuration, MAX_DURATION_SEC }
}
