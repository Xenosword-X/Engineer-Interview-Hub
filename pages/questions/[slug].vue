<!-- pages/questions/[slug].vue -->
<script setup lang="ts">
import { Marked, Renderer } from 'marked'
import type { QuestionItem, QuestionMeta } from '~/composables/useQuestions'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const slug = route.params.slug as string

// Use a local Marked instance to avoid mutating the global singleton (SSR-safe)
const myMarked = new Marked()
const renderer = new Renderer()
renderer.heading = ({ text, depth }: { text: string; depth: number }): string => {
  const id = text.toLowerCase().replace(/[`*]/g, '').trim().replace(/\s+/g, '-')
  const inlineHtml = myMarked.parseInline(text) as string
  return `<h${depth} id="${id}">${inlineHtml}</h${depth}>\n`
}
myMarked.use({ renderer })

function preprocessMarkdown(md: string): string {
  // Convert ::callout\ncontent\n:: to styled div, rendering inner markdown
  return md.replace(/::callout\r?\n([\s\S]*?)\r?\n::/g, (_, content) => {
    const innerHtml = (myMarked.parse(content.trim()) as string).trim()
    return `<div class="callout">${innerHtml}</div>`
  })
}

// Collapsible explanation — default collapsed so users answer before reading
const isExpanded = ref(true)

// Share: Web Share API on mobile, fallback to copy link on desktop
const copied = ref(false)
async function share() {
  const url   = window.location.href
  const title = question.value?.title ?? ''

  if (navigator.share) {
    await navigator.share({ title, url })
  } else {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

// Fetch current question (with body_md)
const { data: question } = await useAsyncData(
  `question-${locale.value}-${slug}`,
  () => $fetch<QuestionItem>('/api/questions', { query: { locale: locale.value, slug } })
)

// Fetch all questions for prev/next navigation
const { data: localeQuestions } = await useAsyncData(
  `questions-${locale.value}`,
  () => $fetch<QuestionMeta[]>('/api/questions', { query: { locale: locale.value } })
)

if (!question.value) {
  throw createError({ statusCode: 404, statusMessage: 'Question not found' })
}

const currentIndex = computed(() => localeQuestions.value?.findIndex(q => q.slug === slug) ?? -1)
const prevQuestion = computed(() =>
  currentIndex.value > 0 ? (localeQuestions.value?.[currentIndex.value - 1] ?? null) : null
)
const nextQuestion = computed(() =>
  currentIndex.value < (localeQuestions.value?.length ?? 0) - 1
    ? (localeQuestions.value?.[currentIndex.value + 1] ?? null)
    : null
)

// Extract TOC from Markdown headings (h2 and h3 only)
const tocLinks = computed(() => {
  if (!question.value?.body_md) return []
  const links: Array<{ id: string; text: string; depth: number }> = []
  for (const line of question.value.body_md.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const depth = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/[`*]/g, '').trim().replace(/\s+/g, '-')
      links.push({ id, text, depth })
    }
  }
  return links
})

// Rendered HTML for the question body
const renderedHtml = computed(() =>
  question.value?.body_md
    ? myMarked.parse(preprocessMarkdown(question.value.body_md)) as string
    : ''
)

// SEO
const siteUrl = useSiteUrl()
const pageUrl = `${siteUrl}/${locale.value}/questions/${slug}`
const metaDescription = excerpt(question.value!.body_md, 155)
const answerText = excerpt(question.value!.body_md, 500)

useSeoMeta({
  title: `${question.value!.title} | Engineer Interview Hub`,
  description: metaDescription,
  ogTitle: question.value!.title,
  ogDescription: metaDescription,
  ogUrl: pageUrl,
  ogType: 'article',
  ogImage: `${siteUrl}/og-image.png`,
  twitterCard: 'summary_large_image',
  twitterTitle: question.value!.title,
  twitterDescription: metaDescription,
})

useHead({
  link: [
    { rel: 'canonical', href: pageUrl },
    { rel: 'alternate', hreflang: 'zh-TW', href: `${siteUrl}/zh/questions/${slug}` },
    { rel: 'alternate', hreflang: 'en-US', href: `${siteUrl}/en/questions/${slug}` },
  ],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'QAPage',
      inLanguage: locale.value === 'zh' ? 'zh-TW' : 'en-US',
      url: pageUrl,
      mainEntity: {
        '@type': 'Question',
        name: question.value!.title,
        text: question.value!.title,
        answerCount: 1,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answerText,
          url: pageUrl,
        },
      },
    })
  }]
})
</script>

