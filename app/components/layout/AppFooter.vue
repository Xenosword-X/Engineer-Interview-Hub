<!-- components/layout/AppFooter.vue -->
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <footer class="border-t border-[--color-border] bg-white">
    <div class="max-w-360 mx-auto px-4 lg:px-6 py-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" aria-hidden="true" />
        <p class="text-xs text-[--color-text-muted]">{{ t('footer.copyright') }}</p>
      </div>
      <div class="flex gap-4 shrink-0">
        <a
          href="https://github.com/Xenosword-X/Engineer-Interview-Hub"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs text-[--color-text-muted] hover:text-[--color-primary] transition-colors"
        >{{ t('footer.github') }}</a>
        <NuxtLink
          to="/admin/login"
          class="text-xs text-[--color-text-muted] hover:text-[--color-primary] transition-colors"
        >{{ t('footer.admin') }}</NuxtLink>
      </div>
    </div>
  </footer>
</template>
