<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string
    error?: string
    hint?: string
    modelValue?: string
    type?: string
    placeholder?: string
    autocomplete?: string
  }>(),
  {
    label: undefined,
    error: undefined,
    hint: undefined,
    modelValue: '',
    type: 'text',
    placeholder: undefined,
    autocomplete: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const id = `input-${Math.random().toString(36).slice(2, 9)}`
const errorId = `${id}-error`
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="text-sm font-medium text-primary">{{ label }}</label>
    <input
      :id="id"
      :type="props.type"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? errorId : undefined"
      class="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-primary placeholder:text-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" :id="errorId" class="text-sm text-danger">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-muted">{{ hint }}</p>
  </div>
</template>