<template>
  <div class="flex">
    <!-- Center: article -->
    <article class="flex-1 min-w-0 px-6 lg:px-10 py-6 max-w-[720px]">

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-1.5 text-xs text-[--color-text-muted] mb-5" aria-label="Breadcrumb">
        <NuxtLink :to="localePath('/')" class="hover:text-[--color-primary]">{{ t('detail.home') }}</NuxtLink>
        <span>›</span>
        <NuxtLink :to="`${localePath('/questions')}?tag=${question?.category}`" class="hover:text-[--color-primary]">
          {{ t(`categories.${question?.category}`) }}
        </NuxtLink>
        <span>›</span>
        <span class="text-[--color-text-secondary] font-medium truncate max-w-[200px]">{{ question?.title }}</span>
      </nav>

      <!-- Question header -->
      <header class="mb-6 pb-6 border-b border-[--color-border]">
        <div class="flex items-center gap-2 mb-3">
          <TagBadge :category="question?.category" />
          <DifficultyBadge :difficulty="question?.difficulty" />
        </div>
        <div :class="['iv-qd-title-wrap', `iv-qd-cat--${question?.category}`]">
          <h1 class="text-[22px] font-bold text-[--color-text-primary] leading-snug mb-4">
            {{ question?.title }}
          </h1>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Bookmark (functional) -->
          <BookmarkButton :slug="slug" />
          <!-- Share: Web Share API (mobile) or copy link (desktop) -->
          <button
            @click="share"
            :class="[
              'flex items-center gap-1.5 text-xs px-3 py-2 border rounded-[7px] transition-colors',
              copied
                ? 'border-green-300 text-green-600 bg-green-50'
                : 'border-[--color-border] text-[--color-text-secondary] hover:border-[--color-border-hover]'
            ]"
            class="min-h-11"
            :aria-label="t('detail.share')"
          >
            <!-- Check icon when copied -->
            <svg v-if="copied" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            {{ copied ? t('detail.share_copied') : t('detail.share') }}
          </button>
          <!-- AI practice CTA -->
          <a
            href="#ai-practice"
            class="ml-auto flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-500 px-4 py-2 rounded-[7px] hover:bg-indigo-600 transition-colors min-h-11"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
            {{ t('detail.ai_practice') }}
          </a>
        </div>
      </header>

      <!-- Collapsible explanation toggle -->
      <button
        @click="isExpanded = !isExpanded"
        :class="[
          'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors mb-4',
          isExpanded
            ? 'bg-indigo-50 border-[--color-primary-border] text-[--color-primary]'
            : 'bg-slate-50 border-[--color-border] text-[--color-text-secondary] hover:border-indigo-300 hover:text-indigo-600'
        ]"
      >
        <span class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          {{ isExpanded ? t('detail.hide_explanation') : t('detail.show_explanation') }}
        </span>
        <svg
          :class="['w-4 h-4 transition-transform duration-200', isExpanded ? 'rotate-180' : '']"
          fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <!-- Markdown content — v-show keeps it in DOM for SEO -->
      <div
        v-show="isExpanded"
        class="
          prose prose-slate max-w-none
          prose-headings:font-bold prose-headings:text-[--color-text-primary]
          prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-2.5
          prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
          prose-p:text-base prose-p:text-[--color-text-secondary] prose-p:leading-relaxed
          prose-li:text-base prose-li:text-[--color-text-secondary]
          prose-code:text-[11px] prose-code:font-mono prose-code:bg-slate-100 prose-code:text-indigo-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-slate-50 prose-pre:border prose-pre:border-[--color-border] prose-pre:rounded-lg prose-pre:text-[12px]
          prose-table:text-sm prose-th:text-[--color-text-primary] prose-td:text-[--color-text-secondary]
          mb-6
        "
        v-html="renderedHtml"
      />

      <!-- AI Practice section -->
      <AiPractice :slug="slug" :question-text="question?.title ?? ''" />

      <!-- Prev/Next -->
      <QuestionNav :prev="prevQuestion" :next="nextQuestion" />

    </article>

    <!-- Right TOC -->
    <QuestionToc :links="tocLinks" />
  </div>
</template>

<style scoped>
/* Category-coloured accent on the question title */
.iv-qd-title-wrap {
  padding-left: 14px;
  border-left: 3px solid var(--qd-cat, #6366f1);
}

.iv-qd-cat--javascript        { --qd-cat: #f59e0b; }
.iv-qd-cat--vue               { --qd-cat: #22c55e; }
.iv-qd-cat--css               { --qd-cat: #ec4899; }
.iv-qd-cat--network-security  { --qd-cat: #3b82f6; }
.iv-qd-cat--html              { --qd-cat: #f97316; }
.iv-qd-cat--web-vitals        { --qd-cat: #8b5cf6; }
.iv-qd-cat--browser           { --qd-cat: #0ea5e9; }
.iv-qd-cat--behavioral        { --qd-cat: #14b8a6; }
</style>
