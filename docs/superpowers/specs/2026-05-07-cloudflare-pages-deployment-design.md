# Cloudflare Pages Deployment Design Spec
**Engineer Interview Hub — Deployment**
Date: 2026-05-07

---

## Overview

Deploy the Engineer Interview Hub (Nuxt 3 SSR) to Cloudflare Pages via GitHub auto-deploy. Every push to `main` triggers a build; PRs get a Preview URL. Uses the default `*.pages.dev` domain.

**CF Pages project name:** `engineer-interview-hub`
**Production URL:** `https://engineer-interview-hub.pages.dev`

---

## Part 1: Pre-deployment Code Changes

Three files need updating before the first deploy.

### package.json
- `name`: `fe-interview-hub` → `engineer-interview-hub`

### nuxt.config.ts
- Line 4 fallback URL: `fe-interview-hub.example.com` → `engineer-interview-hub.pages.dev`

### .gitignore
- Confirm `.output/` and `dist/` are listed (prevent build artifacts from entering repo)

---

## Part 2: Cloudflare Pages Dashboard Setup

### Create Project
1. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git
2. Authorize GitHub, select `Engineer-Interview-Hub` repo
3. Production branch: `main`

### Build Settings
| Field | Value |
|-------|-------|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `.output/public` |

> Note: `.output/public` is the correct output path for `nitro.preset: 'cloudflare-pages'` (SSR mode). Using `dist` would cause 500 errors — that path is only for `nuxt generate` (static mode).

### Environment Variables (all Production)
| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `20` |
| `NUXT_PUBLIC_SUPABASE_URL` | from `.env` |
| `NUXT_PUBLIC_SUPABASE_KEY` | from `.env` |
| `SUPABASE_SERVICE_KEY` | from `.env` |
| `OPENAI_API_KEY` | from `.env` |
| `DAILY_AI_LIMIT` | `10` |
| `BYPASS_EMAILS` | `swordsgod790626@gmail.com` |
| `BACKEND_ACCOUNT` | from `.env` |
| `BACKEND_PASSWORD` | from `.env` |
| `SESSION_SECRET` | from `.env` |
| `NUXT_PUBLIC_SITE_URL` | `https://engineer-interview-hub.pages.dev` |

---

## Part 3: Post-deployment Steps

### Supabase Auth
- Dashboard → Authentication → URL Configuration → Redirect URLs
- Add: `https://engineer-interview-hub.pages.dev/auth/callback`

### Google Cloud Console
- APIs & Services → Credentials → OAuth 2.0 Client ID
- Authorized redirect URIs → Add: `https://engineer-interview-hub.pages.dev/auth/callback`

### Local .env
- Update `NUXT_PUBLIC_SITE_URL` to `https://engineer-interview-hub.pages.dev`

### Verification Checklist
1. Homepage loads (confirms SSR worker is running)
2. Google OAuth login completes (confirms callback URLs are correct)
3. AI single-question evaluation works (confirms OpenAI key is set)
4. Admin panel `/admin` login works (confirms session cookie is functioning)
