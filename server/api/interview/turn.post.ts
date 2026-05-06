// server/api/interview/turn.post.ts
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import OpenAI from 'openai'
import { buildTurnMessages } from '~/server/utils/interview/buildTurnMessages'
import { getDomain } from '~/server/utils/interview/domains/index'
import { parseTargetRole } from '~/server/utils/interview/parseTargetRole'
import { pickQuestionPool } from '~/server/utils/interview/pickQuestionPool'
import { validateAndCoerce, planUpcomingTurn } from '~/server/utils/interview/validateAiResponse'
import { parseTurnResponse } from '~/server/utils/interview/schemas'
import { isSilentTranscript, FALLBACK_REPLIES } from '~/server/utils/interview/applyFallback'
import type { InterviewTurn } from '~/server/utils/interview/types'

const MAX_TURNS = 15
const MAX_SESSION_MINUTES = 45

export default defineEventHandler(async (event) => {
  // 1. Auth
  const user = await serverSupabaseUser(event)
  const userId: string | undefined = (user as any)?.id ?? (user as any)?.sub
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  // 2. Parse multipart
  const formData = await readFormData(event)
  const sessionId = formData.get('sessionId') as string | null
  const audioFile = formData.get('audio') as File | null

  if (!sessionId) throw createError({ statusCode: 400, message: 'sessionId required' })
  if (!audioFile || audioFile.size === 0) throw createError({ statusCode: 400, message: 'audio required' })
  if (audioFile.size > 25 * 1024 * 1024) throw createError({ statusCode: 413, message: 'Audio too large' })

  const db = serverSupabaseServiceRole(event)

  // 3. Load session + ownership check
  const { data: session } = await db
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (!session) throw createError({ statusCode: 404, message: 'Session not found' })
  if (session.status !== 'active') throw createError({ statusCode: 400, message: 'Session is not active' })

  // 4. Timeout check
  const sessionAgeMinutes = (Date.now() - new Date(session.started_at).getTime()) / 60000
  if (sessionAgeMinutes > MAX_SESSION_MINUTES) {
    await db.from('interview_sessions').update({ status: 'completed', ended_at: new Date().toISOString() }).eq('id', sessionId)
    return { forceEnd: true, forceEndReason: 'timeout' }
  }

  // 5. Max turns check
  if (session.total_turns >= MAX_TURNS) {
    await db.from('interview_sessions').update({ status: 'completed', ended_at: new Date().toISOString() }).eq('id', sessionId)
    return { forceEnd: true, forceEndReason: 'max_turns' }
  }

  const config = useRuntimeConfig()
  const openai = new OpenAI({ apiKey: config.openaiApiKey as string })
  const locale = session.locale as 'zh' | 'en'

  // 6. STT
  let userTranscript = ''
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'gpt-4o-mini-transcribe',
      language: locale === 'zh' ? 'zh' : 'en',
      prompt: getDomain(parseTargetRole(session.target_role).roleType).sttTerms.join(', '),
    })
    userTranscript = transcription.text ?? ''
  } catch (e) {
    console.error('[interview/turn] STT error:', e)
    throw createError({ statusCode: 500, message: 'Transcription failed' })
  }

  // 7. Silent fallback
  if (isSilentTranscript(userTranscript)) {
    const fallbackText = FALLBACK_REPLIES[locale]
    let buffer = Buffer.alloc(0)
    try {
      const speech = await openai.audio.speech.create({ model: 'tts-1', voice: 'alloy', input: fallbackText })
      buffer = Buffer.from(await speech.arrayBuffer())
    } catch (e) {
      console.error('[interview/turn] silent fallback TTS error:', e)
    }
    return {
      userTranscript: '',
      userTurnIndex: -1,
      aiText: fallbackText,
      aiAudioBase64: buffer.length ? buffer.toString('base64') : '',
      aiAudioMimeType: 'audio/mpeg',
      aiTurnIndex: -1,
      phase: session.phase,
      progress: { current: 1, totalInPhase: 3, phaseLabel: session.phase },
      isFinal: false,
      silent: true,
    }
  }

  // 8. Load existing turns for context
  const { data: existingTurns } = await db
    .from('interview_turns')
    .select('role, content, turn_index, question_id, is_generated, phase')
    .eq('session_id', sessionId)
    .order('turn_index', { ascending: true })

  const turns: InterviewTurn[] = (existingTurns ?? []) as InterviewTurn[]
  const usedQuestionIds = turns.filter(t => t.question_id).map(t => t.question_id as string)
  const existingAssistantTurns = turns.filter(t => t.role === 'assistant').length

  // 9. Compute the deterministic plan for this upcoming AI turn (phase, progress, isFinal)
  const plan = planUpcomingTurn(existingAssistantTurns)

  // 10. Build question pool only when the upcoming turn is technical
  let questionPool = undefined
  let usedCategories: string[] = []
  if (plan.phase === 'technical') {
    const { data: dbQuestions } = await db
      .from('questions')
      .select('id, slug, difficulty, translations!inner(category, title)')
      .eq('translations.locale', locale)

    const allQuestions = (dbQuestions ?? []) as any[]

    // Categories already burned through in prior technical turns. The pool excludes
    // these and the prompt names them, so the AI is steered toward fresh territory.
    const idToCategory = new Map<string, string>()
    for (const q of allQuestions) {
      const t = q.translations?.[0]
      if (t?.category) idToCategory.set(q.id, t.category)
    }
    usedCategories = Array.from(
      new Set(usedQuestionIds.map(id => idToCategory.get(id)).filter(Boolean) as string[])
    )

    questionPool = pickQuestionPool(
      allQuestions,
      session.target_categories,
      locale,
      usedQuestionIds,
      usedCategories,
      session.target_role
    )
  }

  // 11. Build system prompt + messages
  const domain = getDomain(parseTargetRole(session.target_role).roleType)
  const systemPrompt = domain.systemPrompt(
    { plan, targetRole: session.target_role, targetCategories: session.target_categories, questionPool, usedCategories },
    locale
  )

  const messages = buildTurnMessages(systemPrompt, turns, userTranscript)

  // 11. LLM call
  let aiResponse: ReturnType<typeof parseTurnResponse>
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.4-nano',
      // gpt-5 series defaults to medium reasoning; for structured JSON output we want
      // minimal so reasoning tokens don't eat the completion budget.
      reasoning_effort: 'none',
      max_completion_tokens: 1000,
      response_format: { type: 'json_object' },
      messages,
    })
    aiResponse = parseTurnResponse(completion.choices[0]?.message?.content ?? '{}')
  } catch (e) {
    console.error('[interview/turn] LLM error:', e)
    throw createError({ statusCode: 500, message: 'AI response failed' })
  }

  // 12. Validate + coerce — phase/progress/isFinal are server-authoritative via `plan`
  const poolIds = (questionPool ?? []).map(q => q.id)
  const validated = validateAndCoerce(aiResponse, plan, usedQuestionIds, poolIds)

  // 13. TTS
  let aiAudioBase64 = ''
  try {
    const speech = await openai.audio.speech.create({ model: 'tts-1', voice: 'alloy', input: validated.reply })
    aiAudioBase64 = Buffer.from(await speech.arrayBuffer()).toString('base64')
  } catch (e) {
    console.error('[interview/turn] TTS error:', e)
    throw createError({ statusCode: 500, message: 'TTS failed' })
  }

  // 14. Write user turn + assistant turn + update session
  const nextTurnIndex = session.total_turns + 1
  const aiTurnIndex = nextTurnIndex + 1

  // Supabase bulk insert unions columns across rows: when one row provides a key
  // and another omits it, the omitted row gets `null` (default values are bypassed).
  // So both rows must explicitly carry every column the table expects.
  const insertPayload = [
    {
      session_id: sessionId,
      turn_index: nextTurnIndex,
      role: 'user',
      phase: session.phase,
      content: userTranscript,
      question_id: null,
      is_generated: false,
    },
    {
      session_id: sessionId,
      turn_index: aiTurnIndex,
      role: 'assistant',
      phase: validated.nextPhase,
      content: validated.reply,
      question_id: validated.pickedQuestionId,
      is_generated: validated.isGeneratedQuestion,
    },
  ]
  const { error: insertError } = await db
    .from('interview_turns')
    .insert(insertPayload)

  if (insertError) {
    console.error('[interview/turn] turn insert failed:', insertError, insertPayload)
  }

  const { error: sessionUpdateError } = await db.from('interview_sessions').update({
    phase: validated.nextPhase,
    total_turns: aiTurnIndex,
  }).eq('id', sessionId)

  if (sessionUpdateError) {
    console.error('[interview/turn] session update failed:', sessionUpdateError)
  }

  return {
    userTranscript,
    userTurnIndex: nextTurnIndex,
    aiText: validated.reply,
    aiAudioBase64,
    aiAudioMimeType: 'audio/mpeg',
    aiTurnIndex,
    phase: validated.nextPhase,
    progress: {
      current: validated.progressCurrent,
      totalInPhase: validated.progressTotalInPhase,
      phaseLabel: validated.nextPhase,
    },
    isFinal: validated.isFinal,
  }
})
