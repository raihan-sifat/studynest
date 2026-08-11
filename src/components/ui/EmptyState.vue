<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon?: Component
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 py-12 text-center">
    <div
      v-if="icon"
      class="flex h-12 w-12 items-center justify-center rounded-xl bg-background text-muted"
    >
      <component :is="icon" :size="24" />
    </div>
    <h3 class="text-base font-semibold text-primary">{{ title }}</h3>
    <p v-if="description" class="max-w-sm text-sm text-secondary">{{ description }}</p>
    <div v-if="$slots.default" class="mt-2">
      <slot />
    </div>
  </div>
</template>
