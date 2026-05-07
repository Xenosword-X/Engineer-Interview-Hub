# Cloudflare Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy Engineer Interview Hub to Cloudflare Pages with GitHub auto-deploy so every push to `main` triggers a production build.

**Architecture:** Nuxt 3 SSR with `nitro.preset: 'cloudflare-pages'` already configured. CF Pages runs the Nitro-generated `_worker.js` from `dist/`. GitHub integration handles CI — push to `main` → CF Pages builds and deploys automatically.

**Tech Stack:** Nuxt 3, Nitro (cloudflare-pages preset), Cloudflare Pages, Supabase Auth, Google OAuth

---

## File Map

| File | Change |
|------|--------|
| `package.json` | Rename `name` field |
| `nuxt.config.ts` | Update fallback URL constant |
| `.gitignore` | Already correct — no change needed |

---

### Task 1: Update project naming in code

**Files:**
- Modify: `package.json` (line 2)
- Modify: `nuxt.config.ts` (line 4)

- [ ] **Step 1: Update package.json name**

Open `package.json` and change line 2:

```json
{
  "name": "engineer-interview-hub",
```

- [ ] **Step 2: Update nuxt.config.ts fallback URL**

Open `nuxt.config.ts` and change line 4:

```ts
const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://engineer-interview-hub.pages.dev'
```

- [ ] **Step 3: Verify local build succeeds**

Run:
```bash
npm run build
```

Expected: Build completes without errors. Output directory `dist/` is created and contains `_worker.js`, `_routes.json`, `_headers`, `_redirects`.

- [ ] **Step 4: Commit**

```bash
git add package.json nuxt.config.ts
git commit -m "chore: rename project to engineer-interview-hub, update fallback site URL"
```

- [ ] **Step 5: Push to GitHub**

```bash
git push origin main
```

---

### Task 2: Cloudflare Pages Dashboard setup

> This task is manual — done in the browser at https://dash.cloudflare.com

**Files:** None (dashboard configuration)

- [ ] **Step 1: Create Pages project**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. Click **Create application** → **Pages** tab → **Connect to Git**
3. Authorize GitHub if not already done
4. Select the `Engineer-Interview-Hub` repo
5. Production branch: `main`

- [ ] **Step 2: Set build configuration**

In the "Set up builds and deployments" screen, fill in:

| Field | Value |
|-------|-------|
| Project name | `engineer-interview-hub` |
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |

> ⚠️ Must be `dist` — Nitro's `cloudflare-pages` preset outputs `_worker.js`, `_routes.json`, `_headers`, `_redirects` into `dist/`. Confirmed from build log: `npx wrangler pages deploy dist`.

- [ ] **Step 3: Add environment variables**

Still on the same screen, expand **Environment variables (advanced)** and add all of the following as **Production** variables:

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `20` |
| `NUXT_PUBLIC_SUPABASE_URL` | copy from local `.env` |
| `NUXT_PUBLIC_SUPABASE_KEY` | copy from local `.env` |
| `SUPABASE_SERVICE_KEY` | copy from local `.env` — mark as **Encrypted** |
| `OPENAI_API_KEY` | copy from local `.env` — mark as **Encrypted** |
| `DAILY_AI_LIMIT` | `10` |
| `BYPASS_EMAILS` | `swordsgod790626@gmail.com` |
| `BACKEND_ACCOUNT` | copy from local `.env` |
| `BACKEND_PASSWORD` | copy from local `.env` — mark as **Encrypted** |
| `SESSION_SECRET` | copy from local `.env` — mark as **Encrypted** |
| `NUXT_PUBLIC_SITE_URL` | `https://engineer-interview-hub.pages.dev` |

- [ ] **Step 4: Trigger first deploy**

Click **Save and Deploy**. CF Pages will clone the repo, run `npm run build`, and deploy `dist/`.

Watch the build log. Expected final line:
```
✨ Deployment complete! https://engineer-interview-hub.pages.dev
```

If the build fails, check the log — the most common causes are a missing env var or the wrong output directory.

---

### Task 3: Post-deployment external service configuration

> This task is manual — done in Supabase and Google Cloud Console dashboards.

**Files:**
- Modify: `.env` (local only — line 18)

- [ ] **Step 1: Add redirect URL in Supabase**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. **Authentication** → **URL Configuration**
3. Under **Redirect URLs**, click **Add URL**
4. Enter: `https://engineer-interview-hub.pages.dev/auth/callback`
5. Save

- [ ] **Step 2: Add authorized redirect URI in Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Click the OAuth 2.0 Client ID used by this project
3. Under **Authorized redirect URIs**, click **Add URI**
4. Enter: `https://engineer-interview-hub.pages.dev/auth/callback`
5. Click **Save**

> Changes can take up to 5 minutes to propagate.

- [ ] **Step 3: Update local .env**

Open `.env` and update line 18:

```bash
NUXT_PUBLIC_SITE_URL=https://engineer-interview-hub.pages.dev
```

---

### Task 4: Verify deployment

- [ ] **Step 1: Homepage loads**

Open `https://engineer-interview-hub.pages.dev` in a browser.

Expected: Page renders with correct content (not a blank page or CF error). View source and confirm HTML contains question content (not just a loading spinner) — this verifies SSR is working.

- [ ] **Step 2: Google OAuth login**

Click the login button and complete Google sign-in.

Expected: Redirected back to the site as a logged-in user. If it redirects to an error page, the Supabase redirect URL or Google OAuth URI from Task 3 wasn't saved correctly.

- [ ] **Step 3: AI single-question evaluation**

Open any question page, type an answer, and submit for AI evaluation.

Expected: Score and feedback appear within ~5 seconds. If you get a 500 error, check the `OPENAI_API_KEY` environment variable in CF Pages dashboard.

- [ ] **Step 4: Admin panel login**

Navigate to `https://engineer-interview-hub.pages.dev/admin`.

Expected: Login form appears. Enter credentials from `.env` (`BACKEND_ACCOUNT` / `BACKEND_PASSWORD`). Expected: Redirected to admin dashboard. If login fails with a 500, check that `SESSION_SECRET` is set in CF Pages env vars.

- [ ] **Step 5: Update README demo URL**

Open `README.md` and update line 7:

```markdown
🌐 **線上 Demo：** [https://engineer-interview-hub.pages.dev](https://engineer-interview-hub.pages.dev)
```

- [ ] **Step 6: Commit README update**

```bash
git add README.md
git commit -m "docs: update demo URL to engineer-interview-hub.pages.dev"
git push origin main
```
