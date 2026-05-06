// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'

const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://fe-interview-hub.example.com'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },

  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
  ],

  components: {
    dirs: [{ path: '~/components', pathPrefix: false }],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  css: ['~/assets/css/main.css'],

  i18n: {
    strategy: 'prefix',
    defaultLocale: 'zh',
    locales: [
      { code: 'zh', language: 'zh-TW', name: '繁體中文', file: 'zh.json' },
      { code: 'en', language: 'en-US', name: 'English',   file: 'en.json' },
    ],
    langDir: 'i18n/',
    detectBrowserLanguage: false,
  },

  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY || 'placeholder-anon-key',
    redirectOptions: {
      login:    '/auth/callback',
      callback: '/auth/callback',
      exclude:  ['/*'],
    },
  },

  runtimeConfig: {
    openaiApiKey:    process.env.OPENAI_API_KEY  ?? '',
    dailyAiLimit:    process.env.DAILY_AI_LIMIT  ?? '10',
    bypassEmails:    process.env.BYPASS_EMAILS   ?? '',
    sessionSecret:   process.env.SESSION_SECRET  ?? '',
    backendAccount:  process.env.BACKEND_ACCOUNT ?? '',
    backendPassword: process.env.BACKEND_PASSWORD ?? '',
    public: {
      siteUrl: SITE_URL,
    },
  },

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    },
  },

  site: {
    url: SITE_URL,
    name: 'Engineer Interview Hub',
  },

  sitemap: {
    exclude: ['/admin/**', '/bookmarks/**', '/auth/**'],
  },

  nitro: {
    preset: 'cloudflare-pages',
  },
})
