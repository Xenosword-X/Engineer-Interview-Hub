<!-- pages/about.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'home' })
const { t } = useI18n()

useHead({
  title: t('about.page_title'),
  meta: [{ name: 'description', content: t('about.page_description') }]
})

const techStack = [
  { name: 'Nuxt 3', color: 'bg-green-100 text-green-800 border-green-200' },
  { name: 'TypeScript', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { name: 'Vue 3', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { name: 'Tailwind CSS v4', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { name: 'Supabase', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { name: 'OpenAI gpt-5.4-nano', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  { name: 'Nuxt i18n', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { name: 'Playwright', color: 'bg-orange-100 text-orange-800 border-orange-200' },
]
</script>

<template>
  <div class="pb-16 lg:pb-0">

    <!-- Hero: dark gradient for strong visual impact -->
    <section class="relative overflow-hidden bg-linear-to-br from-indigo-700 via-indigo-800 to-slate-900 py-20 px-4 text-center">
      <!-- Dot pattern overlay -->
      <div
        class="absolute inset-0 opacity-10"
        style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 24px 24px;"
        aria-hidden="true"
      />
      <div class="relative max-w-2xl mx-auto">
        <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-200 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-6">
          About Me
        </span>
        <h1 class="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
          {{ t('about.hero_title') }}
        </h1>
        <p class="text-indigo-200 text-base sm:text-lg leading-relaxed">
          {{ t('about.hero_subtitle') }}
        </p>
      </div>
    </section>

    <!-- Project Story -->
    <section class="py-16 px-4">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold text-[--color-text-primary] mb-6">{{ t('about.project_title') }}</h2>
        <div class="space-y-4 text-[--color-text-secondary] leading-relaxed border-l-4 border-indigo-200 pl-5">
          <p>{{ t('about.project_body_1') }}</p>
          <p>{{ t('about.project_body_2') }}</p>
        </div>
      </div>
    </section>

    <!-- Tech Stack -->
    <section class="py-16 bg-slate-50 px-4">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold text-[--color-text-primary] mb-6">{{ t('about.tech_title') }}</h2>
        <div class="flex flex-wrap gap-2.5">
          <span
            v-for="tech in techStack"
            :key="tech.name"
            :class="['text-sm font-medium px-3.5 py-1.5 rounded-full border', tech.color]"
          >
            {{ tech.name }}
          </span>
        </div>
      </div>
    </section>

    <!-- Key Features -->
    <section class="py-16 px-4">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold text-[--color-text-primary] mb-6">{{ t('about.features_title') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div class="border border-[--color-border] rounded-2xl p-5 bg-white hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div class="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4 shadow-sm">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 class="font-semibold text-base text-[--color-text-primary] mb-1.5">{{ t('about.feature_questions') }}</h3>
            <p class="text-sm text-[--color-text-muted] leading-relaxed">{{ t('about.feature_questions_desc') }}</p>
          </div>

          <div class="border border-[--color-border] rounded-2xl p-5 bg-white hover:border-violet-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div class="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 shadow-sm">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h3 class="font-semibold text-base text-[--color-text-primary] mb-1.5">{{ t('about.feature_ai') }}</h3>
            <p class="text-sm text-[--color-text-muted] leading-relaxed">{{ t('about.feature_ai_desc') }}</p>
          </div>

          <div class="border border-[--color-border] rounded-2xl p-5 bg-white hover:border-teal-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div class="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-4 shadow-sm">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
              </svg>
            </div>
            <h3 class="font-semibold text-base text-[--color-text-primary] mb-1.5">{{ t('about.feature_bilingual') }}</h3>
            <p class="text-sm text-[--color-text-muted] leading-relaxed">{{ t('about.feature_bilingual_desc') }}</p>
          </div>

          <div class="border border-[--color-border] rounded-2xl p-5 bg-white hover:border-rose-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div class="w-10 h-10 rounded-xl bg-linear-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-4 shadow-sm">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 class="font-semibold text-base text-[--color-text-primary] mb-1.5">{{ t('about.feature_voice') }}</h3>
            <p class="text-sm text-[--color-text-muted] leading-relaxed">{{ t('about.feature_voice_desc') }}</p>
          </div>

        </div>
      </div>
    </section>

    <!-- Developer -->
    <section class="py-16 bg-slate-50 px-4">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold text-[--color-text-primary] mb-8 text-center">{{ t('about.author_title') }}</h2>
        <div class="bg-white rounded-2xl border border-[--color-border] p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
          <div class="shrink-0">
            <div class="w-20 h-20 rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-white text-2xl font-bold flex items-center justify-center ring-4 ring-indigo-100 shadow-md">
              W
            </div>
          </div>
          <div class="text-center sm:text-left">
            <p class="font-bold text-xl text-[--color-text-primary] mb-1">{{ t('about.author_name') }}</p>
            <p class="text-sm text-[--color-primary] font-medium mb-3">Frontend Engineer</p>
            <p class="text-sm text-[--color-text-secondary] leading-relaxed">{{ t('about.author_bio') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section class="py-16 px-4">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="text-2xl font-bold text-[--color-text-primary] mb-3">{{ t('about.contact_title') }}</h2>
        <p class="text-sm text-[--color-text-muted] mb-8 max-w-sm mx-auto">{{ t('about.contact_desc') }}</p>
        <div class="flex items-center justify-center gap-3 flex-wrap">
          <!-- Primary CTA -->
          <a
            href="https://github.com/Xenosword-X/Engineer-Interview-Hub"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm min-h-11"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            {{ t('about.github_label') }}
          </a>
          <!-- Secondary CTA -->
          <a
            href="mailto:swordsgod790626@gmail.com"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[--color-border] text-sm font-medium text-[--color-text-secondary] hover:bg-slate-50 hover:border-slate-300 transition-colors min-h-11"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            {{ t('about.email_label') }}
          </a>
        </div>
      </div>
    </section>

  </div>
</template>
