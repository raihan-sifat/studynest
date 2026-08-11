<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format, isPast, startOfToday } from 'date-fns'
import { ArrowLeft, BookOpen, CalendarDays, Check, CheckSquare, ListTodo, Pencil, Plus, StickyNote, Target, Trash2 } from '@lucide/vue'
import { useCoursesStore } from '@/stores/courses'
import { useTasksStore } from '@/stores/tasks'
import type { Course, Task } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import CourseFormModal from '@/components/courses/CourseFormModal.vue'
import TaskFormModal from '@/components/tasks/TaskFormModal.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const coursesStore = useCoursesStore()
const tasksStore = useTasksStore()

const courseId = computed(() => String(route.params.id ?? ''))
const course = ref<Course | null>(null)
const loading = ref(true)
const notFound = ref(false)
const formOpen = ref(false)
const taskFormOpen = ref(false)
const deletingTask = ref<Task | null>(null)
const deleting = ref(false)

const statusLabels: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
}

const courseTasks = computed(() =>
  tasksStore.tasks.filter((task) => task.courseId === courseId.value),
)

const overdueIds = computed(() => {
  const today = startOfToday()
  const ids = new Set<string>()
  for (const task of courseTasks.value) {
    if (task.status !== 'done' && task.dueDate) {
      const due = new Date(`${task.dueDate}T00:00:00`)
      if (isPast(due) && due < today) {
        ids.add(task.id)
      }
    }
  }
  return ids
})

async function load(): Promise<void> {
  loading.value = true
  notFound.value = false
  const cached = coursesStore.byId.get(courseId.value)
  if (cached) {
    course.value = cached
  }
  const fetched = await coursesStore.fetchCourse(courseId.value)
  if (fetched) {
    course.value = fetched
  } else if (!cached) {
    notFound.value = true
  }
  await tasksStore.fetchTasks()
  loading.value = false
}

onMounted(load)
watch(courseId, load)

