import { watchEffect } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const isDark = useLocalStorage('studynest-theme', () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  watchEffect(() => {
    document.documentElement.classList.toggle('dark', isDark.value)
  })

  function toggle(): void {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
})