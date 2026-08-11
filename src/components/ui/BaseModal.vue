<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { X } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    title: string
    open: boolean
  }>(),
  {
    open: false,
  },
)

const emit = defineEmits<{
  close: []
}>()

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.open) {
    emit('close')
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center" @click.self="emit('close')">
        <div class="absolute inset-0 bg-black/40" aria-hidden="true" />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="title"
          class="relative z-10 w-full max-w-md rounded-t-xl border border-border bg-surface p-6 shadow-card sm:rounded-xl"
        >
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-primary">{{ title }}</h2>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-primary"
              aria-label="Close dialog"
              @click="emit('close')"
            >
              <X :size="18" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
