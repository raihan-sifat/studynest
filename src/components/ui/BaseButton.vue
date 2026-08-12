<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'ghost-danger' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    type: 'button',
  },
)
</script>
<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      size === 'sm' ? 'h-8 px-3 text-sm' : size === 'lg' ? 'h-12 px-6 text-base' : 'h-10 px-4 text-sm',
      variant === 'primary' && 'bg-accent text-on-accent hover:bg-accent/90',
      variant === 'secondary' &&
        'border border-border bg-surface text-primary hover:bg-background',
      variant === 'ghost' && 'text-secondary hover:bg-background hover:text-primary',
      variant === 'ghost-danger' && 'text-danger hover:bg-danger/10 hover:text-danger',
      variant === 'danger' && 'bg-danger text-on-danger hover:bg-danger/90',
    ]"
  >
    <slot />
  </button>
</template>
