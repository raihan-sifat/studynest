<script setup lang="ts">
import { RouterView } from 'vue-router'
import BrandLogo from '@/components/ui/BrandLogo.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
    <RouterLink
      to="/"
      class="mb-8 flex items-center gap-2 text-xl font-bold text-primary"
      aria-label="StudyNest home"
    >
      <BrandLogo :size="32" />
      StudyNest
    </RouterLink>

    <div class="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-card">
      <RouterView />
    </div>
  </div>
</template>
