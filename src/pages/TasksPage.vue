<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { format, isPast, startOfToday } from 'date-fns'
import { Check, ListTodo, Pencil, Plus, Search, Trash2 } from '@lucide/vue'
import { useTasksStore } from '@/stores/tasks'
import { useCoursesStore } from '@/stores/courses'
import type { Task, TaskPriority } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import TaskFormModal from '@/components/tasks/TaskFormModal.vue'

const tasksStore = useTasksStore()
const coursesStore = useCoursesStore()

const formOpen = ref(false)
const editingTask = ref<Task | null>(null)
const deletingTask = ref<Task | null>(null)
const deleting = ref(false)

const statusLabels: Record<string, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
}

const statusTones: Record<string, 'neutral' | 'soft' | 'accent'> = {
  todo: 'neutral',
  in_progress: 'soft',
  done: 'accent',
}

const priorityTones: Record<TaskPriority, 'neutral' | 'soft' | 'danger'> = {
  low: 'neutral',
  medium: 'soft',
  high: 'danger',
}

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

const courseOptions = computed(() => [
  { value: 'all', label: 'All courses' },
  ...coursesStore.courses.map((course) => ({ value: course.id, label: course.title })),
])

const sortOptions = [
  { value: 'created', label: 'Newest first' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
]

const overdueIds = computed(() => {
  const today = startOfToday()
  const ids = new Set<string>()
  for (const task of tasksStore.tasks) {
    if (task.status !== 'done' && task.dueDate) {
      const due = new Date(`${task.dueDate}T00:00:00`)
      if (isPast(due) && due < today) {
        ids.add(task.id)
      }
    }
  }
  return ids
})

const courseTitle = (courseId: string | null) =>
  courseId ? coursesStore.byId.get(courseId)?.title ?? 'Unknown course' : ''

const courseColor = (courseId: string | null) => coursesStore.byId.get(courseId ?? '')?.color ?? ''

onMounted(async () => {
  await Promise.all([tasksStore.fetchTasks(), coursesStore.fetchCourses()])
})

function openCreate(): void {
  editingTask.value = null
  formOpen.value = true
}

function openEdit(task: Task): void {
  editingTask.value = task
  formOpen.value = true
}

function closeForm(): void {
  formOpen.value = false
  editingTask.value = null
}

async function toggleTask(task: Task): Promise<void> {
  await tasksStore.toggleStatus(task.id)
}

async function confirmDelete(): Promise<void> {
  const task = deletingTask.value
  if (!task) {
    return
  }
  deleting.value = true
  const ok = await tasksStore.removeTask(task.id)
  deleting.value = false
  if (ok) {
    deletingTask.value = null
  }
}

function formattedDate(date: string | null): string {
  return date ? format(new Date(`${date}T00:00:00`), 'MMM d') : ''
}

function clearFilters(): void {
  tasksStore.setFilters({ courseId: 'all', status: 'all', search: '' })
}
</script>

<template>
  <div>
    <PageHeader title="Tasks" description="Assignments with status, priority, and deadlines.">
      <BaseButton size="sm" @click="openCreate">
        <Plus :size="16" />
        New task
      </BaseButton>
    </PageHeader>

    <p v-if="tasksStore.error" class="mb-4 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
      {{ tasksStore.error }}
    </p>

    <div class="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-card sm:flex-row sm:items-end">
      <div class="flex-1">
        <BaseInput
          v-model="tasksStore.filters.search"
          label="Search"
          placeholder="Search tasks…"
        />
      </div>
      <div class="grid grid-cols-2 gap-3 sm:flex">
        <BaseSelect v-model="tasksStore.filters.status" label="Status" :options="statusOptions" />
        <BaseSelect v-model="tasksStore.filters.courseId" label="Course" :options="courseOptions" />
        <BaseSelect v-model="tasksStore.sortKey" label="Sort" :options="sortOptions" />
      </div>
    </div>

    <div v-if="tasksStore.loading" class="space-y-3" aria-label="Loading tasks">
      <div v-for="i in 5" :key="i" class="h-20 animate-pulse rounded-xl border border-border bg-surface" />
    </div>

    <div
      v-else-if="tasksStore.tasks.length === 0"
      class="rounded-xl border border-border bg-surface shadow-card"
    >
      <EmptyState
        :icon="ListTodo"
        title="No tasks yet"
        description="Add your first assignment, homework, or study task to start tracking it."
      >
        <BaseButton size="sm" @click="openCreate">
          <Plus :size="16" />
          Create your first task
        </BaseButton>
      </EmptyState>
    </div>

    <div v-else-if="tasksStore.filteredTasks.length === 0" class="rounded-xl border border-border bg-surface shadow-card">
      <EmptyState
        :icon="Search"
        title="No matching tasks"
        description="Try adjusting your search, status, or course filters."
      >
        <BaseButton size="sm" variant="secondary" @click="clearFilters">Clear filters</BaseButton>
      </EmptyState>
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="task in tasksStore.filteredTasks"
        :key="task.id"
        class="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-muted"
        :class="task.status === 'done' ? 'opacity-60' : ''"
      >
        <button
          class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors"
          :class="
            task.status === 'done'
              ? 'border-accent bg-accent text-white'
              : 'border-muted text-transparent hover:border-accent hover:text-accent'
          "
          :aria-label="task.status === 'done' ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`"
          @click="toggleTask(task)"
        >
          <Check :size="13" />
        </button>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-medium" :class="task.status === 'done' ? 'line-through text-muted' : 'text-primary'">
              {{ task.title }}
            </span>
            <BaseBadge :tone="statusTones[task.status]">{{ statusLabels[task.status] }}</BaseBadge>
            <BaseBadge :tone="priorityTones[task.priority]">
              {{ task.priority[0].toUpperCase() + task.priority.slice(1) }}
            </BaseBadge>
            <span
              v-if="task.courseId"
              class="inline-flex items-center gap-1.5 text-xs text-secondary"
            >
              <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: courseColor(task.courseId) }" />
              {{ courseTitle(task.courseId) }}
            </span>
            <span
              v-if="task.dueDate"
              class="text-xs"
              :class="overdueIds.has(task.id) ? 'font-medium text-danger' : 'text-muted'"
            >
              {{ overdueIds.has(task.id) ? 'Overdue · ' : '' }}{{ formattedDate(task.dueDate) }}
            </span>
            <span v-if="task.estimatedMinutes" class="text-xs text-muted">
              {{ task.estimatedMinutes }} min
            </span>
          </div>
          <p v-if="task.description" class="mt-1 text-sm text-secondary">{{ task.description }}</p>
        </div>

        <div class="flex shrink-0 gap-1">
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-primary"
            :aria-label="`Edit ${task.title}`"
            @click="openEdit(task)"
          >
            <Pencil :size="16" />
          </button>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
            :aria-label="`Delete ${task.title}`"
            @click="deletingTask = task"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </li>
    </ul>

    <TaskFormModal :open="formOpen" :task="editingTask" @close="closeForm" />

    <BaseConfirmDialog
      v-if="deletingTask"
      title="Delete task?"
      :message="`Delete “${deletingTask.title}”? This cannot be undone.`"
      :busy="deleting"
      @close="deletingTask = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
