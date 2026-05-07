# Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 AI Frontend Interview Hub 的完整靜態前台，包含首頁、題目列表、題目詳情頁，支援中英雙語路由與 SSG 部署。

**Architecture:** Nuxt 4 + @nuxt/content v3 以 Markdown 檔案為資料來源，搭配 @nuxtjs/i18n `prefix` 策略自動產生 `/zh/` 與 `/en/` 路由，`nuxi generate` 輸出完全靜態 HTML。

**Tech Stack:** Nuxt 4、Vue 3、TypeScript、@nuxt/content v3、@nuxtjs/i18n v9、Tailwind CSS v4、@tailwindcss/vite、Shiki（內建）、Heroicons、nuxt-simple-sitemap、Vitest + @nuxt/test-utils

---

## File Map

```
nuxt.config.ts                                  — 主設定，載入所有模組
content.config.ts                               — @nuxt/content collection 定義
app.vue                                         — Root，NuxtLayout + NuxtPage
error.vue                                       — 404 錯誤頁
layouts/default.vue                             — 一般頁面（含 Sidebar）
layouts/home.vue                                — 首頁（無 Sidebar）

assets/css/main.css                             — Tailwind v4 入口 + design tokens (@theme)
assets/css/_prose.scss                          — Markdown 內文排版

i18n/zh.json                                    — 中文 UI 字串
i18n/en.json                                    — 英文 UI 字串

content/zh/questions/javascript/event-loop.md   — 範例題目（共 8 題）
content/zh/questions/javascript/closure.md
content/zh/questions/javascript/prototype-chain.md
content/zh/questions/vue/composition-api.md
content/zh/questions/css/box-model.md
content/zh/questions/typescript/generics.md
content/zh/questions/web-vitals/lcp.md
content/zh/questions/http/http-vs-https.md
content/en/questions/...                        — 對應英文版（8 題）

composables/useCategories.ts                    — 分類清單 + 各分類題目數量
composables/useQuestions.ts                     — 題目列表查詢、slug 查詢

components/layout/AppNavbar.vue                 — 頂部 Navbar（含 Hamburger）
components/layout/AppDrawer.vue                 — 手機側抽屜選單
components/layout/AppSidebar.vue                — 左側分類欄（桌面）
components/layout/AppBottomNav.vue              — 手機底部導覽列
components/layout/AppFooter.vue                 — 頁面底部

components/question/CategoryCard.vue            — 首頁分類卡片
components/question/QuestionCard.vue            — 題目列表卡片
components/question/TagBadge.vue                — 技術分類 Badge
components/question/DifficultyBadge.vue         — 難度 Badge
components/question/QuestionToc.vue             — 詳情頁右側 TOC
components/question/AiPractice.vue              — AI 練習佔位區
components/question/QuestionNav.vue             — 上下題導覽

components/ui/AppButton.vue                     — 通用 Button
components/ui/AppCallout.vue                    — Markdown Callout 區塊

pages/index.vue                                 — 首頁 → /zh/, /en/
pages/questions/index.vue                       — 題目列表 → /zh/questions
pages/questions/[slug].vue                      — 題目詳情 → /zh/questions/[slug]
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `nuxt.config.ts`
- Create: `tsconfig.json`
- Create: `package.json`
- Create: `app.vue`

- [ ] **Step 1: 初始化 Nuxt 4 專案**

```bash
cd "c:/Users/User/Documents/GitHub/AI-Powered Frontend Interview"
npx nuxi@latest init . --force
```

選擇選項：TypeScript: Yes，Package manager: npm

- [ ] **Step 2: 安裝所有依賴**

```bash
npm install @nuxt/content @nuxtjs/i18n nuxt-simple-sitemap
npm install -D @tailwindcss/vite tailwindcss @types/node
npm install @nuxt/test-utils vitest @vue/test-utils happy-dom
```

- [ ] **Step 3: 更新 `nuxt.config.ts`**

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },

  modules: [
    '@nuxt/content',
    '@nuxtjs/i18n',
    'nuxt-simple-sitemap',
  ],

  vite: {
    plugins: [
      (await import('@tailwindcss/vite')).default(),
    ],
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

  content: {
    build: {
      markdown: {
        highlight: {
          theme: 'github-light',
          langs: ['javascript', 'typescript', 'vue', 'css', 'html', 'bash', 'json'],
        },
      },
    },
  },

  site: {
    url: 'https://fe-interview-hub.example.com',
    name: 'FE Interview Hub',
  },

  sitemap: {
    strictNuxtContentPaths: true,
  },
})
```

- [ ] **Step 4: 建立 `app.vue`**

```vue
<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 5: 確認開發伺服器啟動**

```bash
npm run dev
```

預期：`http://localhost:3000` 可訪問，無 TypeScript 錯誤

- [ ] **Step 6: Commit**

```bash
git init
git add nuxt.config.ts tsconfig.json package.json package-lock.json app.vue .gitignore
git commit -m "feat: initialise Nuxt 4 project with all modules"
```

---

## Task 2: Tailwind CSS v4 + Design Tokens

**Files:**
- Create: `assets/css/main.css`
- Create: `assets/css/_prose.scss`

- [ ] **Step 1: 建立 `assets/css/main.css`**

```css
/* assets/css/main.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary:        #6366f1;
  --color-primary-light:  #eff6ff;
  --color-primary-border: #e0e7ff;
  --color-surface:        #ffffff;
  --color-bg:             #fafafa;
  --color-text-primary:   #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted:     #94a3b8;
  --color-border:         #e2e8f0;
  --color-border-hover:   #c7d2fe;

  /* Font families */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Spacing (8dp rhythm) */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-12: 48px;
}

/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* Base */
html { font-family: var(--font-sans); }
body { background-color: var(--color-bg); color: var(--color-text-primary); }
code, pre { font-family: var(--font-mono); }

/* Focus ring */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```

- [ ] **Step 2: 確認 Tailwind 類別可用**

在 `app.vue` 暫時加上測試類別，確認樣式套用：

```vue
<template>
  <NuxtLayout>
    <div class="p-4 text-[--color-primary]">Tailwind OK</div>
    <NuxtPage />
  </NuxtLayout>
</template>
```

瀏覽器確認文字顯示 Indigo 色後移除測試 div。

- [ ] **Step 3: Commit**

```bash
git add assets/
git commit -m "feat: add Tailwind CSS v4 with design tokens"
```

---

## Task 3: i18n + Content Config + Sample Markdown

**Files:**
- Create: `i18n/zh.json`
- Create: `i18n/en.json`
- Create: `content.config.ts`
- Create: `content/zh/questions/javascript/event-loop.md`（共 8 題中文）
- Create: `content/en/questions/javascript/event-loop.md`（共 8 題英文）

- [ ] **Step 1: 建立 `i18n/zh.json`**

```json
{
  "nav": {
    "questions": "題庫",
    "ai_interview": "AI 面試",
    "login": "登入",
    "toggle_lang": "EN"
  },
  "home": {
    "badge": "AI 模擬面試 · 即時評分",
    "title": "前端工程師",
    "title_accent": "面試題庫",
    "description": "精選 180+ 道高頻前端面試題，涵蓋 JS、Vue、CSS、TypeScript 等核心領域，搭配 AI 即時診斷你的答題品質。",
    "stat_questions": "精選題目",
    "stat_categories": "技術分類",
    "stat_ai": "即時評分",
    "section_categories": "依分類複習",
    "section_hot": "高頻面試題",
    "view_all": "全部題目 →",
    "cta_title": "用 AI 診斷你的答題品質",
    "cta_desc": "輸入你的答案，AI 即時分析精準度、指出缺漏、給出優化範例",
    "cta_btn": "立即試用 AI 面試"
  },
  "questions": {
    "page_title": "面試題庫",
    "search_placeholder": "搜尋題目...",
    "all_categories": "全部",
    "no_results": "找不到符合條件的題目"
  },
  "detail": {
    "home": "首頁",
    "bookmark": "收藏",
    "share": "分享",
    "ai_practice": "AI 練習作答",
    "toc": "本頁目錄",
    "prev": "上一題",
    "next": "下一題",
    "ai_section_title": "AI 模擬面試",
    "ai_section_desc": "輸入你的答案，AI 即時分析精準度與改進空間",
    "ai_placeholder": "請用自己的話作答...",
    "ai_submit": "送出給 AI 評分",
    "ai_login_hint": "登入後可儲存練習紀錄"
  },
  "difficulty": {
    "basic": "基礎",
    "intermediate": "中階",
    "advanced": "進階"
  },
  "categories": {
    "javascript": "JavaScript",
    "vue": "Vue 3",
    "css": "CSS",
    "typescript": "TypeScript",
    "react": "React",
    "web-vitals": "Web Vitals",
    "browser": "瀏覽器原理",
    "http": "HTTP / 網路"
  },
  "footer": {
    "copyright": "© 2026 FE Interview Hub · MIT License",
    "about": "關於",
    "github": "GitHub"
  },
  "error": {
    "not_found_title": "找不到此頁面",
    "not_found_desc": "您可以從以下分類開始複習",
    "back_home": "回到首頁"
  },
  "bottom_nav": {
    "home": "首頁",
    "questions": "題庫",
    "ai": "AI 面試",
    "profile": "我的"
  }
}
```

