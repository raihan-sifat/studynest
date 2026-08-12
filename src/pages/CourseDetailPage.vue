<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format, isPast, startOfToday } from 'date-fns'
import { ArrowLeft, BookOpen, CalendarDays, Check, CheckSquare, ListTodo, Pencil, Play, Plus, StickyNote, Target, Timer, Trash2 } from '@lucide/vue'
import { useCoursesStore } from '@/stores/courses'
import { useTasksStore } from '@/stores/tasks'
import { useNotesStore } from '@/stores/notes'
import { useGoalsStore } from '@/stores/goals'
import { useStudySessionsStore } from '@/stores/studySessions'
import type { Course, Goal, Note, StudySession, Task } from '@/types'
import { formatMinutes, formatSessionTime, totalMinutes } from '@/utils/time'
import { goalPhase, goalProgressPercent } from '@/utils/progress'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import CourseFormModal from '@/components/courses/CourseFormModal.vue'
import TaskFormModal from '@/components/tasks/TaskFormModal.vue'
import NoteFormModal from '@/components/notes/NoteFormModal.vue'
import GoalFormModal from '@/components/goals/GoalFormModal.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const coursesStore = useCoursesStore()
const tasksStore = useTasksStore()
const notesStore = useNotesStore()
const goalsStore = useGoalsStore()
const sessionsStore = useStudySessionsStore()

const courseId = computed(() => String(route.params.id ?? ''))
const course = ref<Course | null>(null)
const loading = ref(true)
const notFound = ref(false)
const formOpen = ref(false)
const taskFormOpen = ref(false)
const noteFormOpen = ref(false)
const goalFormOpen = ref(false)
const deletingTask = ref<Task | null>(null)
const deleting = ref(false)
const deletingNote = ref<Note | null>(null)
const deletingNoteBusy = ref(false)
const deletingGoal = ref<Goal | null>(null)
const deletingGoalBusy = ref(false)
const deletingSession = ref<StudySession | null>(null)
const deletingSessionBusy = ref(false)

const statusLabels: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
}

const courseTasks = computed(() =>
  tasksStore.tasks.filter((task) => task.courseId === courseId.value),
)

const courseNotes = computed(() =>
  notesStore.notes.filter((note) => note.courseId === courseId.value),
)

const courseGoals = computed(() =>
  goalsStore.goals.filter((goal) => goal.courseId === courseId.value),
)

const progressOf = (goal: Goal) => goalProgressPercent(goal.currentValue, goal.targetValue)

const courseSessions = computed(() => sessionsStore.sessionsForCourse(courseId.value))

const courseSessionMinutes = computed(() => totalMinutes(courseSessions.value))

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
  await notesStore.fetchNotes()
  await goalsStore.fetchGoals()
  await sessionsStore.fetchSessions()
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

async function confirmDeleteNote(): Promise<void> {
  const note = deletingNote.value
  if (!note) {
    return
  }
  deletingNoteBusy.value = true
  const ok = await notesStore.removeNote(note.id)
  deletingNoteBusy.value = false
  if (ok) {
    deletingNote.value = null
  }
}

async function confirmDeleteGoal(): Promise<void> {
  const goal = deletingGoal.value
  if (!goal) {
    return
  }
  deletingGoalBusy.value = true
  const ok = await goalsStore.removeGoal(goal.id)
  deletingGoalBusy.value = false
  if (ok) {
    deletingGoal.value = null
  }
}

