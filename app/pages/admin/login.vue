<!-- pages/admin/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: false })
defineI18nRoute(false)

const account  = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

async function login() {
  if (!account.value || !password.value) return
  loading.value = true
  error.value   = ''
  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { account: account.value, password: password.value },
    })
    await navigateTo('/admin/questions')
  } catch (err: any) {
    error.value = err?.data?.message ?? '帳號或密碼錯誤'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div class="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
      <div class="flex items-center justify-between mb-1">
        <h1 class="text-lg font-bold text-slate-800">後台登入</h1>
        <NuxtLink to="/" class="text-xs text-slate-400 hover:text-indigo-500 transition-colors">
          ← 回到首頁
        </NuxtLink>
      </div>
      <p class="text-xs text-slate-400 mb-6">Engineer Interview Hub 管理後台</p>

      <div class="flex flex-col gap-4">
        <div>
          <label class="text-xs font-medium text-slate-600 block mb-1">帳號</label>
          <input
            v-model="account"
            type="text"
            autocomplete="username"
            class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @keydown.enter="login"
          />
        </div>
        <div>
          <label class="text-xs font-medium text-slate-600 block mb-1">密碼</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @keydown.enter="login"
          />
        </div>

        <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

        <button
          @click="login"
          :disabled="loading || !account || !password"
          class="bg-indigo-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-indigo-600 disabled:bg-indigo-200 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? '登入中…' : '登入' }}
        </button>
      </div>
    </div>
  </div>
</template>
