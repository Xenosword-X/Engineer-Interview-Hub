# Homepage Copy Repositioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition homepage copy from frontend-only interview prep to a broader multi-role engineer interview prep platform.

**Architecture:** Keep the implementation copy-only by updating existing `i18n` keys already consumed by `pages/index.vue`. Avoid template or routing changes so the behavior stays stable while the homepage messaging changes immediately.

**Tech Stack:** Nuxt 3, `@nuxtjs/i18n`, JSON locale files, PowerShell verification

---

### Task 1: Update homepage Traditional Chinese copy

**Files:**
- Modify: `i18n/i18n/zh.json`

- [ ] **Step 1: Inspect existing homepage keys**

Run: `rg -n '"home":|"badge"|"title"|"description"|"seo_title"|"seo_description"' i18n/i18n/zh.json`
Expected: existing `home.*` keys are present

- [ ] **Step 2: Replace frontend-only homepage positioning**

Update the `home` strings so hero, feature cards, CTA labels, and SEO copy reflect multi-role engineer interview preparation.

- [ ] **Step 3: Verify the modified file stays valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('i18n/i18n/zh.json','utf8')); console.log('zh ok')"`
Expected: `zh ok`

### Task 2: Update homepage English copy

**Files:**
- Modify: `i18n/i18n/en.json`

- [ ] **Step 1: Inspect existing homepage keys**

Run: `rg -n '"home":|"badge"|"title"|"description"|"seo_title"|"seo_description"' i18n/i18n/en.json`
Expected: existing `home.*` keys are present

- [ ] **Step 2: Replace frontend-only homepage positioning**

Update the `home` strings so hero, feature cards, CTA labels, and SEO copy reflect multi-role engineer interview preparation.

- [ ] **Step 3: Verify the modified file stays valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('i18n/i18n/en.json','utf8')); console.log('en ok')"`
Expected: `en ok`

### Task 3: Verify homepage references and legacy wording

**Files:**
- Inspect: `pages/index.vue`
- Inspect: `i18n/i18n/zh.json`
- Inspect: `i18n/i18n/en.json`

- [ ] **Step 1: Confirm homepage still reads the same translation keys**

Run: `rg -n "home\\.(badge|title|title_accent|description|cta_practice_title|cta_interview_title|hero_cta_primary|hero_cta_secondary|seo_title|seo_description)" pages/index.vue`
Expected: references remain unchanged

- [ ] **Step 2: Confirm homepage SEO and hero copy no longer mention frontend-only positioning**

Run: `rg -n "frontend interview|前端面試|前端工程師|frontend engineer" i18n/i18n/zh.json i18n/i18n/en.json`
Expected: no matches inside homepage positioning strings
