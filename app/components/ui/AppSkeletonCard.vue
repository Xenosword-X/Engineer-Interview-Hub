<!-- components/ui/AppSkeletonCard.vue -->
<template>
  <div class="iv-skel animate-pulse">
    <div class="h-4 bg-slate-100 rounded-md w-3/4 mb-3" />
    <div class="flex gap-2">
      <div class="h-5 bg-slate-100 rounded-full w-20" />
      <div class="h-5 bg-slate-100 rounded-full w-14" />
    </div>
  </div>
</template>

<style scoped>
.iv-skel {
  border: 1px solid var(--color-border, #e2e8f0);
  border-left: 3px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 14px 16px;
  background: #ffffff;
}
</style>
