<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { format, isPast, startOfToday } from 'date-fns'
import { CalendarDays, Check, Flag, Play, Plus, Timer } from '@lucide/vue'
import { useTasksStore } from '@/stores/tasks'
import { useStudySessionsStore } from '@/stores/studySessions'
import { useGoalsStore } from '@/stores/goals'
import { useCoursesStore } from '@/stores/courses'
import { dayKey, groupEventsByDay, parseDayKey } from '@/utils/calendar'
import { formatMinutes, formatSessionTime } from '@/utils/time'
import { goalProgressPercent } from '@/utils/progress'
import type { Task } from '@/types'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import MonthGrid from '@/components/calendar/MonthGrid.vue'

const router = useRouter()
const tasksStore = useTasksStore()
const sessionsStore = useStudySessionsStore()
const goalsStore = useGoalsStore()
const coursesStore = useCoursesStore()

const loaded = ref(false)
const selectedDay = ref(dayKey(new Date()))

const eventsByDay = computed(() =>
  groupEventsByDay(tasksStore.tasks, sessionsStore.sessions, goalsStore.goals),
)

const dayEvents = computed(() => eventsByDay.value.get(selectedDay.value))

const selectedDate = computed(() => parseDayKey(selectedDay.value))

const hasAnyEvents = computed(
  () =>
    tasksStore.tasks.length > 0 ||
    sessionsStore.sessions.length > 0 ||
    goalsStore.goals.length > 0,
)

const hasSelectedDayEvents = computed(
  () =>
    dayEvents.value !== undefined &&
    (dayEvents.value.tasks.length > 0 ||
      dayEvents.value.sessions.length > 0 ||
      dayEvents.value.goals.length > 0),
)

const courseColorOf = (courseId: string | null) =>
  courseId ? coursesStore.byId.get(courseId)?.color ?? '' : ''

const courseTitleOf = (courseId: string | null) =>
  courseId ? coursesStore.byId.get(courseId)?.title ?? '' : ''

const progressOf = (currentValue: number, targetValue: number) =>
  goalProgressPercent(currentValue, targetValue)

function isOverdue(task: Task): boolean {
  if (task.status === 'done' || !task.dueDate) {
    return false
  }
  const due = new Date(`${task.dueDate}T00:00:00`)
  return isPast(due) && due < startOfToday()
}

async function toggleTask(task: Task): Promise<void> {
  await tasksStore.toggleStatus(task.id)
}

onMounted(async () => {
  await Promise.all([
    tasksStore.fetchTasks(),
    sessionsStore.fetchSessions(),
    goalsStore.fetchGoals(),
    coursesStore.fetchCourses(),
  ])
  loaded.value = true
})
</script>

