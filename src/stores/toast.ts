import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

let nextId = 1

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  const timers = new Map<number, ReturnType<typeof setTimeout>>()

  function push(type: ToastType, message: string, duration = 3500): void {
    const id = nextId++
    toasts.value.push({ id, type, message })
    if (toasts.value.length > 4) toasts.value.shift()
    if (duration > 0) {
      timers.set(
        id,
        setTimeout(() => dismiss(id), duration),
      )
    }
  }

  function dismiss(id: number): void {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, push, dismiss }
})