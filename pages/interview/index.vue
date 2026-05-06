<!-- pages/interview/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'home' })

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()

useHead({ title: t('interview.setup.title') })

const user = useSupabaseUser()
const isStarting = ref(false)

async function handleStart(payload: { locale: string; targetRole: string }) {
  isStarting.value = true
  try {
    const result = await $fetch<{ sessionId: string; aiText: string; aiAudioBase64: string; phase: string; resumed: boolean }>('/api/interview/start', {
      method: 'POST',
      body: payload,
    })
    if (process.client) {
      sessionStorage.setItem(`interview_init_${result.sessionId}`, JSON.stringify({
        aiText: result.aiText,
        aiAudioBase64: result.aiAudioBase64,
      }))
    }
    router.push(localePath(`/interview/${result.sessionId}`))
  } catch (e: any) {
    if (e?.statusCode === 429) {
      alert(t('interview.errors.quota_exceeded'))
    } else {
      alert(t('interview.errors.start_failed'))
    }
  } finally {
    isStarting.value = false
  }
}

// Latest session for the recent-session banner. Logged-in only; refreshes on focus
// so users coming back from a finished interview see the new entry without F5.
const { data: recentData } = await useFetch<{
  items: Array<{
    id: string; startedAt: string; endedAt: string | null; status: string
    targetRole: string; targetCategories: string[]; totalTurns: number; hasSummary: boolean
  }>
}>('/api/interview/history', {
  query: { limit: 1 },
  immediate: !!user.value,
  watch: [user],
})

const recent = computed(() => recentData.value?.items?.[0] ?? null)

const recentDestination = computed(() => {
  const r = recent.value
  if (!r) return localePath('/interview/history')
  // Completed with summary → jump straight to that report. Otherwise → history list.
  if (r.status === 'completed' && r.hasSummary) return localePath(`/interview/${r.id}`)
  return localePath('/interview/history')
})

const recentStatusColor = computed(() => {
  const s = recent.value?.status
  if (s === 'completed') return '#22c55e'
  if (s === 'aborted') return '#94a3b8'
  if (s === 'error') return '#f59e0b'
  return '#6366f1' // active
})

function formatRecentDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function recentRoleLabel(targetRole: string) {
  // targetRole format: "{roleType}-{seniority}" where roleType may contain dashes (e.g. data-engineering)
  // Extract roleType by stripping the last dash-separated segment (seniority)
  const lastDash = targetRole.lastIndexOf('-')
  if (lastDash === -1) return targetRole
  const roleType = targetRole.slice(0, lastDash)
  const roleKeyMap: Record<string, string> = {
    'frontend': t('interviewRoles.frontend'),
    'backend': t('interviewRoles.backend'),
    'data-engineering': t('interviewRoles.dataEngineering'),
    'devops': t('interviewRoles.devops'),
    'fullstack': t('interviewRoles.fullstack'),
  }
  // Legacy fallback: old format was "frontend-mid/junior/senior"
  if (roleType === 'frontend') return roleKeyMap['frontend']
  return roleKeyMap[roleType] ?? roleType
}

function recentStatusLabel(status: string) {
  return t(`interview.phase.${status}`, status)
}
</script>

<template>
  <div>
    <!-- Not logged in -->
    <div v-if="!user" class="iv-index-login">
      <div class="iv-index-login-card">
        <span class="iv-index-eyebrow">AI POWERED</span>
        <h1 class="iv-index-title">{{ t('interview.setup.title') }}</h1>
        <p class="iv-index-desc">{{ t('auth.login_required') }}</p>
        <ClientOnly>
          <LoginButton />
        </ClientOnly>
      </div>
    </div>

    <!-- Logged in: shell vertically centers the whole stack (banner + form + history link) -->
    <template v-else>
      <div class="iv-page-shell">
        <div class="iv-page-stack">
          <!-- Recent-session banner — only when there's at least one prior session -->
          <NuxtLink
            v-if="recent"
            :to="recentDestination"
            class="iv-recent-banner"
            :aria-label="t('interview.setup.recent_label')"
          >
            <span class="iv-recent-dot" :style="{ background: recentStatusColor }" />
            <span class="iv-recent-meta">
              <span class="iv-recent-label">{{ t('interview.setup.recent_label') }}</span>
              <span class="iv-recent-sep">·</span>
              <span class="iv-recent-date">{{ formatRecentDate(recent.startedAt) }}</span>
              <span class="iv-recent-sep">·</span>
              <span class="iv-recent-role">{{ recentRoleLabel(recent.targetRole) }}</span>
              <span class="iv-recent-status" :style="{ color: recentStatusColor }">
                {{ recentStatusLabel(recent.status) }}
              </span>
            </span>
            <span class="iv-recent-cta">
              {{ recent.status === 'completed' && recent.hasSummary
                ? t('interview.setup.view_report')
                : t('interview.setup.view_all') }} →
            </span>
          </NuxtLink>

          <SetupForm :loading="isStarting" @start="handleStart" />

          <NuxtLink :to="localePath('/interview/history')" class="iv-index-hist-btn">
            {{ t('interview.setup.view_history') }} →
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.iv-index-login {
  min-height: calc(100vh - 3.5rem);
  background: var(--color-bg, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.iv-index-login-card {
  max-width: 400px;
  width: 100%;
  background: #ffffff;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(99,102,241,0.07);
}

.iv-index-eyebrow {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--color-primary, #6366f1);
  background: var(--color-primary-light, #eef2ff);
  border: 1px solid var(--color-primary-border, #c7d2fe);
  border-radius: 4px;
  padding: 2px 10px;
  margin-bottom: 14px;
}

.iv-index-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.75rem;
  color: var(--color-text-primary, #0f172a);
  margin-bottom: 10px;
}

.iv-index-desc {
  font-size: 13px;
  color: var(--color-text-muted, #64748b);
  margin-bottom: 24px;
  line-height: 1.6;
}

/* Page shell — vertically centers the stack within viewport (minus navbar) */
.iv-page-shell {
  min-height: calc(100vh - 3.5rem);
  background: var(--color-bg, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

/* Stack — banner + SetupForm card + history link, fixed gap between them */
.iv-page-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 720px;
}

.iv-index-hist-btn {
  font-size: 12px;
  color: var(--color-text-muted, #64748b);
  text-decoration: none;
  transition: color 0.15s;
}

.iv-index-hist-btn:hover { color: var(--color-primary, #6366f1); }

/* Recent-session banner — sits above the SetupForm card, same width */
.iv-recent-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
}
.iv-recent-banner:hover {
  border-color: var(--color-border-hover, #a5b4fc);
  box-shadow: 0 4px 12px rgba(99,102,241,0.08);
  transform: translateY(-1px);
}

.iv-recent-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.iv-recent-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
  font-size: 12px;
}

.iv-recent-label {
  font-weight: 600;
  color: var(--color-text-primary, #0f172a);
}
.iv-recent-sep   { color: var(--color-border, #e2e8f0); }
.iv-recent-date  { color: var(--color-text-muted, #64748b); font-family: 'JetBrains Mono', monospace; }
.iv-recent-role  { color: var(--color-text-secondary, #374151); }
.iv-recent-status {
  margin-left: 4px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(99,102,241,0.06);
  font-size: 11px;
}

.iv-recent-cta {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary, #6366f1);
  white-space: nowrap;
}

@media (max-width: 480px) {
  .iv-recent-banner { flex-wrap: wrap; }
  .iv-recent-cta { width: 100%; text-align: right; }
}
</style>
