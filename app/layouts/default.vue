<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    <div class="flex flex-1 max-w-360 mx-auto w-full">
      <AppSidebar />
      <main class="flex-1 min-w-0 pb-16 lg:pb-0">
        <slot />
      </main>
    </div>
    <AppFooter />
    <AppBottomNav />
  </div>
</template>
