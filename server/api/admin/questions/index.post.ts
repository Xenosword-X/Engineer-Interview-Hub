// server/api/admin/questions/index.post.ts
import { serverSupabaseServiceRole } from '#supabase/server'

interface CreateBody {
  slug: string
  category: string
  difficulty: string
  domain?: string
  tags: string[]
  zh: { title: string; body_md: string }
  en: { title: string; body_md: string }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateBody>(event)

  if (!body.slug || !body.zh?.title || !body.en?.title || !body.category || !body.difficulty) {
    throw createError({ statusCode: 400, message: 'slug, category, difficulty, and both titles are required' })
  }

  const client = serverSupabaseServiceRole(event)

  const { data: question, error: qErr } = await client
    .from('questions')
    .insert({
      slug: body.slug,
      category: body.category,
      difficulty: body.difficulty,
      domain: body.domain ?? 'frontend',
      tags: body.tags ?? [],
    })
    .select('id')
    .single()

  if (qErr) {
    if (qErr.code === '23505') {
      throw createError({ statusCode: 409, message: 'Slug already in use' })
    }
    throw createError({ statusCode: 500, message: qErr.message })
  }

  const { error: tErr } = await client
    .from('translations')
    .insert([
      { question_id: question.id, locale: 'zh', title: body.zh.title, body_md: body.zh.body_md },
      { question_id: question.id, locale: 'en', title: body.en.title, body_md: body.en.body_md },
    ])

  if (tErr) {
    // Rollback: delete the orphaned question row
    await client.from('questions').delete().eq('id', question.id)
    throw createError({ statusCode: 500, message: tErr.message })
  }

  return { id: question.id, slug: body.slug }
})
