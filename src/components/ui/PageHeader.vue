<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="mb-6 flex items-start justify-between gap-4">
    <div>
      <h2 class="text-xl font-semibold text-primary">{{ title }}</h2>
      <p v-if="description" class="mt-1 text-sm text-secondary">{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="flex shrink-0 items-center gap-2">
      <slot />
    </div>
  </div>
</template>
