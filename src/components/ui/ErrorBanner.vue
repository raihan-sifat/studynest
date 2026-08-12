<script setup lang="ts">
import { AlertCircle, X } from '@lucide/vue'

defineProps<{
  message: string
}>()

const emit = defineEmits<{
  dismiss: []
}>()
</script>

<template>
  <div
    class="mb-4 flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger"
    role="alert"
  >
    <AlertCircle :size="18" class="mt-0.5 shrink-0" aria-hidden="true" />
    <span class="min-w-0 flex-1">{{ message }}</span>
    <button
      type="button"
      class="focus-ring -m-1 shrink-0 rounded-md p-1 text-danger/70 transition-colors hover:text-danger"
      aria-label="Dismiss error"
      @click="emit('dismiss')"
    >
      <X :size="14" />
    </button>
  </div>
</template>