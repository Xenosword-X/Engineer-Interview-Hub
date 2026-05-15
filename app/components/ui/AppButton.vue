<!-- components/ui/AppButton.vue -->
<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  href?: string
}>()

const variantClass = {
  primary:   'bg-indigo-500 text-white hover:bg-indigo-600',
  secondary: 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100',
  ghost:     'text-[--color-text-secondary] hover:bg-slate-100',
}

const sizeClass = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
}
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :class="[
      'inline-flex items-center gap-1.5 font-medium rounded-[7px] transition-colors duration-150',
      'focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:outline-none',
      'min-h-11 lg:min-h-9',
      variantClass[variant ?? 'primary'],
      sizeClass[size ?? 'md'],
    ]"
  >
    <slot />
  </component>
</template>