- [ ] **Step 2: 建立 `i18n/en.json`**

```json
{
  "nav": {
    "questions": "Questions",
    "ai_interview": "AI Interview",
    "login": "Login",
    "toggle_lang": "ZH"
  },
  "home": {
    "badge": "AI Mock Interview · Instant Feedback",
    "title": "Frontend Engineer",
    "title_accent": "Interview Hub",
    "description": "180+ curated frontend interview questions covering JS, Vue, CSS, TypeScript and more — with AI-powered answer analysis.",
    "stat_questions": "Questions",
    "stat_categories": "Categories",
    "stat_ai": "AI Scoring",
    "section_categories": "Browse by Category",
    "section_hot": "Top Questions",
    "view_all": "All Questions →",
    "cta_title": "Get AI Feedback on Your Answers",
    "cta_desc": "Type your answer and get instant AI analysis: accuracy, missing points, and an optimised example",
    "cta_btn": "Try AI Interview"
  },
  "questions": {
    "page_title": "Question Bank",
    "search_placeholder": "Search questions...",
    "all_categories": "All",
    "no_results": "No questions found"
  },
  "detail": {
    "home": "Home",
    "bookmark": "Bookmark",
    "share": "Share",
    "ai_practice": "AI Practice",
    "toc": "On this page",
    "prev": "Previous",
    "next": "Next",
    "ai_section_title": "AI Mock Interview",
    "ai_section_desc": "Type your answer and get instant AI feedback",
    "ai_placeholder": "Answer in your own words...",
    "ai_submit": "Submit for AI Scoring",
    "ai_login_hint": "Log in to save practice history"
  },
  "difficulty": {
    "basic": "Basic",
    "intermediate": "Intermediate",
    "advanced": "Advanced"
  },
  "categories": {
    "javascript": "JavaScript",
    "vue": "Vue 3",
    "css": "CSS",
    "typescript": "TypeScript",
    "react": "React",
    "web-vitals": "Web Vitals",
    "browser": "Browser Internals",
    "http": "HTTP / Networking"
  },
  "footer": {
    "copyright": "© 2026 FE Interview Hub · MIT License",
    "about": "About",
    "github": "GitHub"
  },
  "error": {
    "not_found_title": "Page Not Found",
    "not_found_desc": "Browse questions by category:",
    "back_home": "Back to Home"
  },
  "bottom_nav": {
    "home": "Home",
    "questions": "Questions",
    "ai": "AI",
    "profile": "Profile"
  }
}
```

- [ ] **Step 3: 建立 `content.config.ts`**

```ts
// content.config.ts
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const questionSchema = z.object({
  slug:       z.string(),
  title:      z.string(),
  category:   z.string(),
  tags:       z.array(z.string()),
  difficulty: z.enum(['basic', 'intermediate', 'advanced']),
})

export default defineContentConfig({
  collections: {
    questions: defineCollection({
      type: 'page',
      source: '**/questions/**/*.md',
      schema: questionSchema,
    }),
  },
})
```

- [ ] **Step 4: 建立中文範例題目（8 個檔案）**

```bash
mkdir -p content/zh/questions/javascript
mkdir -p content/zh/questions/vue
mkdir -p content/zh/questions/css
mkdir -p content/zh/questions/typescript
mkdir -p content/zh/questions/web-vitals
mkdir -p content/zh/questions/http
```

`content/zh/questions/javascript/event-loop.md`:

```markdown
---
slug: event-loop
title: 什麼是 Event Loop？請說明 Call Stack 與 Task Queue 的關係
category: javascript
tags: [javascript, async, event-loop]
difficulty: advanced
---

## 核心概念

JavaScript 是**單執行緒（Single-threaded）**語言，同一時間只能執行一件事。**Event Loop** 是讓 JS 能處理非同步操作的核心機制。

::callout
**重點：** Event Loop 本身不在 JS 引擎中，而是由執行環境（瀏覽器 / Node.js）提供。
::

## 組成部分

### 1. Call Stack（呼叫堆疊）

同步程式碼的執行區域，採用 LIFO 結構。函式被呼叫時推入（push），執行完畢後彈出（pop）。

### 2. Web APIs

處理 `setTimeout`、`fetch`、DOM 事件等非同步操作的瀏覽器 API。

### 3. Task Queue（巨集任務佇列）

非同步回呼完成後排隊的地方，等待 Call Stack 清空後執行。

## 執行順序範例

```js
console.log('1')

setTimeout(() => {
  console.log('3')
}, 0)

Promise.resolve().then(() => {
  console.log('2')
})

// 輸出：1 → 2 → 3
```

## Microtask vs Macrotask

| 類型 | 範例 | 優先順序 |
|---|---|---|
| Microtask | `Promise.then`、`queueMicrotask` | 高（Call Stack 清空後立即執行） |
| Macrotask | `setTimeout`、`setInterval` | 低（Microtask 清空後執行） |
```

`content/zh/questions/javascript/closure.md`:

```markdown
---
slug: closure
title: 解釋 Closure（閉包）的概念與實際應用場景
category: javascript
tags: [javascript, closure, scope]
difficulty: basic
---

## 什麼是 Closure？

Closure 是指**函式能記住並存取其詞法作用域（Lexical Scope）的能力**，即使該函式在其原始作用域之外執行。

## 基本範例

```js
function makeCounter() {
  let count = 0
  return function () {
    count++
    return count
  }
}

const counter = makeCounter()
counter() // 1
counter() // 2
counter() // 3
```

內部函式「記住」了外部函式的 `count` 變數，即使 `makeCounter` 已執行完畢。

## 常見應用場景

1. **資料私有化**：模擬私有變數
2. **函式工廠**：根據參數建立特定行為的函式
3. **防抖 / 節流**：利用閉包保存計時器 ID
```

`content/zh/questions/javascript/prototype-chain.md`:

```markdown
---
slug: prototype-chain
title: 什麼是 Prototype Chain（原型鏈）？JavaScript 繼承如何運作？
category: javascript
tags: [javascript, prototype, oop]
difficulty: intermediate
---

## 原型鏈概念

JavaScript 的每個物件都有一個隱藏屬性 `[[Prototype]]`，指向其原型物件。當存取一個屬性找不到時，JS 引擎會沿著原型鏈向上查找，直到 `null` 為止。

## 範例

```js
const arr = [1, 2, 3]

// arr 本身沒有 map 方法
// 但 arr.__proto__ === Array.prototype
// Array.prototype 有 map 方法
arr.map(x => x * 2) // [2, 4, 6]

// 原型鏈：arr → Array.prototype → Object.prototype → null
```

## ES6 Class 與原型鏈

`class` 語法是原型繼承的語法糖：

```js
class Animal {
  speak() { return 'sound' }
}

class Dog extends Animal {
  speak() { return 'woof' }
}

const d = new Dog()
Object.getPrototypeOf(d) === Dog.prototype // true
Object.getPrototypeOf(Dog.prototype) === Animal.prototype // true
```
```

`content/zh/questions/vue/composition-api.md`:

```markdown
---
slug: composition-api
title: Vue 3 的 Composition API 相較 Options API 有哪些優勢？
category: vue
tags: [vue, composition-api, vue3]
difficulty: intermediate
---

## Composition API 核心優勢

### 1. 邏輯複用更容易

Options API 依賴 Mixin，容易造成命名衝突與來源不明。Composition API 透過 **Composable** 函式封裝邏輯，清晰且可測試：

```ts
// composables/useCounter.ts
export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}
```

### 2. TypeScript 支援更完整

`setup()` 中的變數類型可直接推斷，不需要複雜的類型聲明。

### 3. 相關邏輯集中

Options API 把相同功能的程式碼分散在 `data`、`methods`、`computed`、`watch` 中。Composition API 讓相關邏輯集中在一起，大型元件更易維護。

## 什麼時候用 Options API？

- 小型元件、簡單頁面
- 團隊熟悉度考量
- 兩者可在同一專案混用
```

