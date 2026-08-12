<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { addDays, addMonths, addWeeks, startOfISOWeek, startOfMonth, startOfToday, subDays, subMonths, subWeeks } from 'date-fns'
import { BookOpen, CheckCircle2, Download, Flag, ListTodo, Play, Target, Timer, TrendingDown, TrendingUp } from '@lucide/vue'
import { useStudySessionsStore } from '@/stores/studySessions'
import { useTasksStore } from '@/stores/tasks'
import { useGoalsStore } from '@/stores/goals'
import { useCoursesStore } from '@/stores/courses'
import { formatMinutes, formatSessionTime, minutesPerMonth, percentChange, totalMinutesBetween } from '@/utils/time'
import { goalProgressPercent } from '@/utils/progress'
import { downloadCsv, toCsv } from '@/utils/csv'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import BarChart from '@/components/charts/BarChart.vue'
import GaugeChart from '@/components/charts/GaugeChart.vue'

type PeriodKey = 'day' | 'week' | 'month'

const router = useRouter()
const sessionsStore = useStudySessionsStore()
const tasksStore = useTasksStore()
const goalsStore = useGoalsStore()
const coursesStore = useCoursesStore()

const loaded = ref(false)
const period = ref<PeriodKey>('week')
const chartMonths = ref('12')

const periodOptions = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
]

const chartMonthOptions = [
  { value: '12', label: 'Last 12 months' },
  { value: '6', label: 'Last 6 months' },
  { value: '3', label: 'Last 3 months' },
]

const previousPeriodLabels: Record<PeriodKey, string> = {
  day: 'yesterday',
  week: 'last week',
  month: 'last month',
}

function rangeFor(key: PeriodKey): { from: Date; to: Date } {
  const today = startOfToday()
  if (key === 'day') {
    return { from: today, to: addDays(today, 1) }
  }
  if (key === 'week') {
    const weekStart = startOfISOWeek(today)
    return { from: weekStart, to: addWeeks(weekStart, 1) }
  }
  const monthStart = startOfMonth(today)
  return { from: monthStart, to: addMonths(monthStart, 1) }
}

function previousRangeFor(key: PeriodKey): { from: Date; to: Date } {
  const today = startOfToday()
  if (key === 'day') {
    return { from: subDays(today, 1), to: today }
  }
  if (key === 'week') {
    const weekStart = startOfISOWeek(today)
    return { from: subWeeks(weekStart, 1), to: weekStart }
  }
  const monthStart = startOfMonth(today)
  return { from: subMonths(monthStart, 1), to: monthStart }
}

const studyMinutes = computed(() => {
  const { from, to } = rangeFor(period.value)
  return totalMinutesBetween(sessionsStore.sessions, from, to)
})

const previousStudyMinutes = computed(() => {
  const { from, to } = previousRangeFor(period.value)
  return totalMinutesBetween(sessionsStore.sessions, from, to)
})

const studyTrend = computed(() => percentChange(studyMinutes.value, previousStudyMinutes.value))

const totalTasks = computed(() => tasksStore.tasks.length)
const doneTasks = computed(() => tasksStore.tasks.filter((task) => task.status === 'done').length)
const taskPercent = computed(() =>
  totalTasks.value === 0 ? 0 : Math.round((doneTasks.value / totalTasks.value) * 100),
)

const courseCounts = computed(() => ({
  active: coursesStore.courses.filter((course) => course.status === 'active').length,
  completed: coursesStore.courses.filter((course) => course.status === 'completed').length,
  archived: coursesStore.courses.filter((course) => course.status === 'archived').length,
}))
const totalCourses = computed(() => coursesStore.courses.length)

const segmentPercent = (count: number) =>
  totalCourses.value === 0 ? 0 : Math.round((count / totalCourses.value) * 100)

