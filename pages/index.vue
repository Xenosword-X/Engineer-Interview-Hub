<!-- pages/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'home' })

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { categories } = useCategories()

const activeDomain = ref<'all' | 'frontend' | 'backend' | 'data-engineering' | 'devops'>('all')

const DOMAIN_TABS = [
  { key: 'all', labelKey: 'domains.all' },
  { key: 'frontend', labelKey: 'domains.frontend' },
  { key: 'backend', labelKey: 'domains.backend' },
  { key: 'data-engineering', labelKey: 'domains.dataEngineering' },
  { key: 'devops', labelKey: 'domains.devops' },
] as const

function getCategoryDomain(slug: string): string {
  if (['javascript', 'vue', 'css', 'html', 'web-vitals', 'browser', 'behavioral'].includes(slug)) return 'frontend'
  if (slug.startsWith('backend-')) return 'backend'
  if (slug.startsWith('data-')) return 'data-engineering'
  if (slug.startsWith('devops-')) return 'devops'
  return 'frontend'
}

const filteredCategories = computed(() => {
  if (activeDomain.value === 'all') return categories.value
  return categories.value.filter(cat => getCategoryDomain(cat.key) === activeDomain.value)
})

import type { QuestionMeta } from '~/composables/useQuestions'

const { data: allQuestions } = await useAsyncData(
  `all-questions-${locale.value}`,
  () => $fetch<QuestionMeta[]>('/api/questions', { query: { locale: locale.value } })
)

const hotQuestions = computed(() => allQuestions.value?.slice(0, 5) ?? [])

const siteUrl = useSiteUrl()
useSeoMeta({
  title: t('home.seo_title'),
  description: t('home.seo_description'),
  ogTitle: t('home.seo_title'),
  ogDescription: t('home.seo_description'),
  ogUrl: `${siteUrl}/${locale.value}/`,
  ogType: 'website',
  ogImage: `${siteUrl}/og-image.png`,
  twitterCard: 'summary_large_image',
  twitterTitle: t('home.seo_title'),
  twitterDescription: t('home.seo_description'),
})

