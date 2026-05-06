<!-- pages/admin/questions/[id]/edit.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
defineI18nRoute(false)

const route = useRoute()
const id    = route.params.id as string

const { data: question } = await useAsyncData(
  `admin-question-${id}`,
  () => $fetch<any>(`/api/admin/questions/${id}`)
)

if (!question.value) {
  throw createError({ statusCode: 404, statusMessage: 'Question not found' })
}

const slug       = ref(question.value.slug)
const category   = ref(question.value.category)
const difficulty = ref(question.value.difficulty)
const domain     = ref<string>(question.value.domain ?? 'frontend')
const tagsStr    = ref(((question.value.tags ?? []) as string[]).join(', '))

const zhTrans = question.value.translations.find((t: any) => t.locale === 'zh') ?? { title: '', body_md: '' }
const enTrans = question.value.translations.find((t: any) => t.locale === 'en') ?? { title: '', body_md: '' }

const zh = ref({ title: zhTrans.title, body_md: zhTrans.body_md })
const en = ref({ title: enTrans.title, body_md: enTrans.body_md })

const error  = ref('')
const saving = ref(false)

async function save() {
  if (!zh.value.title || !en.value.title || !category.value || !difficulty.value) {
    error.value = '請填寫中英文標題、分類及難度'
    return
  }
  saving.value = true
  error.value  = ''
  try {
    await $fetch(`/api/admin/questions/${id}`, {
      method: 'PUT',
      body: {
        category:   category.value,
        difficulty: difficulty.value,
        domain:     domain.value,
        tags:       tagsStr.value.split(',').map(s => s.trim()).filter(Boolean),
        zh:         zh.value,
        en:         en.value,
      },
    })
    await navigateTo('/admin/questions')
  } catch (err: any) {
    error.value  = err?.data?.message ?? '儲存失敗，請再試一次'
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/questions" class="text-sm text-slate-400 hover:text-indigo-500 transition-colors">
        ← 題目列表
      </NuxtLink>
      <span class="text-slate-300">/</span>
      <h1 class="text-xl font-bold text-slate-800">編輯：{{ slug }}</h1>
    </div>

    <div
      v-if="error"
      class="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
    >
      {{ error }}
    </div>

    <MarkdownEditor
      :slug="slug"
      :category="category"
      :difficulty="difficulty"
      :domain="domain"
      :tags="tagsStr"
      :zh="zh"
      :en="en"
      :is-new="false"
      @update:slug="slug = $event"
      @update:category="category = $event"
      @update:difficulty="difficulty = $event"
      @update:domain="domain = $event"
      @update:tags="tagsStr = $event"
      @update:zh="zh = $event"
      @update:en="en = $event"
      @save="save"
      @cancel="navigateTo('/admin/questions')"
    />
  </div>
</template>
