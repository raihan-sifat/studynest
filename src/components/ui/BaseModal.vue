<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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

const dialogEl = ref<HTMLElement | null>(null)

function focusables(): HTMLElement[] {
  if (!dialogEl.value) return []
  return [
    ...dialogEl.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ]
}

function restoreScroll(): void {
  document.body.style.overflow = ''
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.open) {
    emit('close')
    return
  }
  if (event.key !== 'Tab' || !props.open) return
  const items = focusables()
  if (items.length === 0) return
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.open,
  (isOpen, wasOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      nextTick(() => {
        const closeBtn = dialogEl.value?.querySelector<HTMLElement>('[data-modal-close]')
        ;(closeBtn ?? dialogEl.value)?.focus()
      })
    } else if (wasOpen) {
      restoreScroll()
    }
  },
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  restoreScroll()
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        ref="dialogEl"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @click.self="emit('close')"
      >
        <div class="absolute inset-0 bg-black/40" aria-hidden="true" />
        <div
          class="relative z-10 w-full max-w-md rounded-t-xl border border-border bg-surface p-6 shadow-card sm:rounded-xl"
        >
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-primary">{{ title }}</h2>
            <button
              type="button"
              data-modal-close
              class="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-primary"
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