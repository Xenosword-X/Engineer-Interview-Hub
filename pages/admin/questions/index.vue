<!-- pages/admin/questions/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
defineI18nRoute(false)

interface Translation {
  locale: string
  title: string
  body_md: string
}

interface AdminQuestion {
  id: string
  slug: string
  category: string
  difficulty: string
  domain: string
  tags: string[]
  is_published: boolean
  created_at: string
  translations: Translation[]
}

const { data: questions, refresh } = await useAsyncData(
  'admin-questions',
  () => $fetch<AdminQuestion[]>('/api/admin/questions')
)

const search         = ref('')
const filterCategory = ref('')
const domainFilter   = ref('all')
const confirmDelete  = ref<string | null>(null)
const deleting       = ref(false)
const deleteError    = ref('')

const categories = ['javascript', 'vue', 'css', 'network-security', 'html', 'web-vitals', 'browser', 'behavioral']

const filtered = computed(() => {
  if (!questions.value) return []
  return questions.value.filter(q => {
    const zhTitle = q.translations.find(t => t.locale === 'zh')?.title ?? ''
    const matchSearch = !search.value
      || q.slug.toLowerCase().includes(search.value.toLowerCase())
      || zhTitle.includes(search.value)
    const matchCat = !filterCategory.value || q.category === filterCategory.value
    const matchDomain = domainFilter.value === 'all' || q.domain === domainFilter.value
    return matchSearch && matchCat && matchDomain
  })
})

async function deleteQuestion(id: string) {
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
    confirmDelete.value = null
    await refresh()
  } catch (err: any) {
    deleteError.value = err?.data?.message ?? '刪除失敗，請再試一次'
    confirmDelete.value = null
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header row -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-bold text-slate-800">
        題目管理
        <span class="text-sm font-normal text-slate-400 ml-2">{{ filtered.length }}</span>
      </h1>
      <NuxtLink
        to="/admin/questions/new"
        class="bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
      >
        + 新增題目
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex gap-3 mb-5">
      <input
        v-model="search"
        type="text"
        placeholder="搜尋 slug 或標題…"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-64"
      />
      <select
        v-model="filterCategory"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <option value="">所有分類</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <select
        v-model="domainFilter"
        class="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <option value="all">所有領域</option>
        <option value="frontend">Frontend</option>
        <option value="backend">Backend</option>
        <option value="data-engineering">Data Engineering</option>
        <option value="devops">DevOps</option>
      </select>
    </div>

    <!-- Delete error -->
    <p v-if="deleteError" class="text-xs text-red-500 mb-3">{{ deleteError }}</p>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Slug</th>
            <th class="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">分類</th>
            <th class="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">難度</th>
            <th class="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Domain</th>
            <th class="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">已發布</th>
            <th class="px-4 py-3 w-28"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="q in filtered" :key="q.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3 font-mono text-xs text-slate-600">{{ q.slug }}</td>
            <td class="px-4 py-3 text-slate-600">{{ q.category }}</td>
            <td class="px-4 py-3 text-slate-600">{{ q.difficulty }}</td>
            <td class="px-4 py-3 text-slate-600">{{ q.domain ?? '—' }}</td>
            <td class="px-4 py-3">
              <span
                :class="q.is_published ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'"
                class="text-[11px] font-medium px-2 py-0.5 rounded"
              >
                {{ q.is_published ? '是' : '否' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-3">
                <NuxtLink
                  :to="`/admin/questions/${q.id}/edit`"
                  class="text-xs text-indigo-500 hover:underline"
                >
                  編輯
                </NuxtLink>

                <template v-if="confirmDelete !== q.id">
                  <button
                    @click="confirmDelete = q.id"
                    class="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    刪除
                  </button>
                </template>
                <template v-else>
                  <span class="text-xs text-slate-500">確定？</span>
                  <button
                    @click="deleteQuestion(q.id)"
                    :disabled="deleting"
                    class="text-xs text-red-600 font-semibold hover:underline disabled:opacity-50"
                  >
                    確定
                  </button>
                  <button
                    @click="confirmDelete = null"
                    class="text-xs text-slate-400 hover:underline"
                  >
                    取消
                  </button>
                </template>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="px-4 py-10 text-center text-sm text-slate-400">
              找不到題目
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
