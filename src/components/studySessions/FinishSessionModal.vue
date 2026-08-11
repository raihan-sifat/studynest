<script setup lang="ts">
import { ref, watch } from 'vue'
import { Star } from '@lucide/vue'
import type { FocusRating } from '@/types'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'

const props = defineProps<{
  open: boolean
  busy: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [rating: FocusRating, description: string]
}>()

const rating = ref<FocusRating | null>(null)
const description = ref('')

watch(
  () => props.open,
  (open) => {
    if (open) {
      rating.value = null
      description.value = ''
    }
  },
)

const ratings: { value: FocusRating; label: string }[] = [
  { value: 1, label: 'Rough' },
  { value: 2, label: 'Unfocused' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Focused' },
  { value: 5, label: 'Deep focus' },
]

function submit(): void {
  if (rating.value === null) {
    return
  }
  emit('confirm', rating.value, description.value.trim())
}
</script>

<template>
  <BaseModal :open="open" title="Finish session" @close="emit('close')">
    <form @submit.prevent="submit">
      <p class="text-sm text-secondary">How focused were you during this session?</p>

      <div class="mt-3 flex justify-center gap-1" role="radiogroup" aria-label="Focus rating">
        <button
          v-for="option in ratings"
          :key="option.value"
          type="button"
          class="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-background"
          :aria-label="`${option.value} out of 5: ${option.label}`"
          :aria-checked="rating === option.value"
          role="radio"
          @click="rating = option.value"
        >
          <Star
            :size="26"
            :class="
              (rating ?? 0) >= option.value
                ? 'fill-accent text-accent'
                : 'text-muted hover:text-accent'
            "
          />
          <span class="text-[10px] text-muted">{{ option.label }}</span>
        </button>
      </div>

      <div class="mt-4">
        <BaseTextarea
          v-model="description"
          label="What did you work on? (optional)"
          placeholder="e.g. Reviewed chapter 4 and solved practice problems"
          :rows="3"
        />
      </div>

      <div class="mt-5 flex justify-end gap-2">
        <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
        <BaseButton type="submit" :disabled="rating === null || busy">
          {{ busy ? 'Saving…' : 'Save session' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
