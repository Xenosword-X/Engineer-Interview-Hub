# Nuxt 4 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將專案從 Nuxt 3.x（含 compatibilityVersion: 4 flag）正式升級至 Nuxt 4.x，完成 `app/` 目錄遷移。

**Architecture:** 由於已設定 `future: { compatibilityVersion: 4 }`，所有行為層面的破壞性變更已生效，本次升級以結構遷移為主：將 `pages/`、`components/` 等應用程式檔案移入 `app/` 子目錄（Nuxt 4 的預設 srcDir），然後 bump nuxt 套件版本。`server/`、`public/`、`shared/` 維持在根目錄。

**Tech Stack:** Nuxt 4.4.5、Vue 3、TypeScript、@nuxtjs/i18n v9、@nuxtjs/supabase v2、@nuxtjs/sitemap v8、Tailwind CSS v4、Cloudflare Pages

---

## 檔案異動對照表

| 現在位置 | 移動後位置 | 說明 |
|---|---|---|
| `app.vue` | `app/app.vue` | 根元件 |
| `error.vue` | `app/error.vue` | 錯誤頁 |
| `pages/**` | `app/pages/**` | 路由頁面（11 個檔案） |
| `components/**` | `app/components/**` | UI 元件（19 個檔案） |
| `composables/**` | `app/composables/**` | Composable（7 個） |
| `layouts/**` | `app/layouts/**` | Layout（3 個） |
| `middleware/auth.global.ts` | `app/middleware/auth.global.ts` | 全域 middleware |
| `plugins/google-fonts.client.ts` | `app/plugins/google-fonts.client.ts` | Plugin |
| `utils/seo.ts` | `app/utils/seo.ts` | Util |
| `assets/**` | `app/assets/**` | CSS + 圖片 |
| `i18n/i18n/en.json` | `app/i18n/en.json` | 翻譯檔（整平雙層目錄） |
| `i18n/i18n/zh.json` | `app/i18n/zh.json` | 翻譯檔（整平雙層目錄） |
| `server/**` | `server/**` | ✅ 不動 |
| `public/**` | `public/**` | ✅ 不動 |
| `shared/**` | `shared/**` | ✅ 不動（Nuxt 4 原生支援） |
| `nuxt.config.ts` | `nuxt.config.ts` | 修改（移除 future flag、更新 css 路徑） |
| `vitest.config.ts` | `vitest.config.ts` | 修改（rootDir 不變，但驗證 env） |

---

## Task 1: Bump Nuxt 套件版本

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 更新 package.json 的 nuxt 版本**

將 `nuxt` 從 `"^3.17.1"` 改為 `"^4.4.5"`, 同時更新 `@nuxt/test-utils` 以確保 Nuxt 4 相容：

```json
{
  "dependencies": {
    "@nuxt/image": "^2.0.0",
    "@nuxtjs/i18n": "^9.5.3",
    "@nuxtjs/sitemap": "^8.0.13",
    "@nuxtjs/supabase": "^2.0.5",
    "marked": "^18.0.1",
    "nuxt": "^4.4.5",
    "openai": "^6.34.0",
    "vue": "^3.5.13",
    "vue-router": "^4.5.0"
  },
  "devDependencies": {
    "@nuxt/test-utils": "^3.17.1",
    "@playwright/test": "^1.59.1",
    "@resvg/resvg-js": "^2.6.2",
    "@tailwindcss/typography": "^0.5.19",
    "@tailwindcss/vite": "^4.1.4",
    "@types/node": "^22.14.1",
    "@vue/test-utils": "^2.4.6",
    "happy-dom": "^17.4.4",
    "tailwindcss": "^4.1.4",
    "typescript": "^5.8.3",
    "vitest": "^3.1.1"
  }
}
```

- [ ] **Step 2: 安裝依賴**

```powershell
npm install
```

預期輸出包含 `nuxt@4.x.x added` 或 `changed X packages`。若有 peer dependency 警告，逐一檢視後確認不影響功能。

- [ ] **Step 3: 確認 Nuxt 版本正確**

```powershell
npx nuxt --version
```

預期輸出：`Nuxt 4.x.x`

- [ ] **Step 4: Commit**

```powershell
git add package.json package-lock.json
git commit -m "chore: bump nuxt to v4"
```

---

## Task 2: 建立 `app/` 目錄並遷移應用程式檔案

**Files:**
- Create: `app/` 目錄及所有子目錄

