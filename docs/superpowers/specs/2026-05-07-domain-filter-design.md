# Domain Filter for Question Bank — Design Spec

**Date:** 2026-05-07  
**Status:** Approved

## Summary

Add a domain-level filter layer (前端 / 後端 / 資料工程 / DevOps) to the question bank page. Currently the left sidebar lists all 26+ categories flat, which is cluttered. Adding a domain tab strip at the top of the sidebar lets users narrow down to a domain first, then pick a specific category.

---

## URL Structure

```
/questions                           → 全部（無 domain 無 tag）
/questions?domain=frontend           → 前端全部題目
/questions?domain=frontend&tag=vue   → 前端 > Vue 3
/questions?tag=vue                   → 直接指定 tag（不帶 domain，向下相容）
```

Rules:
- Clicking a domain tab sets `?domain=X` and clears `?tag=`.
- Clicking a category link sets `?tag=X` and preserves the current `?domain=`.
- Clicking "全部" domain tab clears both `?domain=` and `?tag=`.

---

## Filtering Logic (`useQuestions.ts`)

Priority: `tag` > `domain` > none

```
has ?tag  → filter by category === tag
has ?domain (no tag) → filter by categories in DOMAIN_CATEGORIES[domain]
neither  → return all questions
```

---

## AppSidebar.vue Changes

1. Read `?domain=` from `route.query`.
2. Render a 5-tab strip at the top of the sidebar (全部 + 4 domains).
3. Active tab: indigo pill style (matching existing `iv-sb-link--active`).
4. Inactive tabs: smaller, muted text, no pill.
5. Below the tabs, filter the category list to only those belonging to the active domain. If domain = 全部, show all categories.
6. Tab navigation updates URL via `router.push` (to preserve `?tag=` or clear it as per rules above).

Tab labels use existing i18n keys: `domains.all`, `domains.frontend`, `domains.backend`, `domains.dataEngineering`, `domains.devops`.

---

## Mobile Tag Bar (`pages/questions/index.vue`)

Add a domain tab row **above** the existing category pills row:
- Row 1: 全部 / 前端 / 後端 / 資料工程 / DevOps pills (horizontal scroll)
- Row 2: category pills filtered to active domain

Clicking a domain pill in row 1 sets `?domain=X`, clears `?tag=`, and updates row 2.

---

## Page Header

When `?domain=` is active and no `?tag=`:
- Eyebrow: `DOMAIN`
- Title: domain label (e.g. `前端`)

When `?tag=` is active (existing behavior):
- Eyebrow: `CATEGORY`
- Title: category label

When neither:
- Eyebrow: `QUESTION BANK`
- Title: `面試題庫`

---

## Files to Change

| File | Change |
|------|--------|
| `composables/useQuestions.ts` | Add `activeDomain` computed + domain filtering in `filtered` |
| `components/layout/AppSidebar.vue` | Add domain tabs, filter category list |
| `pages/questions/index.vue` | Add mobile domain tab row, update page header logic |

No new files. Uses existing `DOMAIN_CATEGORIES` from `shared/question-domain-categories.mjs`.

---

## Out of Scope

- Persisting domain preference across sessions (localStorage)
- Animating the category list when switching domains
- Adding domain filter to the admin panel
