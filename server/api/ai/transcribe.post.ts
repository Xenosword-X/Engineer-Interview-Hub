// server/api/ai/transcribe.post.ts
// Receives audio blob from browser, sends to OpenAI Whisper for transcription.
// Much higher accuracy than Web Speech API, especially for Chinese.
import { serverSupabaseUser } from '#supabase/server'
import OpenAI from 'openai'

export default defineEventHandler(async (event) => {
  // Auth check — only logged-in users can transcribe
  const user = await serverSupabaseUser(event)
  const userId = (user as any)?.id ?? (user as any)?.sub
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const formData = await readFormData(event)
  const audioFile = formData.get('audio') as File | null
  const locale    = (formData.get('locale') as string) ?? 'zh'

  if (!audioFile || audioFile.size === 0) {
    throw createError({ statusCode: 400, message: 'No audio file provided' })
  }

  const config = useRuntimeConfig()
  const openai  = new OpenAI({ apiKey: config.openaiApiKey as string })

  try {
    const transcription = await openai.audio.transcriptions.create({
      file:     audioFile,
      model:    'gpt-4o-transcribe',
      language: locale === 'zh' ? 'zh' : 'en',
    })
    return { text: transcription.text }
  } catch (e) {
    console.error('[/api/ai/transcribe] Whisper error:', e)
    throw createError({ statusCode: 500, message: 'Transcription failed' })
  }
})