> **注意：** 此 Task 執行大量檔案搬移，全部完成後一起 commit。

- [ ] **Step 1: 建立 app/ 目錄結構**

```powershell
New-Item -ItemType Directory -Force -Path app/pages/admin/questions/[id]
New-Item -ItemType Directory -Force -Path app/pages/auth
New-Item -ItemType Directory -Force -Path app/pages/bookmarks
New-Item -ItemType Directory -Force -Path app/pages/interview
New-Item -ItemType Directory -Force -Path app/pages/questions
New-Item -ItemType Directory -Force -Path app/components/admin
New-Item -ItemType Directory -Force -Path app/components/auth
New-Item -ItemType Directory -Force -Path app/components/bookmark
New-Item -ItemType Directory -Force -Path app/components/interview
New-Item -ItemType Directory -Force -Path app/components/layout
New-Item -ItemType Directory -Force -Path app/components/question
New-Item -ItemType Directory -Force -Path app/components/ui
New-Item -ItemType Directory -Force -Path app/composables
New-Item -ItemType Directory -Force -Path app/layouts
New-Item -ItemType Directory -Force -Path app/middleware
New-Item -ItemType Directory -Force -Path app/plugins
New-Item -ItemType Directory -Force -Path app/utils
New-Item -ItemType Directory -Force -Path app/assets/css
New-Item -ItemType Directory -Force -Path app/assets/img
New-Item -ItemType Directory -Force -Path app/i18n
```

- [ ] **Step 2: 移動根元件與錯誤頁**

```powershell
Move-Item app.vue app/app.vue
Move-Item error.vue app/error.vue
```

