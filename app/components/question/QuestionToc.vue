<!-- components/question/QuestionToc.vue -->
<script setup lang="ts">
const props = defineProps<{ links: Array<{ id: string; text: string; depth: number }> }>()
const { t } = useI18n()
const activeId = ref('')

onMounted(() => {
  if (!props.links.length) return

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
  <nav
    v-if="links.length"
    class="hidden lg:block w-[180px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 pl-4 border-l border-[--color-border]"
    aria-label="Table of contents"
  >
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
