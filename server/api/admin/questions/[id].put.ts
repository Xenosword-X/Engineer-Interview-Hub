// server/api/admin/questions/[id].put.ts
import { serverSupabaseServiceRole } from '#supabase/server'

interface UpdateBody {
  category: string
  difficulty: string
  domain?: string
  tags: string[]
  zh: { title: string; body_md: string }
  en: { title: string; body_md: string }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })

  const body = await readBody<UpdateBody>(event)

  if (!body.zh?.title || !body.en?.title || !body.category || !body.difficulty) {
    throw createError({ statusCode: 400, message: 'category, difficulty, and both titles are required' })
  }

  const client = serverSupabaseServiceRole(event)

  const { data: updated, error: qErr } = await client
    .from('questions')
    .update({
      category: body.category,
      difficulty: body.difficulty,
      domain: body.domain ?? 'frontend',
      tags: body.tags ?? [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id')
    .single()

  if (qErr) {
    if (qErr.code === 'PGRST116') throw createError({ statusCode: 404, message: 'Question not found' })
    throw createError({ statusCode: 500, message: qErr.message })
  }

  const { error: tErr } = await client
    .from('translations')
    .upsert(
      [
        { question_id: id, locale: 'zh', title: body.zh.title, body_md: body.zh.body_md, updated_at: new Date().toISOString() },
        { question_id: id, locale: 'en', title: body.en.title, body_md: body.en.body_md, updated_at: new Date().toISOString() },
      ],
      { onConflict: 'question_id,locale' }
    )

  if (tErr) throw createError({ statusCode: 500, message: tErr.message })

  return { success: true }
})