`content/zh/questions/css/box-model.md`:

```markdown
---
slug: box-model
title: 解釋 CSS Box Model，`box-sizing` 有什麼差異？
category: css
tags: [css, box-model, layout]
difficulty: basic
---

## CSS Box Model

每個 HTML 元素都是一個盒子，由四層組成（由內到外）：

1. **Content**：內容區域（文字、圖片）
2. **Padding**：內容與邊框的間距
3. **Border**：邊框
4. **Margin**：元素與外部的間距

## `box-sizing` 差異

| 值 | `width` 的計算範圍 | 常用情境 |
|---|---|---|
| `content-box`（預設） | 只含 Content | CSS 規格預設 |
| `border-box` | Content + Padding + Border | 現代開發首選 |

```css
/* 推薦：全局套用 border-box */
*, *::before, *::after {
  box-sizing: border-box;
}
```

使用 `border-box` 後，設定 `width: 200px` 就是元素實際佔用的寬度，不會因為 padding 而撐大。
```

`content/zh/questions/typescript/generics.md`:

```markdown
---
slug: generics
title: TypeScript Generics（泛型）是什麼？請舉例說明用途
category: typescript
tags: [typescript, generics, types]
difficulty: intermediate
---

## 什麼是 Generics？

Generics 讓函式、介面、類別能接受**類型參數**，使程式碼在保持類型安全的同時具備複用性。

## 基本範例

```ts
// 不用 generics：只能處理 number
function identity(arg: number): number {
  return arg
}

// 用 generics：可處理任何類型
function identity<T>(arg: T): T {
  return arg
}

identity<string>('hello') // 類型：string
identity<number>(42)      // 類型：number
```

## 實用場景：API 回應包裝

```ts
interface ApiResponse<T> {
  data: T
  error: string | null
  status: number
}

// 使用時明確指定資料類型
type UserResponse = ApiResponse<{ id: number; name: string }>
```
```

`content/zh/questions/web-vitals/lcp.md`:

```markdown
---
slug: lcp
title: 什麼是 LCP？如何優化以達到 Core Web Vitals 標準？
category: web-vitals
tags: [web-vitals, performance, seo, lcp]
difficulty: advanced
---

## 什麼是 LCP？

**Largest Contentful Paint（最大內容繪製）** 測量頁面主要內容載入完成的時間。Google Core Web Vitals 標準：

| 分數 | LCP 時間 |
|---|---|
| 良好 | ≤ 2.5s |
| 需改善 | 2.5s – 4.0s |
| 差 | > 4.0s |

## LCP 的觸發元素

- `<img>` 圖片
- `<video>` 封面圖
- 含背景圖的區塊元素
- 大型文字區塊

## 優化策略

### 1. 預載關鍵資源

```html
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">
```

### 2. 使用 WebP / AVIF 格式

```html
<picture>
  <source type="image/avif" srcset="/hero.avif">
  <source type="image/webp" srcset="/hero.webp">
  <img src="/hero.jpg" alt="Hero" width="1200" height="600">
</picture>
```

### 3. 避免 render-blocking 資源

- CSS：Critical CSS inline，非關鍵 CSS `media="print"`
- 字體：`font-display: swap`
```

`content/zh/questions/http/http-vs-https.md`:

```markdown
---
slug: http-vs-https
title: HTTP 與 HTTPS 的差異為何？TLS 握手流程是什麼？
category: http
tags: [http, https, tls, security, network]
difficulty: intermediate
---

## HTTP vs HTTPS

| 特性 | HTTP | HTTPS |
|---|---|---|
| 全名 | HyperText Transfer Protocol | HTTP + TLS/SSL |
| 預設埠 | 80 | 443 |
| 加密 | 無 | TLS 加密 |
| 資料完整性 | 無保護 | MAC 驗證 |
| 身份驗證 | 無 | 憑證驗證 |
| SEO | 較低排名 | Google 給予加分 |

## TLS 握手（TLS 1.3 簡化版）

1. **Client Hello**：Client 發送支援的 TLS 版本、加密套件清單
2. **Server Hello**：Server 選擇加密套件，回傳憑證（公鑰）
3. **Key Exchange**：雙方透過 ECDHE 協議建立共享金鑰
4. **Finished**：雙方確認握手完成，開始加密通訊

TLS 1.3 相較 1.2 減少了一個 Round Trip，握手更快（0-RTT 支援恢復連線）。
```

- [ ] **Step 5: 複製 8 個英文版題目**

```bash
mkdir -p content/en/questions/javascript
mkdir -p content/en/questions/vue
mkdir -p content/en/questions/css
mkdir -p content/en/questions/typescript
mkdir -p content/en/questions/web-vitals
mkdir -p content/en/questions/http
```

`content/en/questions/javascript/event-loop.md`:

```markdown
---
slug: event-loop
title: What is the Event Loop? Explain the relationship between Call Stack and Task Queue
category: javascript
tags: [javascript, async, event-loop]
difficulty: advanced
---

## Core Concept

JavaScript is a **single-threaded** language. The **Event Loop** is the mechanism that allows JS to handle asynchronous operations.

::callout
**Key point:** The Event Loop is provided by the runtime environment (browser / Node.js), not the JS engine itself.
::

## Components

### 1. Call Stack

The execution area for synchronous code (LIFO). Functions are pushed on call and popped on completion.

### 2. Web APIs

Browser-provided APIs handling `setTimeout`, `fetch`, DOM events etc.

### 3. Task Queue (Macrotask Queue)

Where async callbacks queue after completing, waiting for the Call Stack to empty.

## Execution Order Example

```js
console.log('1')

setTimeout(() => {
  console.log('3')
}, 0)

Promise.resolve().then(() => {
  console.log('2')
})

// Output: 1 → 2 → 3
```

## Microtask vs Macrotask

| Type | Examples | Priority |
|---|---|---|
| Microtask | `Promise.then`, `queueMicrotask` | High (runs immediately after Call Stack empties) |
| Macrotask | `setTimeout`, `setInterval` | Low (runs after all Microtasks) |
```

（其餘 7 個英文題目使用相同結構翻譯，slug 相同）

- [ ] **Step 6: 確認 Content 可查詢**

在臨時頁面測試：

```bash
npm run dev
```

在 `pages/index.vue` 暫時加入：

```vue
<script setup>
const { data } = await useAsyncData('test', () =>
  queryCollection('questions').all()
)
console.log(data.value?.length) // 應顯示 16（中英各 8 題）
</script>
```

確認 console 顯示 16 後移除測試程式碼。

- [ ] **Step 7: Commit**

```bash
git add i18n/ content/ content.config.ts
git commit -m "feat: add i18n strings and 8 sample questions (zh+en)"
```

---

## Task 4: Badge + Button UI Components

**Files:**
- Create: `components/question/TagBadge.vue`
- Create: `components/question/DifficultyBadge.vue`
- Create: `components/ui/AppButton.vue`
- Create: `components/ui/AppCallout.vue`
- Create: `tests/components/TagBadge.test.ts`

- [ ] **Step 1: 撰寫 TagBadge 測試**

```ts
// tests/components/TagBadge.test.ts
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import TagBadge from '~/components/question/TagBadge.vue'

describe('TagBadge', () => {
  it('renders the category label', async () => {
    const wrapper = await mountSuspended(TagBadge, {
      props: { category: 'javascript' },
      global: {
        mocks: { $t: (key: string) => ({ 'categories.javascript': 'JavaScript' })[key] ?? key }
      }
    })
    expect(wrapper.text()).toContain('JavaScript')
  })

  it('applies category-specific colour class', async () => {
    const wrapper = await mountSuspended(TagBadge, {
      props: { category: 'vue' },
      global: { mocks: { $t: (k: string) => k } }
    })
    expect(wrapper.classes().join(' ')).toMatch(/vue/)
  })
})
```

- [ ] **Step 2: 執行測試，確認失敗**

```bash
npx vitest run tests/components/TagBadge.test.ts
```

預期：FAIL（TagBadge 尚未建立）

- [ ] **Step 3: 建立 `components/question/TagBadge.vue`**

