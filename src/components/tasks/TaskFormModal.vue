<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import { useTasksStore } from '@/stores/tasks'
import { useCoursesStore } from '@/stores/courses'
import type { Task } from '@/types'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const props = defineProps<{
  open: boolean
  task: Task | null
  defaultCourseId?: string | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const tasksStore = useTasksStore()
const coursesStore = useCoursesStore()

const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300, 'Title must be under 300 characters'),
  description: z.string().max(2000, 'Description must be under 2000 characters'),
  courseId: z.string(),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string(),
  estimatedMinutes: z.string(),
})

const title = ref('')
const description = ref('')
const courseId = ref('none')
const status = ref<'todo' | 'in_progress' | 'done'>('todo')
const priority = ref<'low' | 'medium' | 'high'>('medium')
const dueDate = ref('')
const estimatedMinutes = ref('')
const fieldErrors = ref<Record<string, string>>({})
const formError = ref('')
const saving = ref(false)

const statusOptions = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const courseOptions = computed(() => {
  const options = coursesStore.courses.map((course) => ({ value: course.id, label: course.title }))
  return [{ value: 'none', label: 'No course' }, ...options]
})

watch(
  () => props.open,
  (open) => {
    if (open) {
      title.value = props.task?.title ?? ''
      description.value = props.task?.description ?? ''
      courseId.value = props.task?.courseId ?? props.defaultCourseId ?? 'none'
      status.value = props.task?.status ?? 'todo'
      priority.value = props.task?.priority ?? 'medium'
      dueDate.value = props.task?.dueDate ?? ''
      estimatedMinutes.value =
        props.task?.estimatedMinutes !== null && props.task?.estimatedMinutes !== undefined
          ? String(props.task.estimatedMinutes)
          : ''
      fieldErrors.value = {}
      formError.value = ''
    }
  },
)

async function submit(): Promise<void> {
  const result = taskSchema.safeParse({
    title: title.value,
    description: description.value,
    courseId: courseId.value,
    status: status.value,
    priority: priority.value,
    dueDate: dueDate.value,
    estimatedMinutes: estimatedMinutes.value,
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
      status: status.value,
      priority: priority.value,
      dueDate: dueDate.value || null,
      estimatedMinutes: estimatedMinutes.value ? Number(estimatedMinutes.value) : null,
    }
    const saved =
      props.task === null
        ? await tasksStore.createTask(input)
        : await tasksStore.updateTask(props.task.id, input)
    if (saved === null) {
      formError.value = tasksStore.error || 'Something went wrong'
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
    :title="task === null ? 'New task' : 'Edit task'"
    :open="open"
    @close="emit('close')"
  >
    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <BaseInput v-model="title" label="Title" placeholder="e.g. Finish chapter 3 exercises" :error="fieldErrors.title" />
      <BaseInput
        v-model="description"
        label="Description"
        placeholder="Optional details"
        :error="fieldErrors.description"
      />
      <BaseSelect
        v-model="courseId"
        label="Course"
        :options="courseOptions"
        :error="fieldErrors.courseId"
      />
      <div class="grid grid-cols-2 gap-4">
        <BaseSelect v-model="status" label="Status" :options="statusOptions" :error="fieldErrors.status" />
        <BaseSelect v-model="priority" label="Priority" :options="priorityOptions" :error="fieldErrors.priority" />
        <BaseInput v-model="dueDate" label="Due date" type="date" :error="fieldErrors.dueDate" />
        <BaseInput
          v-model="estimatedMinutes"
          label="Estimated time (min)"
          type="number"
          min="1"
          placeholder="e.g. 45"
          :error="fieldErrors.estimatedMinutes"
        />
      </div>

      <p v-if="formError" class="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
        {{ formError }}
      </p>

      <div class="mt-2 flex justify-end gap-2">
        <BaseButton variant="secondary" :disabled="saving" @click="emit('close')">Cancel</BaseButton>
        <BaseButton type="submit" :disabled="saving">
          {{ saving ? 'Saving…' : task === null ? 'Create task' : 'Save changes' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
