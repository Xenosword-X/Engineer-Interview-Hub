<!-- components/layout/AppSidebar.vue -->
<script setup lang="ts">
import { DOMAIN_CATEGORIES } from '@@/shared/question-domain-categories.mjs'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()
const { categories } = useCategories()

const activeCategory = computed(() => (route.query.tag as string) ?? '')

const CATEGORY_DOMAIN_MAP: Record<string, string> = Object.entries(DOMAIN_CATEGORIES)
  .flatMap(([domain, cats]) => (cats as string[]).map(cat => [cat, domain]))
  .reduce((acc, [cat, domain]) => ({ ...acc, [cat]: domain }), {})

const activeDomain = computed(() => {
  if (route.query.domain) return route.query.domain as string
  if (route.query.tag) return CATEGORY_DOMAIN_MAP[route.query.tag as string] ?? 'frontend'
  return 'frontend'
})

const DOMAIN_TABS = [
  { key: 'frontend', labelKey: 'domains.frontend' },
  { key: 'backend', labelKey: 'domains.backend' },
  { key: 'data-engineering', labelKey: 'domains.dataEngineering' },
  { key: 'devops', labelKey: 'domains.devops' },
] as const

const visibleCategories = computed(() => {
  const keys = DOMAIN_CATEGORIES[activeDomain.value] ?? []
  return categories.value.filter(c => keys.includes(c.key))
})

function selectDomain(domainKey: string) {
  const query: Record<string, string> = {}
  if (domainKey) query.domain = domainKey
  router.push({ path: localePath('/questions'), query })
}
</script>

<template>
  <aside class="hidden lg:block w-55 shrink-0 border-r border-[--color-border] bg-white self-start sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
    <div class="py-5">

      <!-- Domain tabs -->
      <div class="flex flex-wrap gap-1 px-3 mb-4">
        <button
          v-for="tab in DOMAIN_TABS"
          :key="tab.key"
          :class="[
            'iv-domain-tab',
            activeDomain === tab.key && 'iv-domain-tab--active',
          ]"
          @click="selectDomain(tab.key)"
        >
          {{ t(tab.labelKey) }}
        </button>
      </div>

      <p class="iv-sb-heading">{{ activeDomain ? t(`domains.${activeDomain === 'data-engineering' ? 'dataEngineering' : activeDomain}`) : 'Categories' }}</p>

      <!-- Per category -->
      <NuxtLink
        v-for="cat in visibleCategories"
        :key="cat.key"
        :to="activeDomain ? `${localePath('/questions')}?domain=${activeDomain}&tag=${cat.key}` : `${localePath('/questions')}?tag=${cat.key}`"
        :class="['iv-sb-link', activeCategory === cat.key && 'iv-sb-link--active']"
      >
        <span :class="['iv-sb-dot', `iv-sb-dot--${cat.key}`]" />
        <span class="flex-1">{{ t(`categories.${cat.key}`) }}</span>
        <span class="iv-sb-count">{{ cat.count }}</span>
      </NuxtLink>

    </div>
  </aside>
</template>

<style scoped>
.iv-domain-tab {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 100px;
  border: 1px solid var(--color-border, #e2e8f0);
  color: var(--color-text-muted, #64748b);
  background: transparent;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
  white-space: nowrap;
}
.iv-domain-tab:hover {
  background: var(--color-bg, #f8fafc);
  color: var(--color-text-primary, #0f172a);
}
.iv-domain-tab--active {
  background: var(--color-primary-light, #eef2ff);
  color: var(--color-primary, #6366f1);
  border-color: var(--color-primary-border, #c7d2fe);
}

.iv-sb-heading {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-primary, #6366f1);
  padding: 0 16px;
  margin-bottom: 10px;
}

.iv-sb-link {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  padding: 8px 12px;
  margin: 1px 8px;
  border-radius: 8px;
  border-left: 2px solid transparent;
  text-decoration: none;
  color: var(--color-text-secondary, #374151);
  transition: background 0.15s, color 0.15s;
}
.iv-sb-link:hover {
  background: var(--color-bg, #f8fafc);
  color: var(--color-text-primary, #0f172a);
}
.iv-sb-link--active {
  background: var(--color-primary-light, #eef2ff);
  color: var(--color-primary, #6366f1);
  font-weight: 600;
  border-left-color: var(--color-primary, #6366f1);
}

/* Colored category dots */
.iv-sb-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--color-border, #e2e8f0);
}
.iv-sb-dot--all               { background: var(--color-primary, #6366f1); }
/* Frontend */
.iv-sb-dot--javascript        { background: #f59e0b; }
.iv-sb-dot--vue               { background: #22c55e; }
.iv-sb-dot--css               { background: #ec4899; }
.iv-sb-dot--network-security  { background: #3b82f6; }
.iv-sb-dot--html              { background: #f97316; }
.iv-sb-dot--web-vitals        { background: #8b5cf6; }
.iv-sb-dot--browser           { background: #0ea5e9; }
.iv-sb-dot--behavioral        { background: #14b8a6; }
/* Backend */
.iv-sb-dot--api-design        { background: #6366f1; }
.iv-sb-dot--language          { background: #7c3aed; }
.iv-sb-dot--database          { background: #2563eb; }
.iv-sb-dot--system-design     { background: #0891b2; }
.iv-sb-dot--security          { background: #dc2626; }
.iv-sb-dot--performance       { background: #d97706; }
/* Data Engineering */
.iv-sb-dot--sql-transformation          { background: #059669; }
.iv-sb-dot--pipeline-orchestration      { background: #0d9488; }
.iv-sb-dot--warehouse-modeling          { background: #16a34a; }
.iv-sb-dot--batch-processing            { background: #0284c7; }
.iv-sb-dot--stream-processing           { background: #9333ea; }
.iv-sb-dot--data-quality-observability  { background: #ca8a04; }
/* DevOps */
.iv-sb-dot--containers-platform      { background: #2563eb; }
.iv-sb-dot--infrastructure-as-code   { background: #7c3aed; }
.iv-sb-dot--delivery-automation      { background: #16a34a; }
.iv-sb-dot--cloud-architecture       { background: #0891b2; }
.iv-sb-dot--observability            { background: #f59e0b; }
.iv-sb-dot--reliability-sre          { background: #ef4444; }

.iv-sb-count {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted, #64748b);
  flex-shrink: 0;
}
</style>