```vue
<!-- components/question/TagBadge.vue -->
<script setup lang="ts">
const props = defineProps<{ category: string }>()

const colourMap: Record<string, string> = {
  javascript:  'bg-yellow-100 text-yellow-800',
  vue:         'bg-green-100  text-green-800',
  css:         'bg-pink-100   text-pink-800',
  typescript:  'bg-blue-100   text-blue-800',
  react:       'bg-sky-100    text-sky-800',
  'web-vitals':'bg-purple-100 text-purple-800',
  browser:     'bg-orange-100 text-orange-800',
  http:        'bg-cyan-100   text-cyan-800',
}

const colour = computed(() =>
  colourMap[props.category] ?? 'bg-slate-100 text-slate-700'
)
</script>

<template>
  <span
    :class="['inline-block text-[10px] font-semibold px-2 py-0.5 rounded', colour]"
  >
    {{ $t(`categories.${category}`) }}
  </span>
</template>
```

- [ ] **Step 4: 建立 `components/question/DifficultyBadge.vue`**

```vue
<!-- components/question/DifficultyBadge.vue -->
<script setup lang="ts">
defineProps<{ difficulty: 'basic' | 'intermediate' | 'advanced' }>()

const colourMap = {
  basic:        'bg-slate-100  text-slate-600',
  intermediate: 'bg-indigo-50  text-indigo-700',
  advanced:     'bg-violet-100 text-violet-800',
}
</script>

<template>
  <span
    :class="['inline-block text-[10px] font-semibold px-2 py-0.5 rounded', colourMap[difficulty]]"
  >
    {{ $t(`difficulty.${difficulty}`) }}
  </span>
</template>
```

- [ ] **Step 5: 建立 `components/ui/AppButton.vue`**

```vue
<!-- components/ui/AppButton.vue -->
<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  href?: string
}>()

const variantClass = {
  primary:   'bg-[--color-primary] text-white hover:bg-indigo-600',
  secondary: 'bg-[--color-primary-light] text-[--color-primary] border border-[--color-primary-border] hover:bg-indigo-100',
  ghost:     'text-[--color-text-secondary] hover:bg-slate-100',
}

const sizeClass = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
}
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :class="[
      'inline-flex items-center gap-1.5 font-medium rounded-[7px] transition-colors duration-150',
      'focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:outline-none',
      'min-h-[44px] lg:min-h-[36px]',
      variantClass[variant ?? 'primary'],
      sizeClass[size ?? 'md'],
    ]"
  >
    <slot />
  </component>
</template>
```

- [ ] **Step 6: 建立 `components/ui/AppCallout.vue`**

```vue
<!-- components/ui/AppCallout.vue -->
<template>
  <div class="border-l-[3px] border-[--color-primary] bg-[--color-primary-light] rounded-r-lg px-4 py-3 my-4 text-sm text-indigo-900 leading-relaxed">
    <slot />
  </div>
</template>
```

- [ ] **Step 7: 執行測試確認通過**

```bash
npx vitest run tests/components/TagBadge.test.ts
```

預期：PASS

- [ ] **Step 8: Commit**

```bash
git add components/question/TagBadge.vue components/question/DifficultyBadge.vue
git add components/ui/AppButton.vue components/ui/AppCallout.vue
git add tests/
git commit -m "feat: add TagBadge, DifficultyBadge, AppButton, AppCallout components"
```

---

## Task 5: Layout Components

**Files:**
- Create: `components/layout/AppNavbar.vue`
- Create: `components/layout/AppDrawer.vue`
- Create: `components/layout/AppSidebar.vue`
- Create: `components/layout/AppBottomNav.vue`
- Create: `components/layout/AppFooter.vue`
- Create: `composables/useCategories.ts`

- [ ] **Step 1: 建立 `composables/useCategories.ts`**

```ts
// composables/useCategories.ts
export interface Category {
  key: string
  icon: string   // SVG path data（Heroicons outline）
  count: number
}

export const CATEGORIES: Omit<Category, 'count'>[] = [
  { key: 'javascript',  icon: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z' },
  { key: 'vue',         icon: 'M12 2l10 6v8l-10 6L2 16V8l10-6z' },
  { key: 'css',         icon: 'M4 3h16l-1.5 14L12 20l-6.5-3L4 3z' },
  { key: 'typescript',  icon: 'M3 3h18v18H3V3zm9 9h3v6h-3v-6zm0-4h3v3h-3V8z' },
  { key: 'react',       icon: 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' },
  { key: 'web-vitals',  icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { key: 'browser',     icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 3v13h16V7H4zm0-3v2h16V4H4z' },
  { key: 'http',        icon: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.142 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' },
]

export function useCategories() {
  const { locale } = useI18n()

  const { data: questions } = useAsyncData(
    `questions-meta-${locale.value}`,
    () => queryCollection('questions')
      .where('path', 'LIKE', `/${locale.value}/%`)
      .select('category')
      .all()
  )

  const categoriesWithCount = computed<Category[]>(() =>
    CATEGORIES.map(cat => ({
      ...cat,
      count: questions.value?.filter(q => q.category === cat.key).length ?? 0,
    }))
  )

  return { categories: categoriesWithCount }
}
```

- [ ] **Step 2: 建立 `components/layout/AppNavbar.vue`**

```vue
<!-- components/layout/AppNavbar.vue -->
<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n()
const localePath = useLocalePath()
const isDrawerOpen = ref(false)

const otherLocale = computed(() =>
  locales.value.find(l => l.code !== locale.value)
)

function toggleLocale() {
  const next = otherLocale.value?.code
  if (next) setLocale(next)
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-white border-b border-[--color-border] h-14 flex items-center px-4 lg:px-6 gap-3">
    <!-- Logo -->
    <NuxtLink :to="localePath('/')" class="flex items-center gap-2 shrink-0">
      <div class="w-7 h-7 rounded-[7px] bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center" aria-hidden="true">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      </div>
      <span class="text-sm font-bold text-[--color-text-primary] hidden sm:block">FE Interview Hub</span>
    </NuxtLink>

    <div class="flex-1" />

    <!-- Desktop nav links -->
    <nav class="hidden lg:flex items-center gap-1">
      <NuxtLink
        :to="localePath('/questions')"
        class="text-sm text-[--color-text-secondary] px-3 py-2 rounded-md hover:bg-slate-100 transition-colors"
      >
        {{ t('nav.questions') }}
      </NuxtLink>
      <NuxtLink
        :to="localePath('/')"
        class="text-sm text-[--color-text-secondary] px-3 py-2 rounded-md hover:bg-slate-100 transition-colors"
      >
        {{ t('nav.ai_interview') }}
      </NuxtLink>
    </nav>

    <div class="hidden lg:block w-px h-5 bg-[--color-border]" aria-hidden="true" />

    <!-- Language toggle -->
    <button
      @click="toggleLocale"
      class="text-xs font-semibold text-[--color-primary] px-2.5 py-1.5 border border-[--color-primary-border] rounded-md bg-[--color-primary-light] hover:bg-indigo-100 transition-colors min-h-[44px] lg:min-h-[36px]"
      :aria-label="`Switch to ${otherLocale?.name}`"
    >
      {{ t('nav.toggle_lang') }}
    </button>

    <!-- Desktop login -->
    <AppButton variant="primary" size="sm" class="hidden lg:inline-flex">
      {{ t('nav.login') }}
    </AppButton>

    <!-- Mobile hamburger -->
    <button
      @click="isDrawerOpen = true"
      class="lg:hidden p-2 rounded-md text-[--color-text-secondary] hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
      :aria-label="'Open menu'"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
      </svg>
    </button>
  </header>

  <!-- Mobile Drawer -->
  <AppDrawer :open="isDrawerOpen" @close="isDrawerOpen = false" />
</template>
```

- [ ] **Step 3: 建立 `components/layout/AppDrawer.vue`**

```vue
<!-- components/layout/AppDrawer.vue -->
<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/40 lg:hidden"
        @click="emit('close')"
        aria-hidden="true"
      />
    </Transition>

    <!-- Drawer panel -->
    <Transition name="slide-right">
      <div
        v-if="open"
        class="fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl lg:hidden flex flex-col"
        role="dialog"
        :aria-label="'Navigation menu'"
      >
        <div class="flex items-center justify-between px-5 h-14 border-b border-[--color-border]">
          <span class="font-bold text-sm text-[--color-text-primary]">FE Interview Hub</span>
          <button
            @click="emit('close')"
            class="p-2 rounded-md text-[--color-text-secondary] hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav class="flex-1 px-4 py-6 flex flex-col gap-1">
          <NuxtLink
            :to="localePath('/questions')"
            @click="emit('close')"
            class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-[--color-text-secondary] hover:bg-slate-100 hover:text-[--color-text-primary]"
          >
            {{ t('nav.questions') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/')"
            @click="emit('close')"
            class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-[--color-text-secondary] hover:bg-slate-100 hover:text-[--color-text-primary]"
          >
            {{ t('nav.ai_interview') }}
          </NuxtLink>
        </nav>
        <div class="px-4 pb-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <AppButton variant="primary" class="w-full justify-center">
            {{ t('nav.login') }}
          </AppButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.25s ease-out; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }
</style>
```

