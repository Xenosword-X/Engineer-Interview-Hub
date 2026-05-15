<!-- layouts/home.vue -->
<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    <main class="flex-1 pb-16 lg:pb-0">
      <slot />
    </main>
    <AppFooter />
    <AppBottomNav />
  </div>
</template>
