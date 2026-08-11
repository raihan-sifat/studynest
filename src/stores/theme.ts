import { watchEffect } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const isDark = useLocalStorage('studynest-theme', false)

  watchEffect(() => {
    document.documentElement.classList.toggle('dark', isDark.value)
  })

  function toggle(): void {
    isDark.value = !isDark.value
  }

  function setDark(value: boolean): void {
    isDark.value = value
  }

  return { isDark, toggle, setDark }
})
