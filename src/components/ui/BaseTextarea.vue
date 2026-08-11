<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    error?: string
    hint?: string
    modelValue?: string
    placeholder?: string
    rows?: number
  }>(),
  {
    label: undefined,
    error: undefined,
    hint: undefined,
    modelValue: '',
    placeholder: undefined,
    rows: 4,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const id = `textarea-${Math.random().toString(36).slice(2, 9)}`
const errorId = `${id}-error`
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-sm font-medium text-primary">{{ label }}</label>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? errorId : undefined"
      class="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary placeholder:text-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="error" :id="errorId" class="text-sm text-danger">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-muted">{{ hint }}</p>
  </div>
</template>
