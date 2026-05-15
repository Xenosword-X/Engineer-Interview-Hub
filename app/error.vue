<!-- error.vue -->
<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
defineProps<{ error: { statusCode: number; message: string } }>()
const { categories } = useCategories()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    <main class="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <p class="text-7xl font-bold text-[--color-primary] mb-4">404</p>
      <h1 class="text-2xl font-bold text-[--color-text-primary] mb-2">{{ t('error.not_found_title') }}</h1>
      <p class="text-[--color-text-secondary] mb-8">{{ t('error.not_found_desc') }}</p>
      <div class="flex flex-wrap justify-center gap-2 mb-8">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.key"
          :to="`${localePath('/questions')}?tag=${cat.key}`"
          class="text-xs px-3 py-1.5 border border-[--color-border] rounded-full hover:border-[--color-primary] hover:text-[--color-primary] transition-colors"
        >
          {{ $t(`categories.${cat.key}`) }}
        </NuxtLink>
      </div>
      <AppButton :href="localePath('/')">{{ t('error.back_home') }}</AppButton>
    </main>
    <AppFooter />
  </div>
</template>
