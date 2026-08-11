<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
    <RouterLink
      to="/"
      class="mb-8 flex items-center gap-2 text-xl font-bold text-primary"
      aria-label="StudyNest home"
    >
      <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
        S
      </span>
      StudyNest
    </RouterLink>

    <div class="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-card">
      <RouterView />
    </div>
  </div>
</template>
