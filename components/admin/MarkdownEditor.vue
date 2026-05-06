<!-- components/admin/MarkdownEditor.vue -->
<script setup lang="ts">
import { Marked, Renderer } from 'marked'

interface LocaleContent {
  title: string
  body_md: string
}

const props = defineProps<{
  zh: LocaleContent
  en: LocaleContent
  slug: string
  category: string
  difficulty: string
  domain: string
  tags: string
  isNew?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:zh', val: LocaleContent): void
  (e: 'update:en', val: LocaleContent): void
  (e: 'update:slug', val: string): void
  (e: 'update:category', val: string): void
  (e: 'update:difficulty', val: string): void
  (e: 'update:domain', val: string): void
  (e: 'update:tags', val: string): void
  (e: 'save'): void
  (e: 'cancel'): void
}>()

const activeLocale = ref<'zh' | 'en'>('zh')

// Local marked instance (avoid mutating the global singleton)
const myMarked = new Marked()
const renderer = new Renderer()
renderer.heading = ({ text, depth }: { text: string; depth: number }): string => {
  const id = text.toLowerCase().replace(/[`*]/g, '').trim().replace(/\s+/g, '-')
  const inlineHtml = myMarked.parseInline(text) as string
  return `<h${depth} id="${id}">${inlineHtml}</h${depth}>\n`
}
myMarked.use({ renderer })

function preprocessMarkdown(md: string): string {
  return md.replace(/::callout\r?\n([\s\S]*?)\r?\n::/g, (_, content) => {
    const innerHtml = (myMarked.parse(content.trim()) as string).trim()
    return `<div class="callout">${innerHtml}</div>`
  })
}

const previewHtml = computed(() => {
  const md = activeLocale.value === 'zh' ? props.zh.body_md : props.en.body_md
  return myMarked.parse(preprocessMarkdown(md)) as string
})

const categories = ['javascript', 'vue', 'css', 'typescript', 'html', 'web-vitals', 'browser', 'behavioral']
const difficulties = ['basic', 'intermediate', 'advanced']
const domains = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'data-engineering', label: 'Data Engineering' },
  { value: 'devops', label: 'DevOps' },
]

function updateZhTitle(e: Event) {
  emit('update:zh', { ...props.zh, title: (e.target as HTMLInputElement).value })
}
function updateEnTitle(e: Event) {
  emit('update:en', { ...props.en, title: (e.target as HTMLInputElement).value })
}
function updateBody(e: Event) {
  const val = (e.target as HTMLTextAreaElement).value
  if (activeLocale.value === 'zh') {
    emit('update:zh', { ...props.zh, body_md: val })
  } else {
    emit('update:en', { ...props.en, body_md: val })
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Metadata row -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <div>
        <label class="text-xs font-medium text-slate-500 block mb-1">
          Slug <span class="text-slate-300">（新增時自動產生）</span>
        </label>
        <input
          :value="slug"
          @input="emit('update:slug', ($event.target as HTMLInputElement).value)"
          :readonly="!isNew"
          :class="[
            'w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400',
            isNew ? 'border-slate-200' : 'border-slate-100 bg-slate-50 text-slate-400 cursor-default'
          ]"
          placeholder="event-loop"
        />
      </div>
      <div>
        <label class="text-xs font-medium text-slate-500 block mb-1">分類 *</label>
        <select
          :value="category"
          @change="emit('update:category', ($event.target as HTMLSelectElement).value)"
          class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="" disabled>請選擇…</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <div>
        <label class="text-xs font-medium text-slate-500 block mb-1">難度 *</label>
        <select
          :value="difficulty"
          @change="emit('update:difficulty', ($event.target as HTMLSelectElement).value)"
          class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="" disabled>請選擇…</option>
          <option v-for="d in difficulties" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>
      <div>
        <label class="text-xs font-medium text-slate-500 block mb-1">領域 *</label>
        <select
          :value="domain"
          @change="emit('update:domain', ($event.target as HTMLSelectElement).value)"
          class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="" disabled>請選擇…</option>
          <option v-for="d in domains" :key="d.value" :value="d.value">{{ d.label }}</option>
        </select>
      </div>
      <div>
        <label class="text-xs font-medium text-slate-500 block mb-1">標籤（逗號分隔）</label>
        <input
          :value="tags"
          @input="emit('update:tags', ($event.target as HTMLInputElement).value)"
          placeholder="javascript, async"
          class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
    </div>

    <!-- Title row -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-xs font-medium text-slate-500 block mb-1">中文標題 *</label>
        <input
          :value="zh.title"
          @input="updateZhTitle"
          placeholder="什麼是 Event Loop？"
          class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div>
        <label class="text-xs font-medium text-slate-500 block mb-1">英文標題 *</label>
        <input
          :value="en.title"
          @input="updateEnTitle"
          placeholder="What is the Event Loop?"
          class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
    </div>

    <!-- Locale tabs -->
    <div class="flex gap-0 border-b border-slate-200">
      <button
        v-for="loc in ['zh', 'en']"
        :key="loc"
        @click="activeLocale = loc as 'zh' | 'en'"
        :class="[
          'px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
          activeLocale === loc
            ? 'border-indigo-500 text-indigo-600'
            : 'border-transparent text-slate-400 hover:text-slate-600'
        ]"
      >
        {{ loc.toUpperCase() }}
      </button>
    </div>

    <!-- Split-view editor -->
    <div class="grid grid-cols-2 border border-slate-200 rounded-xl overflow-hidden" style="height: 440px">
      <!-- Markdown input -->
      <textarea
        :value="activeLocale === 'zh' ? zh.body_md : en.body_md"
        @input="updateBody"
        class="w-full h-full px-5 py-4 text-sm font-mono bg-white border-r border-slate-200 focus:outline-none resize-none leading-relaxed text-slate-700 placeholder:text-slate-300"
        :placeholder="activeLocale === 'zh' ? '請用 Markdown 撰寫中文內容…' : 'Write Markdown content in English…'"
      />
      <!-- Live preview -->
      <div
        class="h-full overflow-y-auto px-5 py-4 prose prose-sm prose-slate max-w-none bg-slate-50"
        v-html="previewHtml"
      />
    </div>

    <!-- Action bar -->
    <div class="flex items-center justify-between pt-2">
      <button
        @click="emit('cancel')"
        class="text-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        取消
      </button>
      <button
        @click="emit('save')"
        class="bg-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-indigo-600 transition-colors"
      >
        儲存題目
      </button>
    </div>
  </div>
</template>
