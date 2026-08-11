<script setup lang="ts">
import { ref, watch } from 'vue'
import { z } from 'zod'
import { useCoursesStore } from '@/stores/courses'
import { COURSE_COLORS, type Course } from '@/types'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const props = defineProps<{
  open: boolean
  course: Course | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const coursesStore = useCoursesStore()

const courseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  description: z.string().max(2000, 'Description must be under 2000 characters'),
  color: z.string().min(1, 'Pick a color'),
  targetDate: z.string(),
  status: z.enum(['active', 'completed', 'archived']),
})

const title = ref('')
const description = ref('')
const color = ref<string>(COURSE_COLORS[0])
const targetDate = ref('')
const status = ref<'active' | 'completed' | 'archived'>('active')
const fieldErrors = ref<Record<string, string>>({})
const formError = ref('')
const saving = ref(false)

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

watch(
  () => props.open,
  (open) => {
    if (open) {
      title.value = props.course?.title ?? ''
      description.value = props.course?.description ?? ''
      color.value = props.course?.color ?? COURSE_COLORS[0]
      targetDate.value = props.course?.targetDate ?? ''
      status.value = props.course?.status ?? 'active'
      fieldErrors.value = {}
      formError.value = ''
    }
  },
)

async function submit(): Promise<void> {
  const result = courseSchema.safeParse({
    title: title.value,
    description: description.value,
    color: color.value,
    targetDate: targetDate.value,
    status: status.value,
  })
  if (!result.success) {
    fieldErrors.value = result.error.flatten().fieldErrors as Record<string, string>
    return
  }
  fieldErrors.value = {}
  formError.value = ''
  saving.value = true
  try {
    const saved =
      props.course === null
        ? await coursesStore.createCourse({
            title: title.value,
            description: description.value || null,
            color: color.value,
            targetDate: targetDate.value || null,
            status: status.value,
          })
        : await coursesStore.updateCourse(props.course.id, {
            title: title.value,
            description: description.value || null,
            color: color.value,
            targetDate: targetDate.value || null,
            status: status.value,
          })
    if (saved === null) {
      formError.value = coursesStore.error || 'Something went wrong'
      return
    }
    emit('saved')
    emit('close')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal
    :title="course === null ? 'New course' : 'Edit course'"
    :open="open"
    @close="emit('close')"
  >
    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <BaseInput
        v-model="title"
        label="Title"
        placeholder="e.g. Linear Algebra"
        :error="fieldErrors.title"
      />
      <BaseInput
        v-model="description"
        label="Description"
        placeholder="What is this course about?"
        :error="fieldErrors.description"
      />

      <div class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-primary">Color</span>
        <div class="flex items-center gap-2" role="radiogroup" aria-label="Course color">
          <button
            v-for="option in COURSE_COLORS"
            :key="option"
            type="button"
            class="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
            :class="color === option ? 'border-primary' : 'border-transparent'"
            :style="{ backgroundColor: option }"
            :aria-label="`Use color ${option}`"
            :aria-checked="color === option"
            role="radio"
            @click="color = option"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <BaseInput
          v-model="targetDate"
          label="Target date"
          type="date"
          :error="fieldErrors.targetDate"
        />
        <BaseSelect
          v-model="status"
          label="Status"
          :options="statusOptions"
          :error="fieldErrors.status"
        />
      </div>

      <p v-if="formError" class="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
        {{ formError }}
      </p>

      <div class="mt-2 flex justify-end gap-2">
        <BaseButton variant="secondary" :disabled="saving" @click="emit('close')">Cancel</BaseButton>
        <BaseButton type="submit" :disabled="saving">
          {{ saving ? 'Saving…' : course === null ? 'Create course' : 'Save changes' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