useHead({
  link: [
    { rel: 'canonical', href: `${siteUrl}/${locale.value}/` },
    { rel: 'alternate', hreflang: 'zh-TW', href: `${siteUrl}/zh/` },
    { rel: 'alternate', hreflang: 'en-US', href: `${siteUrl}/en/` },
    { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl}/zh/` },
  ],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Engineer Interview Hub',
      url: `${siteUrl}/${locale.value}/`,
      description: t('home.seo_description'),
      inLanguage: locale.value === 'zh' ? 'zh-TW' : 'en-US',
    })
  }]
})
</script>

<template>
  <div>
    <!-- ─── Hero (dark) ──────────────────────────────────────── -->
    <section class="iv-hero">
      <div class="iv-hero-glow" aria-hidden="true" />
      <div class="iv-hero-grid" aria-hidden="true" />
      <div class="iv-hero-inner">

        <span class="iv-hero-badge">
          <span class="iv-hero-badge-dot" aria-hidden="true" />
          {{ t('home.badge') }}
        </span>

        <h1 class="iv-hero-heading">
          {{ t('home.title') }}<br>
          <span class="iv-hero-accent">{{ t('home.title_accent') }}</span>
        </h1>

        <img
          src="~/assets/img/LOGO.png"
          alt="Engineer Interview Hub"
          class="iv-hero-logo h-100 w-auto"
        />

        <p class="iv-hero-desc">{{ t('home.description') }}</p>

        <div class="iv-hero-stats" aria-label="Site statistics">
          <div class="iv-hero-stat">
            <span class="iv-hero-stat-num">80+</span>
            <span class="iv-hero-stat-label">{{ t('home.stat_questions') }}</span>
          </div>
          <div class="iv-hero-divider" aria-hidden="true" />
          <div class="iv-hero-stat">
            <span class="iv-hero-stat-num">8</span>
            <span class="iv-hero-stat-label">{{ t('home.stat_categories') }}</span>
          </div>
          <div class="iv-hero-divider" aria-hidden="true" />
          <div class="iv-hero-stat">
            <span class="iv-hero-stat-num iv-hero-stat-num--ai">AI</span>
            <span class="iv-hero-stat-label">{{ t('home.stat_ai') }}</span>
          </div>
        </div>

        <div class="iv-hero-ctas">
          <NuxtLink :to="localePath('/questions')" class="iv-hero-btn iv-hero-btn--primary">
            {{ t('home.hero_cta_primary') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/interview')" class="iv-hero-btn iv-hero-btn--ghost">
            {{ t('home.hero_cta_secondary') }}
          </NuxtLink>
        </div>

      </div>
      <div class="iv-hero-fade" aria-hidden="true" />
    </section>

    <!-- ─── Content ──────────────────────────────────────────── -->
    <div class="max-w-360 mx-auto px-4 lg:px-6">

      <!-- Category Grid -->
      <section class="py-8">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-base font-bold text-[--color-text-primary] tracking-tight">
            {{ t('home.section_categories') }}
          </h2>
          <NuxtLink
            :to="localePath('/questions')"
            class="text-xs text-[--color-primary] font-semibold hover:underline underline-offset-2"
          >
            {{ t('home.view_all') }}
          </NuxtLink>
        </div>

        <!-- Domain Filter Tabs -->
        <div class="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-200 mb-6">
          <button
            v-for="tab in DOMAIN_TABS"
            :key="tab.key"
            :class="activeDomain === tab.key
              ? 'px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-500 text-white whitespace-nowrap cursor-pointer'
              : 'px-3 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer'"
            @click="activeDomain = tab.key"
          >
            {{ t(tab.labelKey) }}
          </button>
        </div>

        <div v-if="filteredCategories.length === 0" class="py-12 text-center text-slate-400">
          <p class="text-sm">{{ t(DOMAIN_TABS.find(tab => tab.key === activeDomain)?.labelKey ?? 'domains.all') }} 領域的題目即將上線</p>
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <CategoryCard v-for="cat in filteredCategories" :key="cat.key" :category="cat" />
        </div>
      </section>

      <hr class="border-[--color-border]">

      <!-- Hot Questions -->
      <section class="py-8">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-base font-bold text-[--color-text-primary] tracking-tight">
            {{ t('home.section_hot') }}
          </h2>
          <NuxtLink
            :to="localePath('/questions')"
            class="text-xs text-[--color-primary] font-semibold hover:underline underline-offset-2"
          >
            {{ t('home.view_all') }}
          </NuxtLink>
        </div>
        <div class="divide-y divide-[--color-border]">
          <NuxtLink
            v-for="(q, idx) in hotQuestions"
            :key="q.slug"
            :to="localePath(`/questions/${q.slug}`)"
            class="flex items-center gap-3 py-3.5 hover:bg-indigo-50/50 -mx-3 px-3 rounded-lg transition-colors duration-150 group"
          >
            <span class="text-xs font-bold text-indigo-400 min-w-6 font-mono">
              {{ String(idx + 1).padStart(2, '0') }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-[15px] font-medium text-[--color-text-primary] group-hover:text-[--color-primary] truncate transition-colors">
                {{ q.title }}
              </p>
              <div class="flex gap-1.5 mt-1">
                <TagBadge :category="q.category" />
                <DifficultyBadge :difficulty="q.difficulty" />
              </div>
            </div>
            <svg
              class="w-4 h-4 text-[--color-text-muted] shrink-0 group-hover:text-[--color-primary] transition-colors"
              fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </NuxtLink>
        </div>
      </section>

    </div>

    <!-- ─── AI Feature Cards ──────────────────────────────────── -->
    <div class="max-w-360 mx-auto px-4 lg:px-6 mb-10">
      <div class="iv-feat-grid">

        <!-- AI Practice -->
        <section class="iv-feat-card iv-feat-card--indigo">
          <div class="iv-feat-eyebrow">Per Question</div>
          <h2 class="iv-feat-title">{{ t('home.cta_practice_title') }}</h2>
          <p class="iv-feat-desc">{{ t('home.cta_practice_desc') }}</p>
          <NuxtLink :to="localePath('/questions/event-loop')" class="iv-feat-btn">
            {{ t('home.cta_practice_btn') }}
          </NuxtLink>
        </section>

        <!-- AI Interview -->
        <section class="iv-feat-card iv-feat-card--violet">
          <div class="iv-feat-header">
            <div class="iv-feat-eyebrow">Full Simulation</div>
            <span class="iv-feat-new">NEW</span>
          </div>
          <h2 class="iv-feat-title">{{ t('home.cta_interview_title') }}</h2>
          <p class="iv-feat-desc">{{ t('home.cta_interview_desc') }}</p>
          <NuxtLink :to="localePath('/interview')" class="iv-feat-btn">
            {{ t('home.cta_interview_btn') }}
          </NuxtLink>
        </section>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── Hero ──────────────────────────────────────────────────── */
.iv-hero {
  position: relative;
  overflow: hidden;
  background: #020617; /* slate-950 */
  padding: 5rem 1.5rem 5rem;
  text-align: center;
}

/* Radial glow behind heading */
.iv-hero-glow {
  position: absolute;
  top: -10%;
  left: 50%;
  transform: translateX(-50%);
  width: 720px;
  height: 480px;
  background: radial-gradient(ellipse at center,
    rgba(99, 102, 241, 0.22) 0%,
    rgba(124, 58, 237, 0.08) 45%,
    transparent 70%);
  pointer-events: none;
}

/* Subtle dot-grid pattern */
.iv-hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

/* Fade to page bg at the bottom */
.iv-hero-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, transparent, #f8fafc);
  pointer-events: none;
}

.iv-hero-inner {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

/* Badge */
.iv-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(99, 102, 241, 0.14);
  color: #a5b4fc; /* indigo-300 — ~8:1 on #020617 ✅ */
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 5px 14px;
  border-radius: 100px;
  margin-bottom: 1.75rem;
  border: 1px solid rgba(99, 102, 241, 0.28);
}

.iv-hero-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #818cf8;
  animation: hero-pulse 2.4s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes hero-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Heading */
.iv-hero-heading {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(2.25rem, 6vw, 3.5rem);
  line-height: 1.15;
  color: #f8fafc; /* slate-50 — >20:1 ✅ */
  margin-bottom: 1.25rem;
}

.iv-hero-accent {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Logo below heading */
.iv-hero-logo {
  height: 140px;
  width: auto;
  margin: 0.5rem auto 2rem;
  display: block;
  border-radius: 18px;
  filter: drop-shadow(0 6px 32px rgba(99, 102, 241, 0.55));
}

@media (min-width: 768px) {
  .iv-hero-logo {
    height: 200px;
    border-radius: 24px;
  }
}

/* Description */
.iv-hero-desc {
  font-size: 15px;
  color: #94a3b8; /* slate-400 — ~4.8:1 on #020617 ✅ */
  line-height: 1.75;
  max-width: 480px;
  margin: 0 auto 2.25rem;
}

/* Stats row */
.iv-hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  margin-bottom: 2.5rem;
}

.iv-hero-divider {
  width: 1px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
}

.iv-hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.iv-hero-stat-num {
  font-size: 1.625rem;
  font-weight: 700;
  color: #f8fafc; /* >20:1 ✅ */
  line-height: 1;
}

.iv-hero-stat-num--ai {
  background: linear-gradient(135deg, #818cf8, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.iv-hero-stat-label {
  font-size: 11px;
  color: #94a3b8; /* slate-400 — ~4.8:1 ✅ */
  letter-spacing: 0.3px;
}

/* CTA buttons */
.iv-hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.iv-hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 28px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.18s ease;
  min-height: 44px;
}

.iv-hero-btn--primary {
  background: #6366f1;
  color: #ffffff; /* >15:1 on #6366f1 ✅ */
  box-shadow: 0 2px 16px rgba(99, 102, 241, 0.4);
}
.iv-hero-btn--primary:hover {
  background: #4f46e5;
  box-shadow: 0 4px 24px rgba(99, 102, 241, 0.5);
  transform: translateY(-1px);
}

.iv-hero-btn--ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0; /* slate-200 — ~12:1 on #020617 ✅ */
  border: 1px solid rgba(255, 255, 255, 0.16);
}
.iv-hero-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.28);
  transform: translateY(-1px);
}

/* ─── AI Feature Cards ──────────────────────────────────────── */
.iv-feat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 600px) {
  .iv-feat-grid { grid-template-columns: 1fr; }
}

.iv-feat-card {
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.iv-feat-card--indigo {
  background: linear-gradient(135deg, #3730a3 0%, #6366f1 55%, #7c3aed 100%);
}

.iv-feat-card--violet {
  background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 55%, #9333ea 100%);
}

.iv-feat-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.iv-feat-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75); /* on dark gradient ✅ */
}

.iv-feat-new {
  font-size: 9px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 100px;
  letter-spacing: 0.8px;
}

.iv-feat-title {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff; /* ✅ */
  line-height: 1.3;
}

.iv-feat-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.82); /* ~very high contrast on dark gradient ✅ */
  line-height: 1.65;
  flex: 1;
}

.iv-feat-btn {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.95);
  color: #3730a3; /* indigo-800 — ~14:1 on white ✅ */
  font-size: 13px;
  font-weight: 700;
  padding: 9px 20px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.15s ease;
  min-height: 44px;
}
.iv-feat-btn:hover {
  background: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}
</style>