- [ ] **Step 4: 建立 `components/layout/AppSidebar.vue`**

```vue
<!-- components/layout/AppSidebar.vue -->
<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { categories } = useCategories()

const activeCategory = computed(() => (route.query.tag as string) ?? '')
</script>

<template>
  <aside class="hidden lg:block w-[220px] shrink-0 border-r border-[--color-border] bg-[--color-bg] self-start sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
    <div class="py-5 px-0">
      <p class="text-[10px] font-semibold text-[--color-text-muted] uppercase tracking-wider px-4 mb-2">
        {{ t('questions.all_categories') }}
      </p>
      <NuxtLink
        :to="localePath('/questions')"
        :class="[
          'flex items-center gap-2 text-xs px-4 py-2 border-l-2 transition-colors',
          !activeCategory
            ? 'border-[--color-primary] bg-[--color-primary-light] text-[--color-primary] font-semibold'
            : 'border-transparent text-[--color-text-secondary] hover:bg-slate-100 hover:text-[--color-text-primary]'
        ]"
      >
        {{ t('questions.all_categories') }}
        <span class="ml-auto text-[10px] text-[--color-text-muted]">
          {{ categories.reduce((s, c) => s + c.count, 0) }}
        </span>
      </NuxtLink>

      <NuxtLink
        v-for="cat in categories"
        :key="cat.key"
        :to="`${localePath('/questions')}?tag=${cat.key}`"
        :class="[
          'flex items-center gap-2 text-xs px-4 py-2 border-l-2 transition-colors',
          activeCategory === cat.key
            ? 'border-[--color-primary] bg-[--color-primary-light] text-[--color-primary] font-semibold'
            : 'border-transparent text-[--color-text-secondary] hover:bg-slate-100 hover:text-[--color-text-primary]'
        ]"
      >
        {{ t(`categories.${cat.key}`) }}
        <span class="ml-auto text-[10px] text-[--color-text-muted]">{{ cat.count }}</span>
      </NuxtLink>
    </div>
  </aside>
</template>
```

- [ ] **Step 5: 建立 `components/layout/AppBottomNav.vue`**

```vue
<!-- components/layout/AppBottomNav.vue -->
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

function isActive(path: string) {
  return route.path === localePath(path)
}
</script>

<template>
  <nav
    class="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[--color-border] flex items-center justify-around h-14"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
  >
    <NuxtLink
      v-for="item in [
        { path: '/', icon: 'M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25', label: t(\'bottom_nav.home\') },
        { path: \'/questions\', icon: \'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25\', label: t(\'bottom_nav.questions\') },
        { path: \'/\', icon: \'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z\', label: t(\'bottom_nav.ai\') },
        { path: \'/\', icon: \'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z\', label: t(\'bottom_nav.profile\') },
      ]"
      :key="item.label"
      :to="localePath(item.path)"
      :class="[
        'flex flex-col items-center gap-0.5 py-2 px-4 min-w-[44px]',
        isActive(item.path) ? 'text-[--color-primary]' : 'text-[--color-text-muted]'
      ]"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
      </svg>
      <span class="text-[9px] font-medium">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>
```

- [ ] **Step 6: 建立 `components/layout/AppFooter.vue`**

```vue
<!-- components/layout/AppFooter.vue -->
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <footer class="border-t border-[--color-border] px-6 py-4 flex items-center justify-between">
    <p class="text-xs text-[--color-text-muted]">{{ t('footer.copyright') }}</p>
    <div class="flex gap-4">
      <a href="#" class="text-xs text-[--color-text-muted] hover:text-[--color-text-secondary]">{{ t('footer.about') }}</a>
      <a href="https://github.com" target="_blank" rel="noopener" class="text-xs text-[--color-text-muted] hover:text-[--color-text-secondary]">{{ t('footer.github') }}</a>
    </div>
  </footer>
</template>
```

- [ ] **Step 7: Commit**

```bash
git add composables/ components/layout/
git commit -m "feat: add layout components (Navbar, Drawer, Sidebar, BottomNav, Footer)"
```

---

## Task 6: Layouts

**Files:**
- Create: `layouts/default.vue`
- Create: `layouts/home.vue`
- Create: `error.vue`

- [ ] **Step 1: 建立 `layouts/default.vue`（含 Sidebar）**

```vue
<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    <div class="flex flex-1">
      <AppSidebar />
      <main class="flex-1 min-w-0 pb-16 lg:pb-0">
        <slot />
      </main>
    </div>
    <AppFooter />
    <AppBottomNav />
  </div>
</template>
```

- [ ] **Step 2: 建立 `layouts/home.vue`（無 Sidebar）**

```vue
<!-- layouts/home.vue -->
<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    <main class="flex-1 pb-16 lg:pb-0">
      <slot />
    </main>
    <AppFooter />
    <AppBottomNav />
  </div>
</template>
```

- [ ] **Step 3: 建立 `error.vue`**

```vue
<!-- error.vue -->
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
defineProps<{ error: { statusCode: number; message: string } }>()
const { categories } = useCategories()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    <main class="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <p class="text-7xl font-bold text-[--color-primary] mb-4">404</p>
      <h1 class="text-2xl font-bold text-[--color-text-primary] mb-2">{{ t('error.not_found_title') }}</h1>
      <p class="text-[--color-text-secondary] mb-8">{{ t('error.not_found_desc') }}</p>
      <div class="flex flex-wrap justify-center gap-2 mb-8">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.key"
          :to="`${localePath('/questions')}?tag=${cat.key}`"
          class="text-xs px-3 py-1.5 border border-[--color-border] rounded-full hover:border-[--color-primary] hover:text-[--color-primary] transition-colors"
        >
          {{ $t(`categories.${cat.key}`) }}
        </NuxtLink>
      </div>
      <AppButton :href="localePath('/')">{{ t('error.back_home') }}</AppButton>
    </main>
    <AppFooter />
  </div>
</template>
```

- [ ] **Step 4: 確認 layout 切換正常**

```bash
npm run dev
```

訪問 `http://localhost:3000/zh/`，確認 Navbar 顯示，無 console 錯誤。

- [ ] **Step 5: Commit**

```bash
git add layouts/ error.vue
git commit -m "feat: add default/home layouts and 404 error page"
```

---

## Task 7: Homepage

**Files:**
- Modify: `pages/index.vue`
- Create: `components/question/CategoryCard.vue`

- [ ] **Step 1: 建立 `components/question/CategoryCard.vue`**

```vue
<!-- components/question/CategoryCard.vue -->
<script setup lang="ts">
import type { Category } from '~/composables/useCategories'
defineProps<{ category: Category }>()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    :to="`${localePath('/questions')}?tag=${category.key}`"
    class="group border border-[--color-border] rounded-[10px] p-4 bg-white hover:border-[--color-border-hover] hover:shadow-[0_4px_16px_rgba(99,102,241,0.08)] transition-all duration-150 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:outline-none"
  >
    <div class="w-9 h-9 rounded-[9px] flex items-center justify-center mb-2.5" :class="`bg-${category.key === 'javascript' ? 'yellow' : category.key === 'vue' ? 'green' : 'slate'}-100`">
      <svg class="w-5 h-5 text-[--color-text-secondary]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" :d="category.icon" />
      </svg>
    </div>
    <p class="text-sm font-semibold text-[--color-text-primary] mb-0.5">{{ $t(`categories.${category.key}`) }}</p>
    <p class="text-[11px] text-[--color-text-muted]">{{ category.count }} {{ $t('questions.page_title') }}</p>
  </NuxtLink>
</template>
```

- [ ] **Step 2: 建立 `pages/index.vue`**

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'home' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { categories } = useCategories()

// 取全部題目（當前語系）
const { data: allQuestions } = await useAsyncData(
  `all-questions-${locale.value}`,
  () => queryCollection('questions')
    .where('path', 'LIKE', `/${locale.value}/%`)
    .select('slug', 'title', 'category', 'tags', 'difficulty')
    .all()
)