async function confirmDeleteSession(): Promise<void> {
  const session = deletingSession.value
  if (!session) {
    return
  }
  deletingSessionBusy.value = true
  const ok = await sessionsStore.removeSession(session.id)
  deletingSessionBusy.value = false
  if (ok) {
    deletingSession.value = null
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
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <StickyNote :size="18" class="text-accent" />
              <h3 class="font-semibold text-primary">Notes</h3>
              <span class="rounded-md bg-background px-1.5 py-0.5 text-xs text-secondary">
                {{ courseNotes.length }}
              </span>
            </div>
            <BaseButton size="sm" variant="secondary" @click="noteFormOpen = true">
              <Plus :size="14" />
              New note
            </BaseButton>
          </div>

          <div v-if="notesStore.loading" class="mt-3 space-y-2">
            <div v-for="i in 2" :key="i" class="h-12 animate-pulse rounded-lg bg-background" />
          </div>

          <div v-else-if="courseNotes.length === 0" class="mt-2">
            <EmptyState
              :icon="BookOpen"
              title="No notes yet"
              description="Write bilingual English and Chinese notes for this course."
            />
          </div>

          <ul v-else class="mt-3 space-y-2">
            <li
              v-for="note in courseNotes"
              :key="note.id"
              class="rounded-lg border border-border bg-background px-3 py-2.5"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="min-w-0 flex-1 truncate text-sm font-medium text-primary">
                  {{ note.title }}
                </span>
                <button
                  class="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-surface hover:text-danger"
                  :aria-label="`Delete ${note.title}`"
                  @click="deletingNote = note"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
              <p v-if="note.englishContent" class="mt-1 line-clamp-2 text-xs text-secondary">
                {{ note.englishContent }}
              </p>
              <div v-if="note.tags.length" class="mt-1.5 flex flex-wrap gap-1">
                <span
                  v-for="tag in note.tags"
                  :key="tag"
                  class="inline-flex items-center rounded bg-accent-soft px-1.5 py-0.5 text-[11px] font-medium text-accent"
                >
                  #{{ tag }}
                </span>
              </div>
            </li>
          </ul>
        </BaseCard>

        <BaseCard>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Target :size="18" class="text-accent" />
              <h3 class="font-semibold text-primary">Goals</h3>
              <span class="rounded-md bg-background px-1.5 py-0.5 text-xs text-secondary">
                {{ courseGoals.length }}
              </span>
            </div>
            <BaseButton size="sm" variant="secondary" @click="goalFormOpen = true">
              <Plus :size="14" />
              New goal
            </BaseButton>
          </div>

          <div v-if="goalsStore.loading" class="mt-3 space-y-2">
            <div v-for="i in 2" :key="i" class="h-12 animate-pulse rounded-lg bg-background" />
          </div>

          <div v-else-if="courseGoals.length === 0" class="mt-2">
            <EmptyState
              :icon="Target"
              title="No goals yet"
              description="Set targets for this course and track your progress toward them."
            />
          </div>

          <ul v-else class="mt-3 space-y-2">
            <li
              v-for="goal in courseGoals"
              :key="goal.id"
              class="rounded-lg border border-border bg-background px-3 py-2.5"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="min-w-0 flex-1 truncate text-sm font-medium text-primary">
                  {{ goal.title }}
                </span>
                <div class="flex shrink-0 items-center gap-1">
                  <span class="text-xs font-semibold" :class="goalPhase(goal) === 'overdue' ? 'text-danger' : 'text-accent'">
                    {{ progressOf(goal) }}%
                  </span>
                  <button
                    class="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-surface hover:text-danger"
                    :aria-label="`Delete ${goal.title}`"
                    @click="deletingGoal = goal"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
              <div class="mt-1.5 flex items-center gap-2">
                <div
                  class="h-1.5 flex-1 overflow-hidden rounded-full bg-surface"
                  role="progressbar"
                  :aria-valuenow="progressOf(goal)"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-label="`Progress of ${goal.title}`"
                >
                  <div
                    class="h-full rounded-full transition-all"
                    :class="goalPhase(goal) === 'overdue' ? 'bg-danger' : 'bg-accent'"
                    :style="{ width: `${progressOf(goal)}%` }"
                  />
                </div>
                <span class="shrink-0 text-xs text-muted">{{ goal.currentValue }} / {{ goal.targetValue }}</span>
              </div>
              <p v-if="goal.deadline" class="mt-1 text-xs" :class="goalPhase(goal) === 'overdue' ? 'text-danger' : 'text-muted'">
                {{ goalPhase(goal) === 'overdue' ? 'Overdue' : 'Deadline' }} ·
                {{ formattedDate(goal.deadline) }}
              </p>
            </li>
          </ul>
        </BaseCard>

        <BaseCard>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Timer :size="18" class="text-accent" />
              <h3 class="font-semibold text-primary">Study sessions</h3>
              <span class="rounded-md bg-background px-1.5 py-0.5 text-xs text-secondary">
                {{ courseSessions.length }}
              </span>
            </div>
            <BaseButton
              size="sm"
              variant="secondary"
              @click="router.push({ name: 'sessions' })"
            >
              <Play :size="14" />
              Start session
            </BaseButton>
          </div>

          <p v-if="courseSessions.length" class="mt-2 text-xs text-secondary">
            Total focused time in this course:
            <span class="font-semibold text-accent">{{ formatMinutes(courseSessionMinutes) }}</span>
          </p>

          <div v-if="sessionsStore.loading" class="mt-3 space-y-2">
            <div v-for="i in 2" :key="i" class="h-12 animate-pulse rounded-lg bg-background" />
          </div>

          <div v-else-if="courseSessions.length === 0" class="mt-2">
            <EmptyState
              :icon="Timer"
              title="No sessions yet"
              description="Start the timer and track focused study time for this course."
            />
          </div>

          <ul v-else class="mt-3 space-y-2">
            <li
              v-for="session in courseSessions.slice(0, 5)"
              :key="session.id"
              class="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5"
            >
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-medium text-primary">
                    {{ formatSessionTime(session.startedAt) }}
                  </span>
                  <span class="text-xs font-semibold text-accent">
                    {{ formatMinutes(session.durationMinutes ?? 0) }}
                  </span>
                  <span
                    v-if="session.focusRating"
                    class="text-xs text-secondary"
                    :aria-label="`Focus rating ${session.focusRating} out of 5`"
                  >
                    {{ '★'.repeat(session.focusRating) }}<span class="text-muted">{{ '★'.repeat(5 - session.focusRating) }}</span>
                  </span>
                </div>
                <p v-if="session.description" class="mt-0.5 truncate text-xs text-secondary">
                  {{ session.description }}
                </p>
              </div>
              <button
                class="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-surface hover:text-danger"
                :aria-label="`Delete session from ${formatSessionTime(session.startedAt)}`"
                @click="deletingSession = session"
              >
                <Trash2 :size="14" />
              </button>
            </li>
          </ul>
        </BaseCard>
      </div>

      <CourseFormModal :open="formOpen" :course="course" @close="formOpen = false" @saved="load" />
      <TaskFormModal
        :open="taskFormOpen"
        :task="null"
        :default-course-id="course.id"
        @close="taskFormOpen = false"
      />
      <NoteFormModal
        :open="noteFormOpen"
        :note="null"
        :default-course-id="course.id"
        @close="noteFormOpen = false"
      />
      <GoalFormModal
        :open="goalFormOpen"
        :goal="null"
        :default-course-id="course.id"
        @close="goalFormOpen = false"
      />
      <BaseConfirmDialog
        v-if="deletingTask"
        title="Delete task?"
        :message="`Delete “${deletingTask.title}”? This cannot be undone.`"
        :busy="deleting"
        @close="deletingTask = null"
        @confirm="confirmDelete"
      />
      <BaseConfirmDialog
        v-if="deletingNote"
        title="Delete note?"
        :message="`Delete “${deletingNote.title}”? This cannot be undone.`"
        :busy="deletingNoteBusy"
        @close="deletingNote = null"
        @confirm="confirmDeleteNote"
      />
      <BaseConfirmDialog
        v-if="deletingGoal"
        title="Delete goal?"
        :message="`Delete “${deletingGoal.title}”? This cannot be undone.`"
        :busy="deletingGoalBusy"
        @close="deletingGoal = null"
        @confirm="confirmDeleteGoal"
      />
      <BaseConfirmDialog
        v-if="deletingSession"
        title="Delete session?"
        :message="`Delete the session from ${formatSessionTime(deletingSession.startedAt)}? This cannot be undone.`"
        :busy="deletingSessionBusy"
        @close="deletingSession = null"
        @confirm="confirmDeleteSession"
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