<template>
  <div>
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-primary">Calendar</h1>
        <p class="mt-1 text-sm text-secondary">Assignments, study sessions, and goal deadlines.</p>
      </div>
      <BaseButton size="sm" @click="router.push({ name: 'tasks' })">
        <Plus :size="16" />
        New task
      </BaseButton>
    </div>

    <div v-if="!loaded" class="grid gap-5 lg:grid-cols-[1fr_320px]" aria-label="Loading calendar">
      <div class="h-96 animate-pulse rounded-[20px] border border-border bg-surface" />
      <div class="h-72 animate-pulse rounded-[20px] border border-border bg-surface" />
    </div>

    <div v-else class="grid gap-5 lg:grid-cols-[1fr_320px]">
      <BaseCard class="rounded-[20px]">
        <MonthGrid
          :events-by-day="eventsByDay"
          :selected-day="selectedDay"
          :courses-by-id="coursesStore.byId"
          @select="selectedDay = $event"
        />
      </BaseCard>

      <BaseCard class="h-fit rounded-[20px]">
        <div v-if="!hasAnyEvents">
          <EmptyState
            :icon="CalendarDays"
            title="Nothing planned yet"
            description="Add tasks, record study sessions, or set goal deadlines — they'll all show up here."
          >
            <div class="flex gap-2">
              <BaseButton size="sm" @click="router.push({ name: 'tasks' })">
                <Plus :size="14" />
                Add a task
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="router.push({ name: 'sessions' })">
                <Play :size="14" />
                Study
              </BaseButton>
            </div>
          </EmptyState>
        </div>

        <div v-else-if="!hasSelectedDayEvents">
          <EmptyState
            :icon="CalendarDays"
            :title="format(selectedDate, 'EEEE, MMMM d')"
            description="Nothing planned on this day. Click another day to see its events."
          />
        </div>

        <template v-else>
          <h3 class="font-semibold text-primary">{{ format(selectedDate, 'EEEE, MMMM d') }}</h3>

          <div v-if="dayEvents!.tasks.length" class="mt-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wide text-muted">Tasks due</span>
              <RouterLink
                to="/app/tasks"
                class="text-xs font-medium text-accent transition-colors hover:text-primary"
              >
                View all
              </RouterLink>
            </div>
            <ul class="mt-2 space-y-1.5">
              <li
                v-for="task in dayEvents!.tasks"
                :key="task.id"
                class="flex items-center gap-2.5 rounded-lg border border-border bg-background px-2.5 py-2"
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
                  :class="[
                    task.status === 'done' ? 'text-muted line-through' : 'text-primary',
                    isOverdue(task) ? 'font-medium text-danger' : '',
                  ]"
                >
                  {{ task.title }}
                </span>
                <span
                  v-if="task.courseId"
                  class="inline-flex shrink-0 items-center gap-1.5 text-xs text-secondary"
                  :title="courseTitleOf(task.courseId)"
                >
                  <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: courseColorOf(task.courseId) }" />
                </span>
                <span v-if="isOverdue(task)" class="shrink-0 text-xs font-medium text-danger">Overdue</span>
              </li>
            </ul>
          </div>

          <div v-if="dayEvents!.sessions.length" class="mt-5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wide text-muted">Study sessions</span>
              <RouterLink
                to="/app/sessions"
                class="text-xs font-medium text-accent transition-colors hover:text-primary"
              >
                View all
              </RouterLink>
            </div>
            <ul class="mt-2 space-y-1.5">
              <li
                v-for="session in dayEvents!.sessions"
                :key="session.id"
                class="flex items-center gap-2.5 rounded-lg border border-border bg-background px-2.5 py-2"
              >
                <Timer :size="14" class="shrink-0 text-accent" />
                <span class="min-w-0 flex-1 truncate text-sm text-primary">
                  {{ formatSessionTime(session.startedAt) }}
                </span>
                <span class="shrink-0 text-xs font-semibold text-accent">
                  {{ formatMinutes(session.durationMinutes ?? 0) }}
                </span>
                <span
                  v-if="session.focusRating"
                  class="shrink-0 text-xs text-secondary"
                  :aria-label="`Focus rating ${session.focusRating} out of 5`"
                >
                  {{ '★'.repeat(session.focusRating) }}<span class="text-muted">{{ '★'.repeat(5 - session.focusRating) }}</span>
                </span>
              </li>
            </ul>
          </div>

          <div v-if="dayEvents!.goals.length" class="mt-5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wide text-muted">Goal deadlines</span>
              <RouterLink
                to="/app/goals"
                class="text-xs font-medium text-accent transition-colors hover:text-primary"
              >
                View all
              </RouterLink>
            </div>
            <ul class="mt-2 space-y-1.5">
              <li
                v-for="goal in dayEvents!.goals"
                :key="goal.id"
                class="flex items-center gap-2.5 rounded-lg border border-border bg-background px-2.5 py-2"
              >
                <Flag :size="14" class="shrink-0 text-warning" />
                <span class="min-w-0 flex-1 truncate text-sm text-primary">{{ goal.title }}</span>
                <span class="shrink-0 text-xs font-semibold text-accent">
                  {{ progressOf(goal.currentValue, goal.targetValue) }}%
                </span>
              </li>
            </ul>
          </div>
        </template>
      </BaseCard>
    </div>
  </div>
</template>