// 高頻題目：取前 5 題
const hotQuestions = computed(() => allQuestions.value?.slice(0, 5) ?? [])

// SEO
const siteUrl = 'https://fe-interview-hub.example.com'
useSeoMeta({
  title: `${t('home.title_accent')} | FE Interview Hub`,
  description: t('home.description'),
  ogTitle: `${t('home.title_accent')} | FE Interview Hub`,
  ogDescription: t('home.description'),
  ogUrl: `${siteUrl}/${locale.value}/`,
  twitterCard: 'summary_large_image',
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
    children: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'FE Interview Hub',
      url: `${siteUrl}/${locale.value}/`,
      description: t('home.description'),
      inLanguage: locale.value === 'zh' ? 'zh-TW' : 'en-US',
    })
  }]
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="py-12 px-6 text-center bg-gradient-to-b from-slate-50 to-white border-b border-[--color-border]">
      <span class="inline-flex items-center gap-1.5 bg-[--color-primary-light] text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-[--color-primary-border]">
        <span class="w-1.5 h-1.5 rounded-full bg-[--color-primary]" aria-hidden="true" />
        {{ t('home.badge') }}
      </span>
      <h1 class="text-[32px] font-bold text-[--color-text-primary] leading-tight mb-3">
        {{ t('home.title') }}<br>
        <span class="text-[--color-primary]">{{ t('home.title_accent') }}</span>
      </h1>
      <p class="text-[15px] text-[--color-text-secondary] leading-relaxed max-w-md mx-auto mb-7">
        {{ t('home.description') }}
      </p>
      <div class="flex justify-center gap-8">
        <div class="text-center">
          <p class="text-[22px] font-bold text-[--color-text-primary]">180+</p>
          <p class="text-xs text-[--color-text-muted] mt-0.5">{{ t('home.stat_questions') }}</p>
        </div>
        <div class="text-center">
          <p class="text-[22px] font-bold text-[--color-text-primary]">4</p>
          <p class="text-xs text-[--color-text-muted] mt-0.5">{{ t('home.stat_categories') }}</p>
        </div>
        <div class="text-center">
          <p class="text-[22px] font-bold text-[--color-primary]">AI</p>
          <p class="text-xs text-[--color-text-muted] mt-0.5">{{ t('home.stat_ai') }}</p>
        </div>
      </div>
    </section>

    <div class="max-w-5xl mx-auto px-6">
      <!-- Category Grid -->
      <section class="py-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-[--color-text-primary]">{{ t('home.section_categories') }}</h2>
          <NuxtLink :to="localePath('/questions')" class="text-xs text-[--color-primary] font-medium hover:underline">
            {{ t('home.view_all') }}
          </NuxtLink>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <CategoryCard v-for="cat in categories" :key="cat.key" :category="cat" />
        </div>
      </section>

      <hr class="border-[--color-border]">

      <!-- Hot Questions -->
      <section class="py-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-[--color-text-primary]">{{ t('home.section_hot') }}</h2>
          <NuxtLink :to="localePath('/questions')" class="text-xs text-[--color-primary] font-medium hover:underline">
            {{ t('home.view_all') }}
          </NuxtLink>
        </div>
        <div class="divide-y divide-[--color-border]">
          <NuxtLink
            v-for="(q, idx) in hotQuestions"
            :key="q.slug"
            :to="localePath(`/questions/${q.slug}`)"
            class="flex items-center gap-3 py-3.5 hover:bg-slate-50 -mx-3 px-3 rounded-lg transition-colors group"
          >
            <span class="text-xs font-bold text-indigo-200 min-w-[24px]">{{ String(idx + 1).padStart(2, '0') }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[--color-text-primary] group-hover:text-[--color-primary] truncate">{{ q.title }}</p>
              <div class="flex gap-1.5 mt-1">
                <TagBadge :category="q.category" />
                <DifficultyBadge :difficulty="q.difficulty" />
              </div>
            </div>
            <svg class="w-4 h-4 text-[--color-text-muted] shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </NuxtLink>
        </div>
      </section>
    </div>

    <!-- AI CTA Banner -->
    <section class="mx-6 mb-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
      <div class="flex-1">
        <h2 class="text-base font-bold text-white mb-1">{{ t('home.cta_title') }}</h2>
        <p class="text-sm text-white/75 leading-relaxed">{{ t('home.cta_desc') }}</p>
      </div>
      <NuxtLink
        :to="localePath('/questions/event-loop')"
        class="shrink-0 bg-white text-[--color-primary] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors focus-visible:ring-2 focus-visible:ring-white"
      >
        {{ t('home.cta_btn') }}
      </NuxtLink>
    </section>
  </div>
</template>
```

- [ ] **Step 3: 確認首頁渲染正常**

```bash
npm run dev
```

訪問 `http://localhost:3000/zh/`，確認：
- Hero 顯示
- 8 個分類卡片顯示
- 5 道高頻題目顯示
- 語系切換正常（`/zh/` ↔ `/en/`）

- [ ] **Step 4: Commit**

```bash
git add pages/index.vue components/question/CategoryCard.vue
git commit -m "feat: add homepage with hero, category grid, hot questions, AI CTA"
```

---

## Task 8: Question List Page

**Files:**
- Create: `pages/questions/index.vue`
- Create: `components/question/QuestionCard.vue`
- Create: `composables/useQuestions.ts`

- [ ] **Step 1: 建立 `composables/useQuestions.ts`**

```ts
// composables/useQuestions.ts
export interface QuestionMeta {
  slug: string
  title: string
  category: string
  tags: string[]
  difficulty: 'basic' | 'intermediate' | 'advanced'
  path: string
}

export function useQuestions() {
  const { locale } = useI18n()
  const route = useRoute()

  const { data: questions, pending } = useAsyncData(
    `questions-${locale.value}`,
    () => queryCollection('questions')
      .where('path', 'LIKE', `/${locale.value}/%`)
      .select('slug', 'title', 'category', 'tags', 'difficulty', 'path')
      .all() as Promise<QuestionMeta[]>
  )

  const activeTag = computed(() => (route.query.tag as string) ?? '')

  const filtered = computed(() => {
    if (!questions.value) return []
    if (!activeTag.value) return questions.value
    return questions.value.filter(q => q.category === activeTag.value)
  })

  return { questions, filtered, activeTag, pending }
}
```

- [ ] **Step 2: 建立 `components/question/QuestionCard.vue`**

```vue
<!-- components/question/QuestionCard.vue -->
<script setup lang="ts">
import type { QuestionMeta } from '~/composables/useQuestions'
defineProps<{ question: QuestionMeta }>()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    :to="localePath(`/questions/${question.slug}`)"
    class="group block border border-[--color-border] rounded-[10px] p-4 bg-white hover:border-[--color-border-hover] hover:shadow-sm transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:outline-none"
  >
    <h3 class="text-sm font-semibold text-[--color-text-primary] leading-snug mb-2 group-hover:text-[--color-primary] transition-colors">
      {{ question.title }}
    </h3>
    <div class="flex items-center gap-1.5 flex-wrap">
      <TagBadge :category="question.category" />
      <DifficultyBadge :difficulty="question.difficulty" />
    </div>
  </NuxtLink>
</template>
```

- [ ] **Step 3: 建立 `pages/questions/index.vue`**

```vue
<!-- pages/questions/index.vue -->
<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { filtered, activeTag } = useQuestions()
const { categories } = useCategories()

const siteUrl = 'https://fe-interview-hub.example.com'

useSeoMeta({
  title: `${t('questions.page_title')} | FE Interview Hub`,
  description: t('home.description'),
  ogTitle: `${t('questions.page_title')} | FE Interview Hub`,
  ogUrl: `${siteUrl}/${locale.value}/questions`,
})

// canonical 不含 ?tag= 以避免重複索引
useHead({
  link: [
    { rel: 'canonical', href: `${siteUrl}/${locale.value}/questions` },
    { rel: 'alternate', hreflang: 'zh-TW', href: `${siteUrl}/zh/questions` },
    { rel: 'alternate', hreflang: 'en-US', href: `${siteUrl}/en/questions` },
  ]
})
</script>

<template>
  <div class="flex flex-col lg:flex-row min-h-full">
    <!-- Mobile Tag Bar -->
    <div class="lg:hidden overflow-x-auto border-b border-[--color-border] bg-white">
      <div class="flex gap-2 px-4 py-2.5 min-w-max">
        <NuxtLink
          :to="localePath('/questions')"
          :class="[
            'text-[11px] font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors',
            !activeTag
              ? 'bg-[--color-primary-light] text-[--color-primary] border-[--color-primary-border]'
              : 'border-[--color-border] text-[--color-text-secondary] bg-white'
          ]"
        >
          {{ t('questions.all_categories') }}
        </NuxtLink>
        <NuxtLink
          v-for="cat in categories"
          :key="cat.key"
          :to="`${localePath('/questions')}?tag=${cat.key}`"
          :class="[
            'text-[11px] font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors',
            activeTag === cat.key
              ? 'bg-[--color-primary-light] text-[--color-primary] border-[--color-primary-border]'
              : 'border-[--color-border] text-[--color-text-secondary] bg-white'
          ]"
        >
          {{ t(`categories.${cat.key}`) }}
        </NuxtLink>
      </div>
    </div>

    <!-- Question List -->
    <div class="flex-1 px-4 lg:px-8 py-6 max-w-2xl">
      <h1 class="text-lg font-bold text-[--color-text-primary] mb-4">
        {{ activeTag ? t(`categories.${activeTag}`) : t('questions.page_title') }}
        <span class="text-sm font-normal text-[--color-text-muted] ml-2">{{ filtered.length }}</span>
      </h1>

      <p v-if="filtered.length === 0" class="text-sm text-[--color-text-muted]">
        {{ t('questions.no_results') }}
      </p>

      <div class="grid gap-3">
        <QuestionCard v-for="q in filtered" :key="q.slug" :question="q" />
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 4: 確認列表頁正常**

```bash
npm run dev
```

訪問 `http://localhost:3000/zh/questions`，確認：
- 所有 8 道中文題目顯示
- 點擊側欄分類（如 JavaScript）正確過濾題目
- 手機版 Tag Bar 可橫向滑動

- [ ] **Step 5: Commit**

```bash
git add composables/useQuestions.ts components/question/QuestionCard.vue pages/questions/index.vue
git commit -m "feat: add question list page with category filter"
```

---

## Task 9: Question Detail Page

**Files:**
- Create: `components/question/QuestionToc.vue`
- Create: `components/question/AiPractice.vue`
- Create: `components/question/QuestionNav.vue`
- Create: `pages/questions/[slug].vue`

- [ ] **Step 1: 建立 `components/question/QuestionToc.vue`**

```vue
<!-- components/question/QuestionToc.vue -->
<script setup lang="ts">
const props = defineProps<{ links: Array<{ id: string; text: string; depth: number }> }>()
const { t } = useI18n()
const activeId = ref('')

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter(e => e.isIntersecting)
      if (visible.length > 0) {
        activeId.value = visible[0].target.id
      }
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
  )

  props.links.forEach(link => {
    const el = document.getElementById(link.id)
    if (el) observer.observe(el)
  })

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <nav class="hidden lg:block w-[180px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 pl-4 border-l border-[--color-border]">
    <p class="text-[10px] font-semibold text-[--color-text-muted] uppercase tracking-wider mb-3">
      {{ t('detail.toc') }}
    </p>
    <a
      v-for="link in links"
      :key="link.id"
      :href="`#${link.id}`"
      :class="[
        'block text-[11px] py-1 pl-2 border-l-2 transition-colors mb-1',
        link.depth === 3 ? 'ml-2' : '',
        activeId === link.id
          ? 'border-[--color-primary] text-[--color-primary] font-medium'
          : 'border-transparent text-[--color-text-muted] hover:text-[--color-text-secondary]'
      ]"
    >
      {{ link.text }}
    </a>
  </nav>
