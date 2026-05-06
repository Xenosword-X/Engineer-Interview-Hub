<!-- pages/questions/index.vue -->
<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { filtered, activeTag, pending } = useQuestions()
const { categories } = useCategories()

const siteUrl = useSiteUrl()

useSeoMeta({
  title: `${t('questions.page_title')} | Engineer Interview Hub`,
  description: t('home.seo_description'),
  ogTitle: `${t('questions.page_title')} | Engineer Interview Hub`,
  ogDescription: t('home.seo_description'),
  ogUrl: `${siteUrl}/${locale.value}/questions`,
  ogType: 'website',
  ogImage: `${siteUrl}/og-image.png`,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    { rel: 'canonical', href: `${siteUrl}/${locale.value}/questions` },
    { rel: 'alternate', hreflang: 'zh-TW', href: `${siteUrl}/zh/questions` },
    { rel: 'alternate', hreflang: 'en-US', href: `${siteUrl}/en/questions` },
  ]
})
</script>

<template>
  <div class="flex flex-col min-h-full">

    <!-- Mobile tag bar (horizontal scroll) -->
    <div class="lg:hidden overflow-x-auto border-b border-[--color-border] bg-white sticky top-14 z-20">
      <div class="flex gap-2 px-4 py-2.5 min-w-max">
        <NuxtLink
          :to="localePath('/questions')"
          :class="['text-[11px] font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors',
            !activeTag ? 'bg-[--color-primary-light] text-[--color-primary] border-[--color-primary-border]'
                       : 'border-[--color-border] text-[--color-text-secondary] bg-white']"
        >{{ t('questions.all_categories') }}</NuxtLink>
        <NuxtLink
          v-for="cat in categories"
          :key="cat.key"
          :to="`${localePath('/questions')}?tag=${cat.key}`"
          :class="['text-[11px] font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors',
            activeTag === cat.key ? 'bg-[--color-primary-light] text-[--color-primary] border-[--color-primary-border]'
                                  : 'border-[--color-border] text-[--color-text-secondary] bg-white']"
        >{{ t(`categories.${cat.key}`) }}</NuxtLink>
      </div>
    </div>

    <!-- Page header -->
    <header class="px-4 lg:px-8 pt-6 pb-5 border-b border-[--color-border] bg-white">
      <p class="iv-qp-eyebrow">{{ activeTag ? 'CATEGORY' : 'QUESTION BANK' }}</p>
      <div class="flex items-baseline gap-3 mt-1.5">
        <h1 class="iv-qp-title">
          {{ activeTag ? t(`categories.${activeTag}`) : t('questions.page_title') }}
        </h1>
        <span v-if="!pending" class="iv-qp-count">{{ filtered.length }}</span>
      </div>
    </header>

    <!-- Question list -->
    <div class="flex-1 px-4 lg:px-8 py-5">
      <div v-if="pending" class="grid gap-3">
        <AppSkeletonCard v-for="n in 8" :key="n" />
      </div>
      <template v-else>
        <p v-if="filtered.length === 0" class="text-sm text-[--color-text-muted] py-12 text-center">
          {{ t('questions.no_results') }}
        </p>
        <div v-else class="grid gap-3">
          <QuestionCard v-for="q in filtered" :key="q.slug" :question="q" />
        </div>
      </template>
    </div>

  </div>
</template>

<style scoped>
.iv-qp-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-primary, #6366f1);
}

.iv-qp-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.375rem;
  color: var(--color-text-primary, #0f172a);
  line-height: 1.3;
}

.iv-qp-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted, #64748b); /* 4.35:1 on white ✅ */
  background: var(--color-bg, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  padding: 2px 10px;
  border-radius: 100px;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
