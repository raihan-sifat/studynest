<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'accent' | 'soft' | 'neutral' | 'danger'
  }>(),
  {
    tone: 'neutral',
  },
)
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
    :class="[
      tone === 'accent' && 'bg-accent text-on-accent',
      tone === 'soft' && 'bg-accent-soft text-accent',
      tone === 'neutral' && 'bg-background text-secondary',
      tone === 'danger' && 'bg-danger/10 text-danger',
    ]"
  >
    <slot />
  </span>
</template>