</template>
```

- [ ] **Step 2: 建立 `components/question/AiPractice.vue`**

```vue
<!-- components/question/AiPractice.vue -->
<script setup lang="ts">
const { t } = useI18n()
const answer = ref('')

function handleSubmit() {
  // Foundation 階段不接 API，顯示提示
  alert(t('detail.ai_login_hint'))
}
</script>

<template>
  <div class="mt-8 border border-[--color-primary-border] rounded-xl overflow-hidden bg-indigo-50/30">
    <div class="px-5 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500">
      <p class="text-sm font-bold text-white">✦ {{ t('detail.ai_section_title') }}</p>
      <p class="text-xs text-white/75 mt-0.5">{{ t('detail.ai_section_desc') }}</p>
    </div>
    <textarea
      v-model="answer"
      :placeholder="t('detail.ai_placeholder')"
      rows="4"
      class="w-full px-5 py-4 text-sm text-[--color-text-secondary] bg-white border-b border-[--color-primary-border] focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-inset placeholder:text-[--color-text-muted] resize-none"
    />
    <div class="flex items-center justify-between px-5 py-3">
      <p class="text-xs text-[--color-text-muted]">{{ t('detail.ai_login_hint') }}</p>
      <button
        @click="handleSubmit"
        class="text-sm font-semibold text-white bg-[--color-primary] px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--color-primary]"
      >
        {{ t('detail.ai_submit') }}
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 3: 建立 `components/question/QuestionNav.vue`**

```vue
<!-- components/question/QuestionNav.vue -->
<script setup lang="ts">
import type { QuestionMeta } from '~/composables/useQuestions'
defineProps<{
  prev: QuestionMeta | null
  next: QuestionMeta | null
}>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="flex gap-3 mt-8 pt-6 border-t border-[--color-border]">
    <NuxtLink
      v-if="prev"
      :to="localePath(`/questions/${prev.slug}`)"
      class="flex-1 border border-[--color-border] rounded-[9px] px-4 py-3 hover:border-[--color-border-hover] transition-colors focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:outline-none"
    >
      <p class="text-[10px] text-[--color-text-muted] mb-1">← {{ t('detail.prev') }}</p>
      <p class="text-sm font-medium text-[--color-text-primary] line-clamp-1">{{ prev.title }}</p>
    </NuxtLink>
    <div v-else class="flex-1" />

    <NuxtLink
      v-if="next"
      :to="localePath(`/questions/${next.slug}`)"
      class="flex-1 border border-[--color-border] rounded-[9px] px-4 py-3 text-right hover:border-[--color-border-hover] transition-colors focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:outline-none"
    >
      <p class="text-[10px] text-[--color-text-muted] mb-1">{{ t('detail.next') }} →</p>
      <p class="text-sm font-medium text-[--color-text-primary] line-clamp-1">{{ next.title }}</p>
    </NuxtLink>
    <div v-else class="flex-1" />
  </div>
</template>
```

- [ ] **Step 4: 建立 `pages/questions/[slug].vue`**

