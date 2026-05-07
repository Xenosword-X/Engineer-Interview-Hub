// server/api/ai/evaluate.post.ts
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import OpenAI from 'openai'
import { isWhitelisted } from '~/server/utils/interview/quotaCheck'

interface AiFeedback {
  accuracy: { score: number; summary: string }
  gaps: string[]
  example: string
}

const SYSTEM_PROMPT_ZH = `你是一位資深軟體工程師面試官，熟悉前端、後端、資料工程、DevOps 等各領域。
請針對以下軟體工程面試題，評估應試者的回答品質。

請以 JSON 格式回應，格式如下：
{
  "accuracy": {
    "score": <0-100 整數>,
    "summary": "<一句話評語，30字以內>"
  },
  "gaps": ["<缺漏要點1>", "<缺漏要點2>"],
  "example": "<優化後的完整建議答案>"
}

評分標準：
- 80-100：核心概念正確，有具體細節
- 60-79：基本正確但缺乏深度
- 40-59：部分正確，有明顯錯誤
- 0-39：回答方向有誤或過於簡略

語言：所有回覆必須使用繁體中文。
只回傳 JSON，不要有任何額外說明文字。`

const SYSTEM_PROMPT_EN = `You are a senior software engineering interviewer with expertise across frontend, backend, data engineering, and DevOps.
Evaluate the quality of the candidate's answer to the following software engineering interview question.

Respond in JSON with this exact format:
{
  "accuracy": {
    "score": <integer 0-100>,
    "summary": "<one-sentence evaluation, max 20 words>"
  },
  "gaps": ["<missing point 1>", "<missing point 2>"],
  "example": "<complete improved model answer>"
}

Scoring criteria:
- 80-100: Core concept correct with specific details
- 60-79: Mostly correct but lacking depth
- 40-59: Partially correct with notable errors
- 0-39: Wrong direction or too vague

Language: ALL fields must be in English.
Return ONLY the JSON object, no extra text.`

export default defineEventHandler(async (event) => {
  // 1. Auth — extract user ID (sub or id, handles @nuxtjs/supabase v2 JWT quirk)
  const user = await serverSupabaseUser(event)
  const userId: string | undefined = (user as any)?.id ?? (user as any)?.sub
  if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

  // 2. Parse body
  const { slug, questionText, answer, locale: bodyLocale } = await readBody<{
    slug: string
    questionText: string
    answer: string
    locale?: string
  }>(event)

  if (!slug || !questionText || !answer?.trim()) {
    throw createError({ statusCode: 400, message: 'slug, questionText and answer are required' })
  }
  if (answer.length > 2000 || questionText.length > 1000) {
    throw createError({ statusCode: 400, message: 'Input too long' })
  }

  // 3. Rate limit check
  const config = useRuntimeConfig()
  const userEmail: string = (user as any)?.email ?? ''
  const isDevBypass = isWhitelisted(userEmail, config.bypassEmails as string)
  const dbClient = serverSupabaseServiceRole(event)

  const dailyLimit = parseInt(config.dailyAiLimit as string) || 10
  let usedToday = 0

  if (!isDevBypass) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count } = await dbClient
      .from('practice_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())

    usedToday = count ?? 0
    if (usedToday >= dailyLimit) {
      throw createError({ statusCode: 429, message: `Daily limit reached (${dailyLimit})` })
    }
  }

  // 4. Determine locale: prefer body locale, fall back to Accept-Language header
  const acceptLang = getHeader(event, 'accept-language') ?? ''
  const locale = (bodyLocale === 'en' || bodyLocale === 'zh')
    ? bodyLocale
    : (acceptLang.toLowerCase().startsWith('zh') ? 'zh' : 'en')

  const systemPrompt = locale === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN
  const userMessage = locale === 'zh'
    ? `面試題目：${questionText}\n\n應試者回答：${answer}`
    : `Interview question: ${questionText}\n\nCandidate's answer: ${answer}`

  // 5. OpenAI call
  const openai = new OpenAI({ apiKey: config.openaiApiKey as string })

  let feedback: AiFeedback
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.4-nano',
      reasoning_effort: 'none',
      max_completion_tokens: 800,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    })
    feedback = JSON.parse(completion.choices[0]?.message.content ?? '{}') as AiFeedback
  } catch (e) {
    console.error('[/api/ai/evaluate] OpenAI error:', e)
    throw createError({ statusCode: 500, message: 'AI scoring failed' })
  }

  // 6. Save to practice_logs
  await dbClient.from('practice_logs').insert({
    user_id:       userId,
    question_slug: slug,
    question_text: questionText,
    user_answer:   answer,
    ai_feedback:   feedback,
    locale,
  })

  return {
    feedback,
    usedToday:  isDevBypass ? 0 : usedToday + 1,
    dailyLimit: isDevBypass ? null : dailyLimit,
  }
})
