<script setup lang="ts">
import type { Component } from 'vue'

defineOptions({ inheritAttrs: false })

defineProps<{
  label?: string
  modelValue?: string
  error?: string
  icon?: Component
  options: { value: string; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const id = `select-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-sm font-medium text-primary">{{ label }}</label>
    <div class="relative">
      <component
        :is="icon"
        v-if="icon"
        :size="16"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <select
        :id="id"
        v-bind="$attrs"
        :value="modelValue"
        class="h-10 w-full appearance-none rounded-lg border border-border bg-surface px-3 pr-9 text-sm text-primary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        :class="icon ? 'pl-9' : ''"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <svg
        class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
    <p v-if="error" class="text-sm text-danger">{{ error }}</p>
  </div>
</template>