```vue
<!-- pages/questions/[slug].vue -->
<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const slug = route.params.slug as string

// 取得當前題目
const { data: question } = await useAsyncData(
  `question-${locale.value}-${slug}`,
  () => queryCollection('questions')
    .where('path', 'LIKE', `/${locale.value}/%`)
    .where('slug', '==', slug)
    .first()
)

if (!question.value) {
  throw createError({ statusCode: 404, statusMessage: 'Question not found' })
}

// 取全部題目用於 Prev/Next
const { data: allQuestions } = await useAsyncData(
  `all-questions-nav-${locale.value}`,
  () => queryCollection('questions')
    .where('path', 'LIKE', `/${locale.value}/%`)
    .select('slug', 'title', 'category', 'tags', 'difficulty', 'path')
    .all()
)

const currentIndex = computed(() =>
  allQuestions.value?.findIndex(q => q.slug === slug) ?? -1
)
const prevQuestion = computed(() =>
  currentIndex.value > 0 ? (allQuestions.value?.[currentIndex.value - 1] ?? null) : null
)
const nextQuestion = computed(() =>
  currentIndex.value < (allQuestions.value?.length ?? 0) - 1
    ? (allQuestions.value?.[currentIndex.value + 1] ?? null)
    : null
)

// TOC
const tocLinks = computed(() =>
  (question.value?.body?.toc?.links ?? []) as Array<{ id: string; text: string; depth: number }>
)

// SEO
const siteUrl = 'https://fe-interview-hub.example.com'
const description = question.value?.body?.children
  ?.flatMap((n: any) => n.type === 'element' ? [n] : [])
  ?.find((n: any) => n.tag === 'p')
  ?.children?.map((c: any) => c.value)?.join('') ?? ''

useSeoMeta({
  title: `${question.value?.title} | FE Interview Hub`,
  description: description.slice(0, 150),
  ogTitle: question.value?.title,
  ogDescription: description.slice(0, 150),
  ogUrl: `${siteUrl}/${locale.value}/questions/${slug}`,
  twitterCard: 'summary',
})

useHead({
  link: [
    { rel: 'canonical', href: `${siteUrl}/${locale.value}/questions/${slug}` },
    { rel: 'alternate', hreflang: 'zh-TW', href: `${siteUrl}/zh/questions/${slug}` },
    { rel: 'alternate', hreflang: 'en-US', href: `${siteUrl}/en/questions/${slug}` },
  ],
  script: [{
    type: 'application/ld+json',
    children: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      name: question.value?.title,
      description: description.slice(0, 150),
      inLanguage: locale.value === 'zh' ? 'zh-TW' : 'en-US',
      url: `${siteUrl}/${locale.value}/questions/${slug}`,
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
        <NuxtLink :to="`${localePath('/questions')}?tag=${question.category}`" class="hover:text-[--color-primary]">
          {{ t(`categories.${question.category}`) }}
        </NuxtLink>
        <span>›</span>
        <span class="text-[--color-text-secondary] font-medium truncate max-w-[200px]">{{ question.title }}</span>
      </nav>

      <!-- Header -->
      <header class="mb-6 pb-6 border-b border-[--color-border]">
        <div class="flex items-center gap-2 mb-3">
          <TagBadge :category="question.category" />
          <DifficultyBadge :difficulty="question.difficulty" />
        </div>
        <h1 class="text-[22px] font-bold text-[--color-text-primary] leading-snug mb-4">
          {{ question.title }}
        </h1>
        <div class="flex items-center gap-2">
          <!-- Bookmark (placeholder) -->
          <button
            class="flex items-center gap-1.5 text-xs text-[--color-text-secondary] px-3 py-2 border border-[--color-border] rounded-[7px] hover:border-[--color-border-hover] hover:text-[--color-primary] transition-colors min-h-[44px]"
            :aria-label="t('detail.bookmark')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            {{ t('detail.bookmark') }}
          </button>
          <!-- Share -->
          <button
            class="flex items-center gap-1.5 text-xs text-[--color-text-secondary] px-3 py-2 border border-[--color-border] rounded-[7px] hover:border-[--color-border-hover] transition-colors min-h-[44px]"
            :aria-label="t('detail.share')"
            @click="navigator.share?.({ title: question.title, url: $route.fullPath })"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            {{ t('detail.share') }}
          </button>
          <!-- AI Practice CTA -->
          <a
            href="#ai-practice"
            class="ml-auto flex items-center gap-1.5 text-xs font-semibold text-white bg-[--color-primary] px-4 py-2 rounded-[7px] hover:bg-indigo-600 transition-colors min-h-[44px]"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
            {{ t('detail.ai_practice') }}
          </a>
        </div>
      </header>

      <!-- Markdown content -->
      <div class="prose prose-slate max-w-none
        prose-headings:font-bold prose-headings:text-[--color-text-primary]
        prose-h2:text-base prose-h2:mt-6 prose-h2:mb-2.5
        prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-2
        prose-p:text-sm prose-p:text-[--color-text-secondary] prose-p:leading-relaxed
        prose-li:text-sm prose-li:text-[--color-text-secondary]
        prose-code:text-[11px] prose-code:font-mono prose-code:bg-slate-100 prose-code:text-indigo-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-slate-50 prose-pre:border prose-pre:border-[--color-border] prose-pre:rounded-lg prose-pre:text-[12px]
        prose-table:text-sm prose-th:text-[--color-text-primary] prose-td:text-[--color-text-secondary]
      ">
        <ContentRenderer :value="question" :components="{ callout: resolveComponent('AppCallout') }" />
      </div>

      <!-- AI Practice section -->
      <div id="ai-practice">
        <AiPractice />
      </div>

      <!-- Mobile sticky AI input -->
      <div class="lg:hidden fixed bottom-14 inset-x-0 z-20 bg-white border-t border-[--color-border] px-4 py-2.5 flex gap-2">
        <input
          type="text"
          :placeholder="t('detail.ai_placeholder')"
          class="flex-1 text-sm bg-slate-50 border border-[--color-border] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
        />
        <a
          href="#ai-practice"
          class="w-11 h-11 bg-[--color-primary] rounded-lg flex items-center justify-center text-white shrink-0"
          aria-label="Open AI practice"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
          </svg>
        </a>
      </div>

      <!-- Prev/Next -->
      <QuestionNav :prev="prevQuestion" :next="nextQuestion" />
    </article>

    <!-- Right TOC -->
    <QuestionToc :links="tocLinks" />
  </div>
</template>
```

- [ ] **Step 5: 確認詳情頁正常**

```bash
npm run dev
```

訪問 `http://localhost:3000/zh/questions/event-loop`，確認：
- 題目內容 + 程式碼高亮正確渲染
- Breadcrumb 顯示
- TOC 顯示且滾動時高亮
- AI 練習區出現
- Prev/Next 導覽顯示

- [ ] **Step 6: Commit**

```bash
git add components/question/ pages/questions/
git commit -m "feat: add question detail page with TOC, AI practice placeholder, prev/next nav"
```

---

## Task 10: SEO + Sitemap + Final Build

**Files:**
- Modify: `nuxt.config.ts`（sitemap 設定）

- [ ] **Step 1: 確認 sitemap 設定**

`nuxt.config.ts` 已在 Task 1 加入 `nuxt-simple-sitemap`，確認 `site.url` 正確設定：

```ts
site: {
  url: 'https://fe-interview-hub.example.com',
  name: 'FE Interview Hub',
},
sitemap: {
  strictNuxtContentPaths: true,
},
```

- [ ] **Step 2: 確認 Open Graph 圖片佔位**

在 `nuxt.config.ts` 加入全域預設 OG：

```ts
app: {
  head: {
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { property: 'og:image', content: 'https://fe-interview-hub.example.com/og-image.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  },
},
```

- [ ] **Step 3: 執行 SSG 建置**

```bash
npm run generate
```

預期：
- 無 TypeScript 錯誤
- 無 Nuxt 建置警告
- `.output/public/` 包含 `/zh/`、`/en/`、`/zh/questions/`、`/zh/questions/event-loop/` 等靜態目錄

- [ ] **Step 4: 本地預覽 SSG 輸出**

```bash
npx serve .output/public
```

訪問 `http://localhost:3000/zh/`，確認所有頁面正常。

- [ ] **Step 5: 驗收標準逐項確認**

```bash
# 確認 sitemap 存在
ls .output/public/sitemap.xml

# 確認中英路由靜態輸出
ls .output/public/zh/questions/
ls .output/public/en/questions/
```

手動確認：
- [ ] `/zh/` 首頁正常，語系切換到 `/en/`
- [ ] `/zh/questions` 列表頁，分類篩選正常
- [ ] `/zh/questions/event-loop` 詳情頁，程式碼高亮正常
- [ ] 手機 375px 無橫向 scroll
- [ ] sitemap.xml 包含中英題目 URL

- [ ] **Step 6: 最終 commit**

```bash
git add .
git commit -m "feat: foundation complete — SSG, i18n, content, all pages, SEO"
```

---

## Self-Review

**Spec coverage check:**

| Spec 需求 | 對應 Task |
|---|---|
| Nuxt 4 + TS + @nuxt/content + i18n | Task 1、3 |
| Tailwind v4 + design tokens | Task 2 |
| Markdown + frontmatter 題庫 | Task 3 |
| TagBadge、DifficultyBadge、AppButton | Task 4 |
| Navbar（Desktop + Hamburger）、Sidebar、Footer | Task 5 |
| BottomNav（Mobile）| Task 5 |
| Default / Home layouts | Task 6 |
| 404 error.vue | Task 6 |
| 首頁 Hero + 分類卡片 + 高頻題 + CTA | Task 7 |
| 題目列表 + Tag Filter | Task 8 |
| 題目詳情頁 3 欄佈局 | Task 9 |
| TOC + IntersectionObserver | Task 9 |
| AI Practice 佔位 | Task 9 |
| Prev/Next 導覽 | Task 9 |
| 響應式（Mobile sticky AI input）| Task 9 |
| SEO：useSeoMeta、JSON-LD、hreflang | Task 7、8、9 |
| Sitemap | Task 10 |
| SSG `nuxi generate` | Task 10 |
| 驗收標準 | Task 10 |

**無未涵蓋的 spec 需求。**