- [ ] **Step 3: 移動 pages/**

```powershell
Move-Item pages/index.vue app/pages/index.vue
Move-Item pages/about.vue app/pages/about.vue
Move-Item "pages/admin/login.vue" "app/pages/admin/login.vue"
Move-Item "pages/admin/questions/index.vue" "app/pages/admin/questions/index.vue"
Move-Item "pages/admin/questions/new.vue" "app/pages/admin/questions/new.vue"
Move-Item "pages/admin/questions/[id]/edit.vue" "app/pages/admin/questions/[id]/edit.vue"
Move-Item "pages/auth/callback.vue" "app/pages/auth/callback.vue"
Move-Item "pages/bookmarks/index.vue" "app/pages/bookmarks/index.vue"
Move-Item "pages/interview/index.vue" "app/pages/interview/index.vue"
Move-Item "pages/interview/history.vue" "app/pages/interview/history.vue"
Move-Item "pages/interview/[id].vue" "app/pages/interview/[id].vue"
Move-Item "pages/questions/index.vue" "app/pages/questions/index.vue"
Move-Item "pages/questions/[slug].vue" "app/pages/questions/[slug].vue"
Remove-Item pages -Recurse -Force
```

- [ ] **Step 4: 移動 components/**

```powershell
Move-Item components/admin/MarkdownEditor.vue app/components/admin/MarkdownEditor.vue
Move-Item components/auth/LoginButton.vue app/components/auth/LoginButton.vue
Move-Item components/auth/UserMenu.vue app/components/auth/UserMenu.vue
Move-Item components/bookmark/BookmarkButton.vue app/components/bookmark/BookmarkButton.vue
Move-Item components/bookmark/BookmarkCard.vue app/components/bookmark/BookmarkCard.vue
Move-Item components/interview/InterviewAborted.vue app/components/interview/InterviewAborted.vue
Move-Item components/interview/InterviewRecorder.vue app/components/interview/InterviewRecorder.vue
Move-Item components/interview/InterviewStage.vue app/components/interview/InterviewStage.vue
Move-Item components/interview/InterviewStatusBar.vue app/components/interview/InterviewStatusBar.vue
Move-Item components/interview/InterviewSummary.vue app/components/interview/InterviewSummary.vue
Move-Item components/interview/InterviewTranscript.vue app/components/interview/InterviewTranscript.vue
Move-Item components/interview/InterviewTurnCard.vue app/components/interview/InterviewTurnCard.vue
Move-Item components/interview/SetupForm.vue app/components/interview/SetupForm.vue
Move-Item components/layout/AppBottomNav.vue app/components/layout/AppBottomNav.vue
Move-Item components/layout/AppDrawer.vue app/components/layout/AppDrawer.vue
Move-Item components/layout/AppFooter.vue app/components/layout/AppFooter.vue
Move-Item components/layout/AppNavbar.vue app/components/layout/AppNavbar.vue
Move-Item components/layout/AppSidebar.vue app/components/layout/AppSidebar.vue
Move-Item components/question/AiPractice.vue app/components/question/AiPractice.vue
Move-Item components/question/CategoryCard.vue app/components/question/CategoryCard.vue
Move-Item components/question/DifficultyBadge.vue app/components/question/DifficultyBadge.vue
Move-Item components/question/QuestionCard.vue app/components/question/QuestionCard.vue
Move-Item components/question/QuestionNav.vue app/components/question/QuestionNav.vue
Move-Item components/question/QuestionToc.vue app/components/question/QuestionToc.vue
Move-Item components/question/TagBadge.vue app/components/question/TagBadge.vue
Move-Item components/ui/AppButton.vue app/components/ui/AppButton.vue
Move-Item components/ui/AppCallout.vue app/components/ui/AppCallout.vue
Move-Item components/ui/AppSkeletonCard.vue app/components/ui/AppSkeletonCard.vue
Remove-Item components -Recurse -Force
```

- [ ] **Step 5: 移動 composables/、layouts/、middleware/、plugins/、utils/**

```powershell
Move-Item composables/useAudioRecorder.ts app/composables/useAudioRecorder.ts
Move-Item composables/useBookmarks.ts app/composables/useBookmarks.ts
Move-Item composables/useCategories.ts app/composables/useCategories.ts
Move-Item composables/useInterviewSession.ts app/composables/useInterviewSession.ts
Move-Item composables/useQuestions.ts app/composables/useQuestions.ts
Move-Item composables/useSiteUrl.ts app/composables/useSiteUrl.ts
Move-Item composables/useVoiceInput.ts app/composables/useVoiceInput.ts
Remove-Item composables -Recurse -Force

Move-Item layouts/admin.vue app/layouts/admin.vue
Move-Item layouts/default.vue app/layouts/default.vue
Move-Item layouts/home.vue app/layouts/home.vue
Remove-Item layouts -Recurse -Force

Move-Item middleware/auth.global.ts app/middleware/auth.global.ts
Remove-Item middleware -Recurse -Force

Move-Item plugins/google-fonts.client.ts app/plugins/google-fonts.client.ts
Remove-Item plugins -Recurse -Force

Move-Item utils/seo.ts app/utils/seo.ts
Remove-Item utils -Recurse -Force
```

- [ ] **Step 6: 移動 assets/**

```powershell
Move-Item assets/css/main.css app/assets/css/main.css
Move-Item assets/img/LOGO.png app/assets/img/LOGO.png
Remove-Item assets -Recurse -Force
```

- [ ] **Step 7: Commit**

```powershell
git add app/ pages components composables layouts middleware plugins utils assets app.vue error.vue
git commit -m "chore: migrate app files to app/ directory (Nuxt 4 srcDir)"
```

---

## Task 3: 遷移 i18n 翻譯檔

**Files:**
- Move: `i18n/i18n/en.json` → `app/i18n/en.json`
- Move: `i18n/i18n/zh.json` → `app/i18n/zh.json`
- Delete: `i18n/` 舊目錄

> **背景：** 目前翻譯檔因歷史原因位於 `i18n/i18n/`（雙層）。Nuxt 4 的 srcDir 為 `app/`，`langDir: 'i18n/'` 將解析到 `app/i18n/`，藉此整平目錄結構。

- [ ] **Step 1: 移動翻譯檔**

```powershell
Move-Item i18n/i18n/en.json app/i18n/en.json
Move-Item i18n/i18n/zh.json app/i18n/zh.json
Remove-Item i18n -Recurse -Force
```

- [ ] **Step 2: Commit**

```powershell
git add app/i18n/ i18n/
git commit -m "chore: flatten i18n translation files into app/i18n/"
```

---

## Task 4: 更新 nuxt.config.ts

**Files:**
- Modify: `nuxt.config.ts`

- [ ] **Step 1: 更新 nuxt.config.ts**

將整個 `nuxt.config.ts` 替換為以下內容（主要變更：移除 `future` block、更新 `css` alias）：

```typescript
// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'

const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://engineer-interview-hub.pages.dev'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  // future: { compatibilityVersion: 4 } — 已移除，Nuxt 4 預設即為此行為

  modules: [
    '@nuxt/image',
    '@nuxtjs/supabase',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
  ],

  components: {
    dirs: [{ path: '~/components', pathPrefix: false }],
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@supabase')) return 'vendor-supabase'
            if (id.includes('node_modules/openai')) return 'vendor-openai'
          },
        },
      },
    },
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
      exclude:  ['/**'],
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
      htmlAttrs: { lang: 'zh-TW' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
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
```

- [ ] **Step 2: Commit**

```powershell
git add nuxt.config.ts
git commit -m "chore: remove future.compatibilityVersion flag (Nuxt 4 default)"
```

---

## Task 5: 更新測試設定

**Files:**
- Modify: `vitest.config.ts`

- [ ] **Step 1: 確認 vitest.config.ts rootDir**

Nuxt 4 的 rootDir 仍為 `.`（專案根目錄），`vitest.config.ts` 的 `rootDir: '.'` 設定不需要更改。但需要確認 test-utils 能正確找到 `app/` 下的模組：

```typescript
// vitest.config.ts — 不需要修改，保持原狀
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        rootDir: '.',
        overrides: {
          i18n: {
            defaultLocale: 'en',
          },
        },
      },
    },
    env: {
      NUXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
      NUXT_PUBLIC_SUPABASE_KEY: 'placeholder-anon-key',
    },
  },
})
```

如果確認無需修改，跳過此 Task。

---

## Task 6: 執行 dev server 驗證

- [ ] **Step 1: 清除 Nuxt 快取**

```powershell
Remove-Item .nuxt -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue
```

- [ ] **Step 2: 啟動開發伺服器**

```powershell
npx nuxt dev
```

預期輸出：
```
Nuxt 4.x.x with Nitro x.x.x
  ➜ Local:    http://localhost:3000/
```

若出現錯誤，依照 Step 3 的 troubleshooting 指引處理。

- [ ] **Step 3: 檢查常見錯誤**

| 錯誤訊息 | 原因 | 解法 |
|---|---|---|
| `Cannot find module '~/...'` | 有元件用 `../` 相對路徑 import | 改用 `~/` alias |
| `[i18n] langDir not found` | 翻譯檔路徑錯誤 | 確認 `app/i18n/zh.json` 存在 |
| `Missing supabaseKey` | env var 未設定 | 確認 `.env` 存在 |
| `[vite] Cannot resolve...` | 移檔後 import 路徑殘留 | 搜尋 `from '../composables'` 等相對路徑 |

- [ ] **Step 4: 手動測試核心路由**

在瀏覽器中確認以下路由正常渲染：
- `http://localhost:3000/` — 首頁
- `http://localhost:3000/questions` — 題庫列表
- `http://localhost:3000/about` — 關於頁

---

## Task 7: 執行測試套件

- [ ] **Step 1: 執行 Vitest 單元測試**

```powershell
npx vitest run
```

預期：全部通過（或顯示與遷移無關的既有失敗）。

- [ ] **Step 2: 執行 middleware 測試**

```powershell
npx vitest run --config vitest.middleware.config.ts
```

預期：全部通過。

- [ ] **Step 3: 若測試失敗，確認是否為路徑問題**

最常見的失敗是 test 檔中的 import 路徑仍指向舊位置。搜尋殘留路徑：

```powershell
Select-String -Path "tests/**/*.ts" -Pattern "from '\.\./composables|from '\.\./components|from '\.\./utils" -Recurse
```

若有命中，將 import 路徑改為 `~/composables/...`（Nuxt alias）或調整為正確的相對路徑。

- [ ] **Step 4: 確認 build 成功**

```powershell
npx nuxt build
```

預期：build 完成無 error（Cloudflare Pages nitro preset）。

- [ ] **Step 5: Final commit**

```powershell
git add -A
git commit -m "chore: verify Nuxt 4 migration - all tests pass, build succeeds"
```

---

## 完成後確認清單

- [ ] `nuxt --version` 顯示 `4.x.x`
- [ ] `future: { compatibilityVersion: 4 }` 已從 `nuxt.config.ts` 移除
- [ ] `app/` 目錄下有 `pages/`、`components/`、`composables/`、`layouts/`、`middleware/`、`plugins/`、`utils/`、`assets/`、`i18n/`、`app.vue`、`error.vue`
- [ ] 根目錄僅剩 `server/`、`public/`、`shared/`、`nuxt.config.ts`、`package.json`、`tsconfig.json`、`tests/`、`docs/`、`scripts/`、`supabase/`
- [ ] `npx vitest run` 全部通過
- [ ] `npx nuxt build` 成功
