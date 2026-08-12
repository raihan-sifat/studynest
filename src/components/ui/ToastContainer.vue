<script setup lang="ts">
import { AlertCircle, CheckCircle2, Info, X } from '@lucide/vue'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const

const tones = {
  success: 'text-on-accent bg-accent',
  error: 'text-on-danger bg-danger',
  info: 'text-on-accent bg-info',
} as const
</script>

<template>
  <Teleport to="body">
    <div
      aria-live="polite"
      class="pointer-events-none fixed left-1/2 top-4 z-toast flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-4 sm:top-4 sm:translate-x-0"
    >
      <TransitionGroup
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="translate-y-[-8px] opacity-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-for="item in toast.toasts"
          :key="item.id"
          :role="item.type === 'error' ? 'alert' : 'status'"
          class="pointer-events-auto flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-card"
          :class="tones[item.type]"
        >
          <component :is="icons[item.type]" :size="18" class="mt-0.5 shrink-0" aria-hidden="true" />
          <span class="min-w-0 flex-1">{{ item.message }}</span>
          <button
            type="button"
            class="focus-ring -m-1 shrink-0 rounded-md p-1 opacity-80 transition-opacity hover:opacity-100"
            :aria-label="`Dismiss notification: ${item.message}`"
            @click="toast.dismiss(item.id)"
          >
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>