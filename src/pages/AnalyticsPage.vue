<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { startOfISOWeek } from 'date-fns'
import { BookOpen, CheckCircle2, Clock3, Flag, Play, Target, Timer } from '@lucide/vue'
import { useStudySessionsStore } from '@/stores/studySessions'
import { useTasksStore } from '@/stores/tasks'
import { useGoalsStore } from '@/stores/goals'
import { useCoursesStore } from '@/stores/courses'
import { averageSessionMinutes, formatMinutes, minutesPerDay, minutesPerMonth, totalMinutes, weekdayLabels } from '@/utils/time'
import { goalProgressPercent } from '@/utils/progress'
import { courseStatusCounts, goalStatusCounts, taskCompletionStats } from '@/utils/stats'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'
import BarChart from '@/components/charts/BarChart.vue'
import DonutChart from '@/components/charts/DonutChart.vue'

const router = useRouter()
const sessionsStore = useStudySessionsStore()
const tasksStore = useTasksStore()
const goalsStore = useGoalsStore()
const coursesStore = useCoursesStore()

const loaded = ref(false)
const chartMonths = ref('12')

const chartMonthOptions = [
  { value: '12', label: 'Last 12 months' },
  { value: '6', label: 'Last 6 months' },
  { value: '3', label: 'Last 3 months' },
]

const totalStudyMinutes = computed(() => totalMinutes(sessionsStore.sessions))
const avgSessionMinutes = computed(() => averageSessionMinutes(sessionsStore.sessions))
const taskStats = computed(() => taskCompletionStats(tasksStore.tasks))
const courseCounts = computed(() => courseStatusCounts(coursesStore.courses))
const goalCounts = computed(() => goalStatusCounts(goalsStore.goals))

const monthly = computed(() => minutesPerMonth(sessionsStore.sessions, Number(chartMonths.value)))
const monthlyLabels = computed(() => monthly.value.map((item) => item.label))
const monthlyValues = computed(() => monthly.value.map((item) => item.minutes))

const weekStart = computed(() => startOfISOWeek(new Date()))
const weeklyLabels = computed(() => weekdayLabels(weekStart.value))
const weeklyValues = computed(() => minutesPerDay(sessionsStore.sessions, weekStart.value))

const measurableGoals = computed(() => goalsStore.goals.filter((goal) => goal.status !== 'archived'))
const goalLabels = computed(() =>
  measurableGoals.value.map((goal) =>
    goal.title.length > 18 ? `${goal.title.slice(0, 18)}…` : goal.title,
  ),
)
const goalValues = computed(() =>
  measurableGoals.value.map((goal) => goalProgressPercent(goal.currentValue, goal.targetValue)),
)

const courseDonutLabels = ['Active', 'Completed', 'Archived']
const courseDonutValues = computed(() => [
  courseCounts.value.active,
  courseCounts.value.completed,
  courseCounts.value.archived,
])
const courseDonutColors = ['--color-accent', '--color-brand', '--color-muted']

const hasCourses = computed(() => coursesStore.courses.length > 0)
const hasGoals = computed(() => measurableGoals.value.length > 0)
const hasSessions = computed(() => sessionsStore.sessions.length > 0)

const loadError = computed(
  () => sessionsStore.error || tasksStore.error || goalsStore.error || coursesStore.error,
)

