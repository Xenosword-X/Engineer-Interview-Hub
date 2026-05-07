<!-- pages/interview/history.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'home' })

const { t } = useI18n()
const localePath = useLocalePath()

useHead({ title: t('interview.history.title') })

const user = useSupabaseUser()

const { data, pending, refresh } = await useFetch<{
  items: Array<{
    id: string; startedAt: string; endedAt: string | null; status: string
    targetRole: string; targetCategories: string[]; totalTurns: number; hasSummary: boolean
  }>
  nextCursor: string | null
}>('/api/interview/history', { immediate: !!user.value })

const deletingId = ref<string | null>(null)
const confirmDeleteId = ref<string | null>(null)

async function deleteSession(id: string) {
  deletingId.value = id
  try {
    await $fetch(`/api/interview/${id}`, { method: 'DELETE' })
    await refresh()
  } finally {
    deletingId.value = null
    confirmDeleteId.value = null
  }
}

function statusColor(status: string) {
  if (status === 'completed') return '#22c55e'
  if (status === 'error') return '#f59e0b'
  return '#475569'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function roleShort(targetRole: string) {
  const lastDash = targetRole.lastIndexOf('-')
  const roleType = lastDash !== -1 ? targetRole.slice(0, lastDash) : targetRole
  const map: Record<string, string> = {
    'frontend':         t('interviewRoles.frontend'),
    'backend':          t('interviewRoles.backend'),
    'data-engineering': t('interviewRoles.dataEngineering'),
    'devops':           t('interviewRoles.devops'),
    'fullstack':        t('interviewRoles.fullstack'),
  }
  return map[roleType] ?? roleType
}
</script>

<template>
  <div class="iv-hist-shell">

    <!-- Not logged in -->
    <div v-if="!user" class="iv-hist-login">
      <div class="iv-hist-login-card">
        <div class="iv-login-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
          </svg>
        </div>
        <h2 class="iv-hist-login-title">{{ t('interview.history.title') }}</h2>
        <p class="iv-hist-login-desc">{{ t('auth.login_required') }}</p>
        <ClientOnly>
          <LoginButton />
        </ClientOnly>
      </div>
    </div>

    <!-- Logged in -->
    <template v-else>
      <div class="iv-hist-inner">

        <!-- Header -->
        <div class="iv-hist-header">
          <div>
            <span class="iv-hist-eyebrow">HISTORY</span>
            <h1 class="iv-hist-title">{{ t('interview.history.title') }}</h1>
          </div>
          <NuxtLink :to="localePath('/interview')" class="iv-hist-new-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            {{ t('interview.history.new_session') }}
          </NuxtLink>
        </div>

        <!-- Loading -->
        <div v-if="pending" class="iv-hist-loading">
          <span class="iv-hist-spin" />
          <span>{{ t('interview.loading') }}</span>
        </div>

        <!-- Empty -->
        <div v-else-if="!data?.items?.length" class="iv-hist-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/>
          </svg>
          <p>{{ t('interview.history.empty') }}</p>
        </div>

        <!-- List -->
        <div v-else class="iv-hist-list">
          <div
            v-for="item in data.items"
            :key="item.id"
            class="iv-hist-item"
          >
            <div class="iv-hist-item-left">
              <span class="iv-hist-dot" :style="{ background: statusColor(item.status), boxShadow: `0 0 6px ${statusColor(item.status)}` }" />
              <div class="iv-hist-item-info">
                <p class="iv-hist-item-role">
                  {{ roleShort(item.targetRole) }}
                  <span class="iv-hist-item-cats">· {{ item.targetCategories.join(', ') }}</span>
                </p>
                <p class="iv-hist-item-date">{{ formatDate(item.startedAt) }} · {{ item.totalTurns }} turns</p>
              </div>
            </div>

            <div class="iv-hist-item-actions">
              <NuxtLink
                v-if="item.hasSummary"
                :to="localePath(`/interview/${item.id}`)"
                class="iv-hist-view-btn"
              >
                {{ t('interview.history.view_report') }}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6"/>
                </svg>
              </NuxtLink>
              <button
                @click="confirmDeleteId = item.id"
                :disabled="deletingId === item.id"
                class="iv-hist-del-btn"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </template>

    <!-- Delete confirm dialog -->
    <Teleport to="body">
      <div v-if="confirmDeleteId" class="iv-overlay" @click.self="confirmDeleteId = null">
        <div class="iv-dialog">
          <p class="iv-dialog-title">{{ t('interview.history.delete_confirm') }}</p>
          <div class="iv-dialog-actions">
            <button @click="deleteSession(confirmDeleteId!)" :disabled="!!deletingId" class="iv-dialog-btn iv-dialog-btn--danger">
              <span v-if="deletingId" class="iv-btn-spin-sm" />
              {{ t('interview.history.confirm_delete') }}
            </button>
            <button @click="confirmDeleteId = null" class="iv-dialog-btn iv-dialog-btn--ghost">
              {{ t('interview.stage.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
.iv-hist-shell {
  min-height: calc(100vh - 3.5rem);
  background: var(--color-bg, #f8fafc);
  padding: 2rem 1rem 4rem;
}

.iv-hist-login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 3.5rem);
  padding: 2rem 1rem;
}

.iv-hist-login-card {
  max-width: 360px;
  width: 100%;
  background: #ffffff;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.06);
}

.iv-login-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: var(--color-text-muted, #64748b);
  background: var(--color-bg, #f8fafc);
  border: 1px solid var(--color-border, #e2e8f0);
}

.iv-hist-login-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.25rem;
  color: var(--color-text-primary, #0f172a);
  margin-bottom: 8px;
}

.iv-hist-login-desc {
  font-size: 13px;
  color: var(--color-text-muted, #64748b);
  margin-bottom: 20px;
}

.iv-hist-inner {
  max-width: 600px;
  margin: 0 auto;
}

.iv-hist-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
  padding-top: 0.5rem;
}

.iv-hist-eyebrow {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--color-primary, #6366f1);
  margin-bottom: 4px;
}

.iv-hist-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.75rem;
  color: var(--color-text-primary, #0f172a);
}

.iv-hist-new-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--color-primary-light, #eef2ff);
  border: 1px solid var(--color-primary-border, #c7d2fe);
  color: var(--color-primary, #6366f1);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
  flex-shrink: 0;
  margin-top: 6px;
}

.iv-hist-new-btn:hover {
  background: #e0e7ff;
  border-color: var(--color-primary, #6366f1);
}

.iv-hist-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 4rem 0;
  font-size: 13px;
  color: var(--color-text-muted, #64748b);
}

.iv-hist-spin {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border, #e2e8f0);
  border-top-color: var(--color-primary, #6366f1);
  border-radius: 50%;
  animation: iv-spin 0.7s linear infinite;
}

@keyframes iv-spin { to { transform: rotate(360deg); } }

.iv-hist-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 4rem 0;
  color: var(--color-text-muted, #64748b);
  font-size: 13px;
  text-align: center;
}

.iv-hist-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.iv-hist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: #ffffff;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.iv-hist-item:hover {
  border-color: var(--color-border-hover, #a5b4fc);
  box-shadow: 0 2px 8px rgba(99,102,241,0.08);
}

.iv-hist-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.iv-hist-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.iv-hist-item-info { min-width: 0; }

.iv-hist-item-role {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.iv-hist-item-cats {
  color: var(--color-text-muted, #64748b);
  font-weight: 400;
}

.iv-hist-item-date {
  font-size: 11px;
  color: var(--color-text-muted, #64748b);
  font-family: 'JetBrains Mono', monospace;
  margin-top: 2px;
}

.iv-hist-item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.iv-hist-view-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary, #6366f1);
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 6px;
  background: var(--color-primary-light, #eef2ff);
  border: 1px solid var(--color-primary-border, #c7d2fe);
  transition: all 0.15s ease;
}

.iv-hist-view-btn:hover {
  background: #e0e7ff;
  border-color: var(--color-primary, #6366f1);
}

.iv-hist-del-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid var(--color-border, #e2e8f0);
  color: var(--color-text-muted, #64748b);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.iv-hist-del-btn:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #fecaca;
  color: #ef4444;
}

.iv-hist-del-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.iv-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  backdrop-filter: blur(4px);
}

.iv-dialog {
  background: #ffffff;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 16px;
  padding: 24px;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(15,23,42,0.15);
}

.iv-dialog-title {
  font-size: 14px;
  color: var(--color-text-primary, #0f172a);
  line-height: 1.6;
  margin-bottom: 18px;
}

.iv-dialog-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.iv-dialog-btn {
  width: 100%;
  padding: 11px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.iv-dialog-btn--danger {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
}
.iv-dialog-btn--danger:hover:not(:disabled) { background: #fee2e2; }
.iv-dialog-btn--danger:disabled { opacity: 0.5; cursor: not-allowed; }

.iv-dialog-btn--ghost {
  background: var(--color-bg, #f8fafc);
  color: var(--color-text-muted, #64748b);
  border: 1px solid var(--color-border, #e2e8f0);
}
.iv-dialog-btn--ghost:hover { background: var(--color-border, #e2e8f0); }

.iv-btn-spin-sm {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(239,68,68,0.2);
  border-top-color: #ef4444;
  border-radius: 50%;
  animation: iv-spin 0.7s linear infinite;
}
</style>
