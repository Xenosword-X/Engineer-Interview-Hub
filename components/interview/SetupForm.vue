<!-- components/interview/SetupForm.vue -->
<script setup lang="ts">
const props = defineProps<{ loading?: boolean }>()
const emit = defineEmits<{ start: [payload: { locale: string; targetRole: string }] }>()
const { locale, t } = useI18n()

// ── Step 1: role selection ──────────────────────────────────────────────────
const selectedRole = ref<string | null>(null)

const roles = [
  { value: 'frontend',         icon: '🖥️', titleKey: 'interviewRoles.frontend',         descKey: 'interviewRoles.frontendDesc' },
  { value: 'backend',          icon: '⚙️', titleKey: 'interviewRoles.backend',          descKey: 'interviewRoles.backendDesc' },
  { value: 'data-engineering', icon: '📊', titleKey: 'interviewRoles.dataEngineering',  descKey: 'interviewRoles.dataEngineeringDesc' },
  { value: 'devops',           icon: '☁️', titleKey: 'interviewRoles.devops',           descKey: 'interviewRoles.devopsDesc' },
  { value: 'fullstack',        icon: '🔄', titleKey: 'interviewRoles.fullstack',        descKey: 'interviewRoles.fullstackDesc' },
]

// ── Step 2: seniority + categories ─────────────────────────────────────────
const selectedSeniority = ref<'junior' | 'senior'>('junior')
const selectedCategories = ref<string[]>([])

const domainCategories: Record<string, string[]> = {
  frontend: ['javascript', 'vue', 'css', 'html', 'web-vitals', 'browser', 'behavioral'],
  backend: ['backend-api', 'backend-language', 'backend-database', 'backend-system-design', 'backend-security', 'backend-performance'],
  'data-engineering': ['data-sql', 'data-nosql', 'data-pipeline', 'data-warehouse', 'data-streaming', 'data-batch'],
  devops: ['devops-container', 'devops-k8s', 'devops-cicd', 'devops-cloud', 'devops-monitoring', 'devops-iac'],
  fullstack: ['javascript', 'vue', 'css', 'html', 'web-vitals', 'browser', 'behavioral', 'backend-api', 'backend-language', 'backend-database', 'backend-system-design', 'backend-security', 'backend-performance'],
}

// Frontend-only categories for fullstack split view
const frontendCats = ['javascript', 'vue', 'css', 'html', 'web-vitals', 'browser', 'behavioral']
const backendCats  = ['backend-api', 'backend-language', 'backend-database', 'backend-system-design', 'backend-security', 'backend-performance']

watch(selectedRole, (role) => {
  if (!role) return
  selectedCategories.value = [...(domainCategories[role] ?? [])]
})

// Current domain's category list (flat, for non-fullstack)
const currentCategories = computed(() =>
  selectedRole.value ? (domainCategories[selectedRole.value] ?? []) : []
)

// ── Submission ──────────────────────────────────────────────────────────────
function handleStart() {
  if (!selectedRole.value) return
  const targetRole = `${selectedRole.value}-${selectedSeniority.value}`
  emit('start', { locale: locale.value, targetRole })
}

const canStart = computed(() => !!selectedRole.value && selectedCategories.value.length > 0)
</script>

