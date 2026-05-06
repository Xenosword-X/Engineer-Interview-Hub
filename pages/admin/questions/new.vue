<!-- pages/admin/questions/new.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
defineI18nRoute(false)

const slug       = ref('')
const category   = ref('')
const difficulty = ref('')
const domain     = ref('frontend')
const tagsStr    = ref('')
const zh         = ref({ title: '', body_md: '' })
const en         = ref({ title: '', body_md: '' })
const error      = ref('')
const saving     = ref(false)

// Auto-generate slug from zh title (only while slug is still empty)
watch(() => zh.value.title, (title) => {
  if (!slug.value) {
    const generated = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
    // Only write the generated slug if it's non-empty (CJK titles produce empty strings)
    if (generated) slug.value = generated
  }
})

async function save() {
  if (!slug.value || !zh.value.title || !en.value.title || !category.value || !difficulty.value) {
    error.value = '請填寫 Slug、中英文標題、分類及難度'
    return
  }
  saving.value = true
  error.value  = ''
  try {
    await $fetch('/api/admin/questions', {
      method: 'POST',
      body: {
        slug:       slug.value,
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
    error.value   = err?.data?.message ?? '儲存失敗，請再試一次'
    saving.value  = false
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
      <h1 class="text-xl font-bold text-slate-800">新增題目</h1>
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
      :is-new="true"
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
