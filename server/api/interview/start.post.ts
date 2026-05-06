// server/api/interview/start.post.ts
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import OpenAI from 'openai'
import { isWhitelisted, isQuotaExceeded } from '~/server/utils/interview/quotaCheck'
import { getDomain } from '~/server/utils/interview/domains/index'
import { parseTargetRole } from '~/server/utils/interview/parseTargetRole'

export default defineEventHandler(async (event) => {
  // 1. Auth
  const user = await serverSupabaseUser(event)
  const userId: string | undefined = (user as any)?.id ?? (user as any)?.sub
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  // 2. Validate body
  const { locale, targetRole } = await readBody<{
    locale: string
    targetRole: string
  }>(event)

  if (!['zh', 'en'].includes(locale)) throw createError({ statusCode: 400, message: 'Invalid locale' })
  const VALID_ROLE_TYPES = ['frontend', 'backend', 'data-engineering', 'devops', 'fullstack']
  const VALID_SENIORITIES = ['junior', 'mid', 'senior']
  const { roleType, seniority } = parseTargetRole(targetRole)
  if (!VALID_ROLE_TYPES.includes(roleType) || !VALID_SENIORITIES.includes(seniority)) {
    throw createError({ statusCode: 400, message: 'Invalid targetRole' })
  }

  const domain = getDomain(roleType)
  const targetCategories = domain.categories

  const config = useRuntimeConfig()
  const userEmail: string = (user as any)?.email ?? ''
  const whitelisted = isWhitelisted(userEmail, config.bypassEmails as string)

  const db = serverSupabaseServiceRole(event)

  // 3. Auto-abort any leftover active session — user explicitly clicked "start",
  // they want a fresh interview, not silent resumption of stale state.
  await db
    .from('interview_sessions')
    .update({ status: 'aborted', ended_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'active')

  // 4. Quota check (count today's active+completed+aborted sessions)
  if (!whitelisted) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count } = await db
      .from('interview_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('started_at', today.toISOString())
      .in('status', ['active', 'completed', 'aborted'])

    if (isQuotaExceeded(count ?? 0, false)) {
      throw createError({ statusCode: 429, message: 'Daily quota exceeded' })
    }
  }

  // 5. Create session
  const { data: session, error: sessionError } = await db
    .from('interview_sessions')
    .insert({
      user_id: userId,
      locale,
      target_role: targetRole,
      target_categories: targetCategories,
    })
    .select('id')
    .single()

  if (sessionError || !session) throw createError({ statusCode: 500, message: 'Failed to create session' })

  // 6. Generate opening TTS (fixed greeting, no LLM call)
  const greeting = domain.greeting[locale as 'zh' | 'en']
  const openai = new OpenAI({ apiKey: config.openaiApiKey as string })

  let aiAudioBase64 = ''
  try {
    const speech = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: greeting,
    })
    const buffer = Buffer.from(await speech.arrayBuffer())
    aiAudioBase64 = buffer.toString('base64')
  } catch (e) {
    console.error('[interview/start] TTS error:', e)
    throw createError({ statusCode: 500, message: 'TTS failed' })
  }

  // 7. Insert opening turn (turn_index=0, assistant)
  await db.from('interview_turns').insert({
    session_id: session.id,
    turn_index: 0,
    role: 'assistant',
    phase: 'intro',
    content: greeting,
  })

  return {
    sessionId: session.id,
    resumed: false,
    turnIndex: 0,
    aiText: greeting,
    aiAudioBase64,
    aiAudioMimeType: 'audio/mpeg',
    phase: 'intro',
    progress: { current: 1, totalInPhase: 1, phaseLabel: 'intro' },
  }
})