<template>
  <div class="iv-card">

    <!-- Header -->
    <div class="iv-card-header">
      <span class="iv-eyebrow">AI POWERED</span>
      <h1 class="iv-title">{{ t('interview.setup.title') }}</h1>
      <p class="iv-subtitle">{{ t('interview.setup.subtitle') }}</p>
    </div>

    <div class="iv-divider" />

    <!-- ── Step 1: Role Cards ─────────────────────────────────────────────── -->
    <div class="iv-section">
      <p class="iv-section-label">{{ t('interview.setup.role_label') }}</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          v-for="role in roles"
          :key="role.value"
          type="button"
          @click="selectedRole = role.value"
          :class="[
            'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
            selectedRole === role.value
              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100'
              : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
          ]"
        >
          <span class="text-2xl mb-1">{{ role.icon }}</span>
          <span class="text-sm font-semibold text-slate-800 leading-tight text-center">{{ t(role.titleKey) }}</span>
          <span class="text-xs text-slate-500 text-center leading-tight">{{ t(role.descKey) }}</span>
        </button>
      </div>
    </div>

    <!-- ── Step 2: Detail config (expands when role selected) ─────────────── -->
    <Transition name="iv-step2">
      <div
        v-if="selectedRole"
        class="mt-4 p-5 rounded-xl bg-slate-50 border border-slate-200"
      >
        <!-- Seniority -->
        <p class="iv-section-label mb-2">{{ t('interviewSeniority.label') }}</p>
        <div class="flex gap-2">
          <button
            v-for="level in (['junior', 'senior'] as const)"
            :key="level"
            type="button"
            @click="selectedSeniority = level"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium border-2 cursor-pointer transition-all',
              selectedSeniority === level
                ? 'border-indigo-500 bg-indigo-500 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
            ]"
          >
            {{ t(`interviewSeniority.${level}`) }}
          </button>
        </div>

        <!-- Categories: fullstack split view -->
        <template v-if="selectedRole === 'fullstack'">
          <div class="mt-3 mb-2">
            <p class="text-xs font-medium text-slate-400 mb-1">前端領域</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <label
                v-for="cat in frontendCats"
                :key="cat"
                class="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="cat"
                  v-model="selectedCategories"
                  class="w-4 h-4 accent-indigo-500"
                />
                <span class="text-slate-700">{{ t(`categories.${cat}`) }}</span>
              </label>
            </div>
          </div>
          <div>
            <p class="text-xs font-medium text-slate-400 mb-1">後端領域</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <label
                v-for="cat in backendCats"
                :key="cat"
                class="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="cat"
                  v-model="selectedCategories"
                  class="w-4 h-4 accent-indigo-500"
                />
                <span class="text-slate-700">{{ t(`categories.${cat}`) }}</span>
              </label>
            </div>
          </div>
        </template>

        <!-- Categories: single domain view -->
        <template v-else>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
            <label
              v-for="cat in currentCategories"
              :key="cat"
              class="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                :value="cat"
                v-model="selectedCategories"
                class="w-4 h-4 accent-indigo-500"
              />
              <span class="text-slate-700">{{ t(`categories.${cat}`) }}</span>
            </label>
          </div>
        </template>
      </div>
    </Transition>

    <!-- Notice -->
    <p class="iv-notice">{{ t('interview.setup.privacy_notice') }}</p>

    <!-- CTA -->
    <button
      :disabled="loading || !canStart"
      @click="handleStart"
      class="iv-cta"
    >
      <span v-if="loading" class="iv-spin" />
      <svg v-else class="iv-cta-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/>
        <path d="M19 11a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V22h2v-2.06A9 9 0 0 0 21 11h-2z"/>
      </svg>
      {{ t('interview.setup.start_btn') }}
    </button>

  </div>
</template>

<style scoped>
.iv-card {
  width: 100%;
  max-width: 680px;
  background: #ffffff;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(99,102,241,0.07);
}

.iv-card-header { text-align: center; margin-bottom: 1.5rem; }

.iv-eyebrow {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--color-primary, #6366f1);
  background: var(--color-primary-light, #eef2ff);
  border: 1px solid var(--color-primary-border, #c7d2fe);
  border-radius: 4px;
  padding: 2px 10px;
  margin-bottom: 12px;
}

.iv-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.875rem;
  color: var(--color-text-primary, #0f172a);
  line-height: 1.2;
  margin-bottom: 8px;
}

.iv-subtitle {
  font-size: 0.8125rem;
  color: var(--color-text-muted, #64748b);
  line-height: 1.6;
  max-width: 420px;
  margin: 0 auto;
}

.iv-divider {
  height: 1px;
  background: var(--color-border, #e2e8f0);
  margin: 1.5rem 0;
}

.iv-section { margin-bottom: 1rem; }

.iv-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--color-text-muted, #64748b);
  margin-bottom: 10px;
}

.iv-notice {
  font-size: 11px;
  color: var(--color-text-muted, #64748b);
  line-height: 1.6;
  padding: 10px 12px;
  background: var(--color-bg, #f8fafc);
  border-radius: 8px;
  border: 1px solid var(--color-border, #e2e8f0);
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

.iv-cta {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px;
  border-radius: 12px;
  background: var(--color-primary, #6366f1);
  color: white;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 12px rgba(99,102,241,0.25);
  letter-spacing: 0.3px;
}

.iv-cta:hover:not(:disabled) {
  background: #4f46e5;
  box-shadow: 0 4px 18px rgba(99,102,241,0.35);
  transform: translateY(-1px);
}

.iv-cta:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.iv-cta-icon { width: 18px; height: 18px; flex-shrink: 0; }

.iv-spin {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: iv-spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes iv-spin { to { transform: rotate(360deg); } }

/* Step 2 expand transition */
.iv-step2-enter-active,
.iv-step2-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.iv-step2-enter-from,
.iv-step2-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
