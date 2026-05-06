<!-- layouts/admin.vue -->
<script setup lang="ts">
async function logout() {
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
  } finally {
    await navigateTo('/admin/login')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/questions" class="text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors">
          Engineer Interview Hub
        </NuxtLink>
        <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
          後台管理
        </span>
      </div>
      <button
        @click="logout"
        class="text-xs text-slate-400 hover:text-red-500 transition-colors"
      >
        登出
      </button>
    </header>
    <main class="max-w-5xl mx-auto px-6 py-8">
      <slot />
    </main>
  </div>
</template>