function clearLoadError(): void {
  sessionsStore.error = ''
  tasksStore.error = ''
  goalsStore.error = ''
  coursesStore.error = ''
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
        <h1 class="text-2xl font-bold text-primary">Analytics</h1>
        <p class="mt-1 text-sm text-secondary">Study time, tasks, courses, and goal insights.</p>
      </div>
    </div>

    <ErrorBanner v-if="loadError" :message="loadError" @dismiss="clearLoadError" />

    <div v-if="!loaded" class="space-y-6" aria-label="Loading analytics">
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="i in 4" :key="i" class="h-28 animate-pulse rounded-[20px] border border-border bg-surface" />
      </div>
      <div class="grid gap-5 lg:grid-cols-2">
        <div class="h-72 animate-pulse rounded-[20px] border border-border bg-surface" />
        <div class="h-72 animate-pulse rounded-[20px] border border-border bg-surface" />
      </div>
    </div>

    <template v-else>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <BaseCard class="rounded-[20px]">
          <div class="flex items-center gap-2">
            <Timer :size="16" class="text-accent" />
            <span class="text-sm font-medium text-secondary">Total study time</span>
          </div>
          <p class="mt-2 text-2xl font-bold tabular-nums text-primary">{{ formatMinutes(totalStudyMinutes) }}</p>
          <p class="mt-1 text-xs text-muted">{{ sessionsStore.sessions.length }} sessions recorded</p>
        </BaseCard>

        <BaseCard class="rounded-[20px]">
          <div class="flex items-center gap-2">
            <Play :size="16" class="text-accent" />
            <span class="text-sm font-medium text-secondary">Study sessions</span>
          </div>
          <p class="mt-2 text-2xl font-bold tabular-nums text-primary">{{ sessionsStore.sessions.length }}</p>
          <p class="mt-1 text-xs text-muted">Since you started</p>
        </BaseCard>

        <BaseCard class="rounded-[20px]">
          <div class="flex items-center gap-2">
            <Clock3 :size="16" class="text-accent" />
            <span class="text-sm font-medium text-secondary">Avg session length</span>
          </div>
          <p class="mt-2 text-2xl font-bold tabular-nums text-primary">{{ formatMinutes(avgSessionMinutes) }}</p>
          <p class="mt-1 text-xs text-muted">Per study session</p>
        </BaseCard>

        <BaseCard class="rounded-[20px]">
          <div class="flex items-center gap-2">
            <CheckCircle2 :size="16" class="text-accent" />
            <span class="text-sm font-medium text-secondary">Task completion</span>
          </div>
          <p class="mt-2 text-2xl font-bold tabular-nums text-primary">{{ taskStats.percent }}%</p>
          <p class="mt-1 text-xs text-muted">{{ taskStats.done }} of {{ taskStats.total }} tasks done</p>
        </BaseCard>
      </div>

      <div class="mt-5 grid gap-5 lg:grid-cols-2">
        <BaseCard class="flex flex-col rounded-[20px]">
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

          <div v-if="!hasSessions" class="flex flex-1 items-center">
            <EmptyState
              :icon="Timer"
              title="No study sessions yet"
              description="Start a study session to see your monthly activity."
            >
              <BaseButton size="sm" @click="router.push({ name: 'sessions' })">
                <Play :size="14" />
                Start a session
              </BaseButton>
            </EmptyState>
          </div>

          <div v-else class="mt-4 flex-1">
            <BarChart :labels="monthlyLabels" :values="monthlyValues" label="Minutes" />
          </div>
        </BaseCard>

        <BaseCard class="flex flex-col rounded-[20px]">
          <div>
            <h3 class="font-semibold text-primary">Weekly activity</h3>
            <p class="mt-0.5 text-xs text-secondary">Focused minutes per day this week</p>
          </div>

          <div v-if="!hasSessions" class="flex flex-1 items-center">
            <EmptyState
              :icon="Clock3"
              title="No study sessions yet"
              description="Your daily activity for this week will appear here."
            />
          </div>

          <div v-else class="mt-4 flex-1">
            <BarChart :labels="weeklyLabels" :values="weeklyValues" label="Minutes" />
          </div>
        </BaseCard>
      </div>

      <div class="mt-5 grid gap-5 lg:grid-cols-2">
        <BaseCard class="flex flex-col rounded-[20px]">
          <div>
            <h3 class="font-semibold text-primary">Course distribution</h3>
            <p class="mt-0.5 text-xs text-secondary">Your courses by status</p>
          </div>

          <div v-if="!hasCourses" class="flex flex-1 items-center">
            <EmptyState
              :icon="BookOpen"
              title="No courses yet"
              description="Add a course to see your distribution."
            >
              <BaseButton size="sm" @click="router.push({ name: 'courses' })">Go to Courses</BaseButton>
            </EmptyState>
          </div>

          <template v-else>
            <div class="mt-4 flex flex-1 items-center justify-center">
              <div class="w-56">
                <DonutChart
                  :labels="courseDonutLabels"
                  :values="courseDonutValues"
                  :colors="courseDonutColors"
                />
              </div>
            </div>

            <div class="mt-4 flex items-center justify-center gap-4 text-xs text-secondary">
              <span class="inline-flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-accent" />Active ({{ courseCounts.active }})
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-brand" />Completed ({{ courseCounts.completed }})
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-muted" />Archived ({{ courseCounts.archived }})
              </span>
            </div>
          </template>
        </BaseCard>

        <BaseCard class="flex flex-col rounded-[20px]">
          <div>
            <h3 class="font-semibold text-primary">Goal progress</h3>
            <p class="mt-0.5 text-xs text-secondary">Progress toward each active goal</p>
          </div>

          <div v-if="!hasGoals" class="flex flex-1 items-center">
            <EmptyState
              :icon="Target"
              title="No goals yet"
              description="Set a goal to see its progress here."
            >
              <BaseButton size="sm" @click="router.push({ name: 'goals' })">Go to Goals</BaseButton>
            </EmptyState>
          </div>

          <div v-else class="mt-4 flex-1">
            <BarChart :labels="goalLabels" :values="goalValues" label="Progress" horizontal />
            <p class="mt-3 flex items-center justify-center gap-1.5 text-xs text-secondary">
              <Flag :size="13" class="text-accent" />
              {{ goalCounts.achieved }} of {{ goalsStore.goals.length }} goals achieved
            </p>
          </div>
        </BaseCard>
      </div>
    </template>
  </div>
</template>
