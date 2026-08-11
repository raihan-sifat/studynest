<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{
  title: string
  message: string
  confirmLabel?: string
  busy?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <BaseModal :title="title" :open="true" @close="emit('close')">
    <p class="text-sm text-secondary">{{ message }}</p>
    <div class="mt-6 flex justify-end gap-2">
      <BaseButton variant="secondary" :disabled="busy" @click="emit('close')">Cancel</BaseButton>
      <BaseButton variant="danger" :disabled="busy" @click="emit('confirm')">
        {{ busy ? 'Deleting…' : (confirmLabel ?? 'Delete') }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