const activeGoals = computed(() => goalsStore.goals.filter((goal) => goal.status === 'active'))
const achievedGoals = computed(() =>
  goalsStore.goals.filter((goal) => goal.status === 'achieved' || goal.currentValue >= goal.targetValue),
)
const goalsProgress = computed(() => {
  const measurable = goalsStore.goals.filter((goal) => goal.status !== 'archived')
  if (measurable.length === 0) {
    return 0
  }
  const total = measurable.reduce(
    (sum, goal) => sum + goalProgressPercent(goal.currentValue, goal.targetValue),
    0,
  )
  return Math.round(total / measurable.length)
})

const monthly = computed(() => minutesPerMonth(sessionsStore.sessions, Number(chartMonths.value)))
const chartLabels = computed(() => monthly.value.map((item) => item.label))
const chartValues = computed(() => monthly.value.map((item) => item.minutes))

const courseTitleOf = (courseId: string | null) =>
  courseId ? coursesStore.byId.get(courseId)?.title ?? '' : ''

function exportCsv(): void {
  const rows: (string | number)[][] = [
    ['Date', 'Course', 'Duration (min)', 'Focus', 'Description'],
    ...sessionsStore.sessions.map((session) => [
      formatSessionTime(session.startedAt),
      courseTitleOf(session.courseId),
      session.durationMinutes ?? 0,
      session.focusRating ?? '',
      session.description ?? '',
    ]),
  ]
  downloadCsv('studynest-sessions.csv', toCsv(rows))
}

