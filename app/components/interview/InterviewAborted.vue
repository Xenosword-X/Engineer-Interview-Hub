<!-- components/interview/InterviewAborted.vue -->
<script setup lang="ts">
defineProps<{ status: 'aborted' | 'error' | string }>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="iv-abort-shell">
    <div class="iv-abort-card">

      <div :class="['iv-abort-icon', status === 'error' && 'iv-abort-icon--err']">
        <svg v-if="status === 'error'" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 15.75h.007v.008H12v-.008z"/>
        </svg>
        <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9z"/>
        </svg>
      </div>

      <h2 class="iv-abort-title">
        {{ status === 'error' ? t('interview.errors.session_error_title') : t('interview.errors.session_aborted_title') }}
      </h2>

      <p class="iv-abort-desc">
        {{ status === 'error' ? t('interview.errors.session_error_desc') : t('interview.errors.session_aborted_desc') }}
      </p>

      <NuxtLink :to="localePath('/interview')" class="iv-abort-btn">
        {{ t('interview.errors.back_to_setup') }}
      </NuxtLink>

    </div>
  </div>
</template>

<style scoped>
.iv-abort-shell {
  min-height: calc(100vh - 3.5rem);
  background: var(--color-bg, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.iv-abort-card {
  max-width: 380px;
  width: 100%;
  background: #ffffff;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.06);
}

.iv-abort-icon {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  background: var(--color-bg, #f8fafc);
  color: var(--color-text-muted, #64748b);
  border: 1px solid var(--color-border, #e2e8f0);
}

.iv-abort-icon--err {
  background: #fffbeb;
  color: #f59e0b;
  border-color: #fde68a;
}

.iv-abort-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.375rem;
  color: var(--color-text-primary, #0f172a);
  margin-bottom: 10px;
}

.iv-abort-desc {
  font-size: 13px;
  color: var(--color-text-muted, #64748b);
  line-height: 1.7;
  margin-bottom: 24px;
}

.iv-abort-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 28px;
  border-radius: 10px;
  background: var(--color-primary, #6366f1);
  color: white;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 2px 10px rgba(99,102,241,0.2);
  transition: all 0.2s ease;
}

.iv-abort-btn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99,102,241,0.3);
}
</style>
