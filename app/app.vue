<!-- app.vue -->
<script setup lang="ts">
const user = useSupabaseUser()
const { fetchBookmarks } = useBookmarks()

// Fetch bookmarks immediately when user is logged in
watch(user, (u) => {
  if (u) fetchBookmarks()
}, { immediate: true })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