onMounted(async () => {
  await Promise.all([
    sessionsStore.fetchSessions(),
    tasksStore.fetchTasks(),
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
        <h1 class="text-2xl font-bold text-primary">Dashboard</h1>
        <p class="mt-1 text-sm text-secondary">Your study overview, tasks, goals, and activity.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <BaseSelect
          v-model="period"
          :options="periodOptions"
          class="h-10 rounded-full border-border bg-surface px-4"
          aria-label="Time period"
        />
        <BaseButton size="sm" variant="secondary" @click="exportCsv">
          <Download :size="16" />
          Export
        </BaseButton>
        <BaseButton size="sm" @click="router.push({ name: 'sessions' })">
          <Play :size="16" />
          New session
        </BaseButton>
      </div>
    </div>

    <div v-if="!loaded" class="space-y-6" aria-label="Loading dashboard">
      <div class="grid gap-5 md:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-40 animate-pulse rounded-[20px] border border-border bg-surface" />
      </div>
      <div class="grid gap-5 lg:grid-cols-3">
        <div class="h-72 animate-pulse rounded-[20px] border border-border bg-surface" />
        <div class="h-72 animate-pulse rounded-[20px] border border-border bg-surface lg:col-span-2" />
      </div>
    </div>

    <template v-else>
      <div class="grid gap-5 md:grid-cols-3">
        <BaseCard class="relative overflow-hidden rounded-[20px] border-accent bg-accent text-white">
          <div
            class="pointer-events-none absolute inset-0 opacity-20"
            aria-hidden="true"
            style="background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0 1px, transparent 1px 12px), radial-gradient(circle at 82% 18%, rgba(255,255,255,0.5) 0 2px, transparent 2px 16px)"
          />
          <div class="relative">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-white/85">Study time</span>
              <button
                class="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                :aria-label="`View study sessions (${formatMinutes(studyMinutes)} this period)`"
                @click="router.push({ name: 'sessions' })"
              >
                <Timer :size="16" />
              </button>
            </div>
            <p class="mt-3 text-3xl font-bold tabular-nums">{{ formatMinutes(studyMinutes) }}</p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span
                v-if="studyTrend !== null"
                class="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold"
              >
                <TrendingUp v-if="studyTrend >= 0" :size="13" />
                <TrendingDown v-else :size="13" />
                {{ Math.abs(studyTrend) }}%
                <span class="font-normal text-white/75">vs {{ previousPeriodLabels[period] }}</span>
              </span>
              <span v-else class="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">No data yet</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="rounded-[20px]">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-secondary">Tasks completed</span>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full bg-background text-muted transition-colors hover:text-accent"
              :aria-label="`View tasks (${doneTasks} of ${totalTasks} done)`"
              @click="router.push({ name: 'tasks' })"
            >
              <ListTodo :size="16" />
            </button>
          </div>
          <p class="mt-3 text-3xl font-bold tabular-nums text-primary">{{ taskPercent }}%</p>
          <span
            class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent"
          >
            <CheckCircle2 :size="13" />
            {{ doneTasks }} of {{ totalTasks }} tasks done
          </span>
        </BaseCard>

        <BaseCard class="rounded-[20px]">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-secondary">Courses</span>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full bg-background text-muted transition-colors hover:text-accent"
              :aria-label="`View courses (${totalCourses} total)`"
              @click="router.push({ name: 'courses' })"
            >
              <BookOpen :size="16" />
            </button>
          </div>
          <p class="mt-3 text-3xl font-bold tabular-nums text-primary">{{ totalCourses }}</p>
          <div class="mt-3 flex h-2.5 overflow-hidden rounded-full bg-background" role="img" aria-label="Course status breakdown">
            <div class="bg-accent" :style="{ width: `${segmentPercent(courseCounts.active)}%` }" />
            <div class="bg-primary" :style="{ width: `${segmentPercent(courseCounts.completed)}%` }" />
            <div class="bg-muted" :style="{ width: `${segmentPercent(courseCounts.archived)}%` }" />
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-secondary">
            <span class="inline-flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-accent" />Active ({{ courseCounts.active }})
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-primary" />Completed ({{ courseCounts.completed }})
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-muted" />Archived ({{ courseCounts.archived }})
            </span>
          </div>
        </BaseCard>
      </div>

      <div class="mt-5 grid gap-5 lg:grid-cols-3">
        <BaseCard class="flex flex-col rounded-[20px]">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-semibold text-primary">Goal progress</h3>
              <p class="mt-0.5 text-xs text-secondary">Average across your goals</p>
            </div>
          </div>

          <div v-if="goalsStore.goals.length === 0" class="flex flex-1 items-center">
            <EmptyState
              :icon="Target"
              title="No goals yet"
              description="Set your first goal to see progress here."
            >
              <BaseButton size="sm" @click="router.push({ name: 'goals' })">Go to Goals</BaseButton>
            </EmptyState>
          </div>

          <template v-else>
            <div class="flex flex-1 items-end">
              <div class="w-full">
                <GaugeChart :value="goalsProgress" caption="overall progress" />
              </div>
            </div>

            <div class="mt-4 flex items-center justify-center gap-4 text-xs text-secondary">
              <span class="inline-flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-accent" />Achieved ({{ achievedGoals.length }})
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-accent-soft" />In progress ({{ activeGoals.length }})
              </span>
            </div>

            <span
              class="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent"
            >
              <Flag :size="13" />
              {{ achievedGoals.length }} of {{ goalsStore.goals.length }} goals achieved
            </span>

            <p class="mt-3 text-center text-xs text-muted">
              Keep up the momentum — consistent study turns goals into results.
            </p>
          </template>
        </BaseCard>

        <BaseCard class="flex flex-col rounded-[20px] lg:col-span-2">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="font-semibold text-primary">Study activity</h3>
              <p class="mt-0.5 text-xs text-secondary">Focused minutes per month</p>
            </div>
            <BaseSelect
              v-model="chartMonths"
              :options="chartMonthOptions"
              class="h-9 rounded-full border-border bg-surface px-4 text-xs"
              aria-label="Chart range"
            />
          </div>

          <div v-if="sessionsStore.sessions.length === 0" class="flex flex-1 items-center">
            <EmptyState
              :icon="Timer"
              title="No study sessions yet"
              description="Start a study session to see your activity chart."
            >
              <BaseButton size="sm" @click="router.push({ name: 'sessions' })">
                <Play :size="14" />
                Start a session
              </BaseButton>
            </EmptyState>
          </div>

          <div v-else class="mt-4 flex-1">
            <BarChart :labels="chartLabels" :values="chartValues" label="Minutes" />
          </div>
        </BaseCard>
      </div>
    </template>
  </div>
</template>
