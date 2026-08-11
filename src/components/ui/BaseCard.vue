<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string
    padding?: 'none' | 'md' | 'lg'
  }>(),
  {
    as: 'div',
    padding: 'md',
  },
)
</script>

<template>
  <component
    :is="as"
    class="rounded-xl border border-border bg-surface shadow-card"
    :class="padding === 'md' ? 'p-5' : padding === 'lg' ? 'p-6' : ''"
  >
    <slot />
  </component>
</template>
