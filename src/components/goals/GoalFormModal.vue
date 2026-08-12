<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import { useGoalsStore } from '@/stores/goals'
import { useCoursesStore } from '@/stores/courses'
import type { Goal, GoalStatus } from '@/types'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const props = defineProps<{
  open: boolean
  goal: Goal | null
  defaultCourseId?: string | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const goalsStore = useGoalsStore()
const coursesStore = useCoursesStore()

const goalSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
    description: z.string().max(2000, 'Description must be under 2000 characters'),
    courseId: z.string(),
    targetValue: z.string(),
    currentValue: z.string(),
    deadline: z.string(),
    status: z.enum(['active', 'achieved', 'archived']),
  })
  .superRefine((values, ctx) => {
    const target = Number(values.targetValue)
    const current = Number(values.currentValue)
    if (!Number.isFinite(target) || target <= 0) {
      ctx.addIssue({ code: 'custom', path: ['targetValue'], message: 'Target must be greater than 0' })
    }
    if (!Number.isFinite(current) || current < 0) {
      ctx.addIssue({ code: 'custom', path: ['currentValue'], message: 'Current must be 0 or more' })
    }
    if (Number.isFinite(target) && Number.isFinite(current) && current > target) {
      ctx.addIssue({ code: 'custom', path: ['currentValue'], message: 'Current cannot exceed target' })
    }
  })

const title = ref('')
const description = ref('')
const courseId = ref('none')
const targetValue = ref('')
const currentValue = ref('')
const deadline = ref('')
const status = ref<GoalStatus>('active')
const fieldErrors = ref<Record<string, string>>({})
const formError = ref('')
const saving = ref(false)

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'achieved', label: 'Achieved' },
  { value: 'archived', label: 'Archived' },
]

const courseOptions = computed(() => {
  const options = coursesStore.courses.map((course) => ({ value: course.id, label: course.title }))
  return [{ value: 'none', label: 'No course' }, ...options]
})

watch(
  () => props.open,
  (open) => {
    if (open) {
      title.value = props.goal?.title ?? ''
      description.value = props.goal?.description ?? ''
      courseId.value = props.goal?.courseId ?? props.defaultCourseId ?? 'none'
      targetValue.value = props.goal ? String(props.goal.targetValue) : ''
      currentValue.value = props.goal ? String(props.goal.currentValue) : '0'
      deadline.value = props.goal?.deadline ?? ''
      status.value = props.goal?.status ?? 'active'
      fieldErrors.value = {}
      formError.value = ''
    }
  },
)

async function submit(): Promise<void> {
  const result = goalSchema.safeParse({
    title: title.value,
    description: description.value,
    courseId: courseId.value,
    targetValue: targetValue.value,
    currentValue: currentValue.value,
    deadline: deadline.value,
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
    const input = {
      title: title.value,
      description: description.value || null,
      courseId: courseId.value === 'none' ? null : courseId.value,
      targetValue: Number(targetValue.value),
      currentValue: Number(currentValue.value),
      deadline: deadline.value || null,
      status: status.value,
    }
    const saved =
      props.goal === null
        ? await goalsStore.createGoal(input)
        : await goalsStore.updateGoal(props.goal.id, input)
    if (saved === null) {
      formError.value = goalsStore.error || 'Something went wrong'
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
    :title="goal === null ? 'New goal' : 'Edit goal'"
    :open="open"
    @close="emit('close')"
  >
    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <BaseInput v-model="title" label="Title" placeholder="e.g. Finish 30 chapters of Python" :error="fieldErrors.title" />
      <BaseTextarea
        v-model="description"
        label="Description"
        placeholder="Optional details about this goal"
        :rows="3"
        :error="fieldErrors.description"
      />
      <BaseSelect v-model="courseId" label="Course" :options="courseOptions" :error="fieldErrors.courseId" />
      <div class="grid grid-cols-2 gap-4">
        <BaseInput
          v-model="targetValue"
          label="Target value"
          type="number"
          min="1"
          step="any"
          placeholder="e.g. 30"
          :error="fieldErrors.targetValue"
        />
        <BaseInput
          v-model="currentValue"
          label="Current value"
          type="number"
          min="0"
          step="any"
          placeholder="e.g. 12"
          :error="fieldErrors.currentValue"
          hint="How much you've done so far"
        />
        <BaseInput v-model="deadline" label="Deadline" type="date" :error="fieldErrors.deadline" />
        <BaseSelect v-model="status" label="Status" :options="statusOptions" :error="fieldErrors.status" />
      </div>

      <p v-if="formError" class="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
        {{ formError }}
      </p>

      <div class="mt-2 flex justify-end gap-2">
        <BaseButton variant="secondary" :disabled="saving" @click="emit('close')">Cancel</BaseButton>
        <BaseButton type="submit" :disabled="saving">
          {{ saving ? 'Saving…' : goal === null ? 'Create goal' : 'Save changes' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
