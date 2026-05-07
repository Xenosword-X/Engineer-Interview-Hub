// server/api/interview/end.post.ts
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import OpenAI from 'openai'
import { buildSummaryPromptZh, buildSummaryPromptEn } from '~/server/utils/interview/prompts'
import { parseSummaryResponse } from '~/server/utils/interview/schemas'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId: string | undefined = (user as any)?.id ?? (user as any)?.sub
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { sessionId, abort } = await readBody<{ sessionId?: string; abort?: boolean }>(event)
  if (!sessionId) throw createError({ statusCode: 400, message: 'sessionId required' })

  const db = serverSupabaseServiceRole(event)

  const { data: session } = await db
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (!session) throw createError({ statusCode: 404, message: 'Session not found' })

  // Idempotent: already completed
  if (session.status === 'completed' && session.summary) {
    return { summary: session.summary }
  }
  if (session.status === 'aborted') {
    return { aborted: true }
  }

  // Manual cancellation: mark aborted, skip summary generation, no LLM cost.
  if (abort) {
    await db.from('interview_sessions').update({
      status: 'aborted',
      ended_at: new Date().toISOString(),
    }).eq('id', sessionId)
    return { aborted: true }
  }

  // Guard: only generate summary for active sessions
  if (session.status !== 'active') {
    return { summary: session.summary ?? null }
  }

  // Load full transcript
  const { data: turns } = await db
    .from('interview_turns')
    .select('role, content, turn_index')
    .eq('session_id', sessionId)
    .order('turn_index', { ascending: true })

  const locale = session.locale as 'zh' | 'en'
  const roleLabel = (role: string) => locale === 'zh'
    ? (role === 'assistant' ? '面試官' : '候選人')
    : (role === 'assistant' ? 'Interviewer' : 'Candidate')

  const transcript = (turns ?? [])
    .map(t => `[${roleLabel(t.role)}] ${t.content}`)
    .join('\n\n')

  const config = useRuntimeConfig()
  const openai = new OpenAI({ apiKey: config.openaiApiKey as string })
  const summaryPrompt = locale === 'zh' ? buildSummaryPromptZh() : buildSummaryPromptEn()

  let summary: ReturnType<typeof parseSummaryResponse>
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.4-nano',
      // gpt-5 series spends tokens on reasoning by default; for a structured-output
      // task like this, minimal reasoning leaves the whole budget for the JSON.
      reasoning_effort: 'none',
      max_completion_tokens: 6000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: summaryPrompt },
        { role: 'user', content: `Interview Transcript:\n\n${transcript}` },
      ],
    })
    const raw = completion.choices[0]?.message?.content ?? '{}'
    const finishReason = completion.choices[0]?.finish_reason
    if (finishReason !== 'stop') {
      // Surfacing this is the only way to know the JSON got chopped — caught below.
      throw new Error(`Summary output truncated (finish_reason=${finishReason})`)
    }
    summary = parseSummaryResponse(raw)
  } catch (e) {
    console.error('[interview/end] summary generation error:', e)
    throw createError({ statusCode: 500, message: 'Summary generation failed' })
  }

  await db.from('interview_sessions').update({
    status: 'completed',
    phase: 'completed',
    summary,
    ended_at: new Date().toISOString(),
  }).eq('id', sessionId)

  return { summary }
})