function formattedDate(date: string | null): string {
  return date ? format(new Date(`${date}T00:00:00`), 'MMM d, yyyy') : ''
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
</script>

<template>
  <div>
    <button
      class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-primary"
      @click="router.push({ name: 'courses' })"
    >
      <ArrowLeft :size="16" />
      All courses
    </button>

    <div v-if="loading" class="space-y-4">
      <div class="h-10 w-2/3 animate-pulse rounded-lg bg-surface" />
      <div class="h-40 animate-pulse rounded-xl bg-surface" />
    </div>

    <template v-else-if="course">
      <PageHeader :title="course.title" :description="course.description ?? undefined">
        <BaseButton size="sm" variant="secondary" @click="formOpen = true">
          <Pencil :size="16" />
          Edit
        </BaseButton>
      </PageHeader>

      <div class="flex flex-wrap items-center gap-3">
        <div class="h-4 w-4 rounded-full" :style="{ backgroundColor: course.color }" aria-hidden="true" />
        <BaseBadge :tone="course.status === 'active' ? 'soft' : course.status === 'completed' ? 'accent' : 'neutral'">
          {{ statusLabels[course.status] }}
        </BaseBadge>
        <span v-if="course.targetDate" class="inline-flex items-center gap-1.5 text-sm text-secondary">
          <CalendarDays :size="16" />
          Target: {{ formattedDate(course.targetDate) }}
        </span>
        <span class="text-sm text-muted">Created {{ formattedDate(course.createdAt.slice(0, 10)) }}</span>
      </div>

      <div class="mt-6 grid gap-4 lg:grid-cols-2">
        <BaseCard>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <ListTodo :size="18" class="text-accent" />
              <h3 class="font-semibold text-primary">Tasks</h3>
              <span class="rounded-md bg-background px-1.5 py-0.5 text-xs text-secondary">
                {{ courseTasks.length }}
              </span>
            </div>
            <BaseButton size="sm" variant="secondary" @click="taskFormOpen = true">
              <Plus :size="14" />
              New task
            </BaseButton>
          </div>

          <div v-if="tasksStore.loading" class="mt-3 space-y-2">
            <div v-for="i in 2" :key="i" class="h-12 animate-pulse rounded-lg bg-background" />
          </div>

          <div v-else-if="courseTasks.length === 0" class="mt-2">
            <EmptyState
              :icon="CheckSquare"
              title="No tasks yet"
              description="Add tasks for this course to keep track of assignments and deadlines."
            />
          </div>

          <ul v-else class="mt-3 space-y-2">
            <li
              v-for="task in courseTasks"
              :key="task.id"
              class="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
              :class="task.status === 'done' ? 'opacity-60' : ''"
            >
              <button
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors"
                :class="
                  task.status === 'done'
                    ? 'border-accent bg-accent text-white'
                    : 'border-muted text-transparent hover:border-accent hover:text-accent'
                "
                :aria-label="`Toggle ${task.title}`"
                @click="toggleTask(task)"
              >
                <Check :size="13" />
              </button>
              <span
                class="min-w-0 flex-1 truncate text-sm"
                :class="task.status === 'done' ? 'text-muted line-through' : 'text-primary'"
              >
                {{ task.title }}
              </span>
              <span
                v-if="task.dueDate"
                class="shrink-0 text-xs"
                :class="overdueIds.has(task.id) ? 'font-medium text-danger' : 'text-muted'"
              >
                {{ overdueIds.has(task.id) ? 'Overdue · ' : '' }}{{ formattedDate(task.dueDate) }}
              </span>
              <button
                class="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-surface hover:text-danger"
                :aria-label="`Delete ${task.title}`"
                @click="deletingTask = task"
              >
                <Trash2 :size="14" />
              </button>
            </li>
          </ul>
        </BaseCard>

        <BaseCard>
          <div class="flex items-center gap-2">
            <StickyNote :size="18" class="text-accent" />
            <h3 class="font-semibold text-primary">Notes</h3>
          </div>
          <EmptyState
            :icon="BookOpen"
            title="No notes yet"
            description="Bilingual notes for this course will appear here in Milestone 6."
          />
        </BaseCard>

        <BaseCard>
          <div class="flex items-center gap-2">
            <Target :size="18" class="text-accent" />
            <h3 class="font-semibold text-primary">Goals</h3>
          </div>
          <EmptyState
            :icon="Target"
            title="No goals yet"
            description="Goals for this course will appear here in Milestone 8."
          />
        </BaseCard>

        <BaseCard>
          <div class="flex items-center gap-2">
            <CalendarDays :size="18" class="text-accent" />
            <h3 class="font-semibold text-primary">Study sessions</h3>
          </div>
          <EmptyState
            :icon="CalendarDays"
            title="No sessions yet"
            description="Study sessions for this course will appear here in Milestone 7."
          />
        </BaseCard>
      </div>

      <CourseFormModal :open="formOpen" :course="course" @close="formOpen = false" @saved="load" />
      <TaskFormModal
        :open="taskFormOpen"
        :task="null"
        :default-course-id="course.id"
        @close="taskFormOpen = false"
      />
      <BaseConfirmDialog
        v-if="deletingTask"
        title="Delete task?"
        :message="`Delete “${deletingTask.title}”? This cannot be undone.`"
        :busy="deleting"
        @close="deletingTask = null"
        @confirm="confirmDelete"
      />
    </template>

    <div v-else-if="notFound" class="rounded-xl border border-border bg-surface shadow-card">
      <EmptyState
        :icon="BookOpen"
        title="Course not found"
        description="This course doesn't exist or you don't have access to it."
      >
        <BaseButton size="sm" variant="secondary" @click="router.push({ name: 'courses' })">
          Back to courses
        </BaseButton>
      </EmptyState>
    </div>
  </div>
</template>
