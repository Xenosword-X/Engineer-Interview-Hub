// composables/useQuestions.ts
import { DOMAIN_CATEGORIES } from '@@/shared/question-domain-categories.mjs'

export interface QuestionMeta {
  id: string
  slug: string
  title: string
  category: string
  tags: string[]
  difficulty: 'basic' | 'intermediate' | 'advanced'
}

export interface QuestionItem extends QuestionMeta {
  body_md: string
}

export function useQuestions() {
  const { locale } = useI18n()
  const route = useRoute()

  const { data: questions, pending } = useAsyncData(
    `questions-${locale.value}`,
    () => $fetch<QuestionMeta[]>('/api/questions', { query: { locale: locale.value } })
  )

  const activeTag = computed(() => (route.query.tag as string) ?? '')
  const activeDomain = computed(() => (route.query.domain as string) ?? '')

  const filtered = computed(() => {
    if (!questions.value) return []
    if (activeTag.value) return questions.value.filter(q => q.category === activeTag.value)
    if (activeDomain.value) {
      const cats = DOMAIN_CATEGORIES[activeDomain.value] ?? []
      return questions.value.filter(q => cats.includes(q.category))
    }
    return questions.value
  })

  return { questions, filtered, activeTag, activeDomain, pending }
}
