<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { BellRing, Flag, Hourglass, Pause, Play, RotateCcw, Timer, Trash2 } from '@lucide/vue'
import type { StudySession } from '@/types'
import { useStudySessionsStore, type SessionMode } from '@/stores/studySessions'
import { useCoursesStore } from '@/stores/courses'
import { useToastStore } from '@/stores/toast'
import { formatCountdown, formatElapsed, formatMinutes, formatSessionTime } from '@/utils/time'
import { initAudio, playChime } from '@/utils/sound'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import FinishSessionModal from '@/components/studySessions/FinishSessionModal.vue'

const RING_RADIUS = 106
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const sessionsStore = useStudySessionsStore()
const coursesStore = useCoursesStore()
const toast = useToastStore()

const courseFilter = ref('all')
const now = ref(Date.now())
const finishOpen = ref(false)
const finishing = ref(false)
const deletingSession = ref<StudySession | null>(null)
const deleting = ref(false)
const discardOpen = ref(false)
const expiryHandled = ref(false)

const mode = ref<SessionMode>('stopwatch')
const timerMinutes = ref(25)
const customMinutes = ref('')
const timerPresets = [5, 10, 15, 25, 30, 45, 60]

const modeOptions: { value: SessionMode; label: string; icon: typeof Timer }[] = [
  { value: 'stopwatch', label: 'Stopwatch', icon: Timer },
  { value: 'timer', label: 'Timer', icon: Hourglass },
]

let intervalId: ReturnType<typeof setInterval> | undefined

const courseOptions = computed(() => [
  { value: 'all', label: 'All sessions' },
  ...coursesStore.courses.map((course) => ({ value: course.id, label: course.title })),
])

const courseTitle = (courseId: string | null) =>
  courseId ? coursesStore.byId.get(courseId)?.title ?? 'General' : 'General'

const courseColor = (courseId: string | null) => coursesStore.byId.get(courseId ?? '')?.color ?? ''

const activeMode = computed(() => sessionsStore.active?.mode ?? 'stopwatch')
const activeCourseTitle = computed(() => courseTitle(sessionsStore.active?.courseId ?? null))
const activeCourseColor = computed(() => courseColor(sessionsStore.active?.courseId ?? null))

const remainingMs = computed(() => sessionsStore.elapsedMs(now.value))
const stopwatchLabel = computed(() => formatElapsed(remainingMs.value))
const countdownLabel = computed(() => formatCountdown(remainingMs.value))
const timerExpired = computed(() => sessionsStore.isExpired(now.value))

const timerProgress = computed(() => {
  const active = sessionsStore.active
  if (!active || active.totalMs === null || active.totalMs <= 0) {
    return 0
  }
  return Math.min(1, Math.max(0, remainingMs.value / active.totalMs))
})

const urgencyColor = computed(() => {
  if (timerExpired.value) {
    return 'danger'
  }
  if (remainingMs.value <= 60_000) {
    return 'danger'
  }
  if (remainingMs.value <= 600_000) {
    return 'warning'
  }
  return 'accent'
})

const ringStrokeClass = computed(() =>
  urgencyColor.value === 'danger' ? 'stroke-danger' : urgencyColor.value === 'warning' ? 'stroke-warning' : 'stroke-accent',
)

const digitClass = computed(() =>
  urgencyColor.value === 'danger' ? 'text-danger' : urgencyColor.value === 'warning' ? 'text-warning' : 'text-accent',
)

const statusLabel = computed(() => {
  if (timerExpired.value) {
    return "Time's up!"
  }
  if (sessionsStore.isRunning) {
    return 'Focusing…'
  }
  return 'Paused'
})

const statusClass = computed(() => {
  if (timerExpired.value) {
    return 'text-danger'
  }
  if (sessionsStore.isRunning) {
    return 'text-accent'
  }
  return 'text-muted'
})

const timerMs = computed(() => {
  const minutes = Number(timerMinutes.value)
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 240) {
    return null
  }
  return Math.round(minutes * 60_000)
})

const startLabel = computed(() => {
  if (mode.value === 'timer') {
    return timerMs.value !== null ? `Start ${formatCountdown(timerMs.value)} timer` : 'Start timer'
  }
  return 'Start session'
})

const filteredSessions = computed(() => {
  if (courseFilter.value === 'all') {
    return sessionsStore.sessions
  }
  return sessionsStore.sessions.filter((session) => session.courseId === courseFilter.value)
})

const periodCards = computed(() => [
  { label: 'Today', minutes: sessionsStore.totals.day },
  { label: 'This week', minutes: sessionsStore.totals.week },
  { label: 'This month', minutes: sessionsStore.totals.month },
])

onMounted(async () => {
  await Promise.all([sessionsStore.fetchSessions(), coursesStore.fetchCourses()])
  now.value = Date.now()
  intervalId = setInterval(() => {
    now.value = Date.now()
    handleExpiry()
  }, 1000)
  handleExpiry()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

function onVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    now.value = Date.now()
    handleExpiry()
  }
}

function handleExpiry(): void {
  if (expiryHandled.value || !sessionsStore.active || sessionsStore.active.paused) {
    return
  }
  if (!timerExpired.value) {
    return
  }
  expiryHandled.value = true
  playChime()
  finishOpen.value = true
}

function selectPreset(minutes: number): void {
  timerMinutes.value = minutes
  customMinutes.value = ''
}

function onCustomMinutes(value: string): void {
  customMinutes.value = value
  const parsed = Number(value)
  if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 240) {
    timerMinutes.value = parsed
  }
}

function start(): void {
  if (mode.value === 'timer') {
    if (timerMs.value === null) {
      return
    }
    sessionsStore.startSession(
      courseFilter.value === 'all' ? null : courseFilter.value,
      'timer',
      timerMs.value,
    )
  } else {
    sessionsStore.startSession(courseFilter.value === 'all' ? null : courseFilter.value, 'stopwatch')
  }
  expiryHandled.value = false
  initAudio()
}

function restartTimer(): void {
  const active = sessionsStore.active
  if (!active) {
    return
  }
  const courseId = active.courseId
  const totalMs = active.totalMs
  sessionsStore.discardSession()
  if (totalMs !== null) {
    sessionsStore.startSession(courseId, 'timer', totalMs)
  }
  expiryHandled.value = false
  initAudio()
}

function togglePause(): void {
  if (sessionsStore.isRunning) {
    sessionsStore.pauseSession()
  } else {
    sessionsStore.resumeSession()
  }
}

function clearFilters(): void {
  courseFilter.value = 'all'
}

async function finish(rating: number, description: string): Promise<void> {
  finishing.value = true
  const ok = await sessionsStore.finishSession({
    focusRating: rating as 1 | 2 | 3 | 4 | 5,
    description,
  })
  finishing.value = false
  if (ok) {
    finishOpen.value = false
    expiryHandled.value = false
    toast.push('success', 'Session saved')
  }
}

async function confirmDelete(): Promise<void> {
  const session = deletingSession.value
  if (!session) {
    return
  }
  deleting.value = true
  const ok = await sessionsStore.removeSession(session.id)
  deleting.value = false
  if (ok) {
    deletingSession.value = null
    toast.push('success', 'Session deleted')
  }
}

function confirmDiscard(): void {
  sessionsStore.discardSession()
  discardOpen.value = false
  expiryHandled.value = false
  toast.push('info', 'Session discarded')
}
</script>

<template>
  <div>
    <PageHeader title="Study Sessions" description="Track focused study time with the stopwatch or a countdown timer." />

    <ErrorBanner
      v-if="sessionsStore.error"
      :message="sessionsStore.error"
      @dismiss="sessionsStore.error = ''"
    />

    <BaseCard padding="lg" class="text-center">
      <div
        v-if="!sessionsStore.active"
        class="mb-6 inline-flex items-center gap-1 rounded-xl border border-border bg-background p-1"
        role="group"
        aria-label="Session mode"
      >
        <button
          v-for="option in modeOptions"
          :key="option.value"
          type="button"
          :aria-pressed="mode === option.value"
          class="focus-ring inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          :class="
            mode === option.value
              ? 'bg-accent text-on-accent shadow-card'
              : 'text-secondary hover:text-primary'
          "
          @click="mode = option.value"
        >
          <component :is="option.icon" :size="16" />
          {{ option.label }}
        </button>
      </div>

      <div v-if="sessionsStore.active" class="flex flex-col items-center">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <span
            v-if="activeCourseTitle !== 'General'"
            class="inline-flex items-center gap-1.5 text-sm text-secondary"
          >
            <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: activeCourseColor }" />
            {{ activeCourseTitle }}
          </span>
          <span class="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 text-xs font-medium text-secondary">
            <component :is="activeMode === 'timer' ? Hourglass : Timer" :size="13" />
            {{ activeMode === 'timer' ? 'Countdown timer' : 'Stopwatch' }}
          </span>
        </div>

        <div v-if="activeMode === 'timer'" class="relative mt-4">
          <svg
            class="-rotate-90"
            width="252"
            height="252"
            viewBox="0 0 252 252"
            role="timer"
            :aria-label="`${countdownLabel} remaining`"
          >
            <circle cx="126" cy="126" :r="RING_RADIUS" fill="none" stroke-width="9" class="stroke-border" />
            <circle
              cx="126"
              cy="126"
              :r="RING_RADIUS"
              fill="none"
              stroke-width="9"
              stroke-linecap="round"
              :class="ringStrokeClass"
              :stroke-dasharray="RING_CIRCUMFERENCE"
              :stroke-dashoffset="RING_CIRCUMFERENCE * (1 - timerProgress)"
              style="transition: stroke-dashoffset 0.9s linear, stroke 0.3s ease"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="font-mono text-5xl font-semibold tabular-nums tracking-tight" :class="digitClass">
              {{ countdownLabel }}
            </span>
            <span class="mt-1 flex items-center gap-1.5 text-xs font-medium" :class="statusClass">
              <BellRing v-if="timerExpired" :size="13" />
              {{ statusLabel }}
            </span>
          </div>
        </div>

        <div v-else class="mt-4">
          <span class="font-mono text-6xl font-semibold tabular-nums tracking-tight text-primary">
            {{ stopwatchLabel }}
          </span>
          <p class="mt-2 text-xs font-medium" :class="statusClass">{{ statusLabel }}</p>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-center gap-2">
          <template v-if="timerExpired">
            <BaseButton variant="secondary" @click="restartTimer">
              <RotateCcw :size="16" />
              Restart
            </BaseButton>
            <BaseButton @click="finishOpen = true">
              <Flag :size="16" />
              Finish &amp; rate
            </BaseButton>
          </template>
          <template v-else>
            <BaseButton variant="secondary" @click="togglePause">
              <Pause v-if="sessionsStore.isRunning" :size="16" />
              <Play v-else :size="16" />
              {{ sessionsStore.isRunning ? 'Pause' : 'Resume' }}
            </BaseButton>
            <BaseButton @click="finishOpen = true">
              <Flag :size="16" />
              {{ activeMode === 'timer' ? 'Finish early' : 'Finish' }}
            </BaseButton>
            <BaseButton variant="ghost-danger" @click="discardOpen = true">
              Discard
            </BaseButton>
          </template>
        </div>
      </div>

      <div v-else class="flex flex-col items-center">
        <template v-if="mode === 'timer'">
          <div class="flex flex-wrap items-center justify-center gap-2">
            <button
              v-for="preset in timerPresets"
              :key="preset"
              type="button"
              class="focus-ring rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
              :class="
                timerMinutes === preset
                  ? 'border-accent bg-accent text-on-accent'
                  : 'border-border text-secondary hover:border-accent hover:text-accent'
              "
              @click="selectPreset(preset)"
            >
              {{ preset }} min
            </button>
          </div>
          <BaseInput
            type="number"
            label="Custom minutes"
            :model-value="customMinutes"
            placeholder="e.g. 45"
            class="mt-4 w-36"
            @update:model-value="onCustomMinutes"
          />
          <div class="relative mt-5">
            <svg
              :key="timerMs ?? 'none'"
              class="timer-setup-ring -rotate-90"
              width="252"
              height="252"
              viewBox="0 0 252 252"
              aria-hidden="true"
            >
              <circle cx="126" cy="126" :r="RING_RADIUS" fill="none" stroke-width="9" class="stroke-border" />
              <circle
                cx="126"
                cy="126"
                :r="RING_RADIUS"
                fill="none"
                stroke-width="9"
                stroke-linecap="round"
                class="stroke-accent"
                :style="{ '--ring-c': `${RING_CIRCUMFERENCE}px` }"
                :stroke-dasharray="RING_CIRCUMFERENCE"
                :stroke-dashoffset="RING_CIRCUMFERENCE"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="font-mono text-5xl font-semibold tabular-nums tracking-tight text-primary">
                {{ timerMs !== null ? formatCountdown(timerMs) : '--:--' }}
              </span>
              <p class="mt-2 max-w-56 text-xs text-muted">
                The green ring counts down to zero when you start.
              </p>
            </div>
          </div>
        </template>

        <template v-else>
          <Timer :size="36" class="text-muted" />
          <p class="mt-4 font-mono text-6xl font-semibold tabular-nums tracking-tight text-primary">
            00:00:00
          </p>
          <h3 class="mt-3 text-lg font-semibold text-primary">Ready to focus?</h3>
          <p class="mt-1 max-w-sm text-sm text-secondary">
            Counts up while you study. You can pause and resume anytime — the timer keeps running
            even if you leave this page.
          </p>
        </template>

        <div class="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:justify-center">
          <BaseSelect v-model="courseFilter" label="Course" class="w-56" :options="courseOptions" />
          <BaseButton size="md" :disabled="mode === 'timer' && timerMs === null" @click="start">
            <Play :size="18" />
            {{ startLabel }}
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <BaseCard v-for="card in periodCards" :key="card.label">
        <p class="text-sm text-secondary">{{ card.label }}</p>
        <p class="mt-1 text-2xl font-semibold text-primary">{{ formatMinutes(card.minutes) }}</p>
      </BaseCard>
    </div>

    <BaseCard class="mt-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-primary">Recent sessions</h3>
        <BaseSelect v-model="courseFilter" class="w-44" :options="courseOptions" />
      </div>

      <div v-if="sessionsStore.loading" class="mt-3 space-y-2">
        <div v-for="i in 4" :key="i" class="h-12 animate-pulse rounded-lg bg-background" />
      </div>

      <div v-else-if="sessionsStore.sessions.length === 0" class="mt-2">
        <EmptyState
          :icon="Timer"
          title="No sessions yet"
          description="Finish your first timer session and it will show up here."
        />
      </div>

      <div v-else-if="filteredSessions.length === 0" class="mt-2">
        <EmptyState
          :icon="Timer"
          title="No matching sessions"
          description="Try a different course filter."
        >
          <BaseButton size="sm" variant="secondary" @click="clearFilters">Clear filter</BaseButton>
        </EmptyState>
      </div>

      <ul v-else class="mt-3 space-y-2">
        <li
          v-for="session in filteredSessions"
          :key="session.id"
          class="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
        >
          <span
            class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: courseColor(session.courseId) || 'var(--color-muted)' }"
          />

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-medium text-primary">{{ courseTitle(session.courseId) }}</span>
              <span class="text-xs text-muted">{{ formatSessionTime(session.startedAt) }}</span>
              <span class="text-xs font-semibold text-accent">{{ formatMinutes(session.durationMinutes ?? 0) }}</span>
              <span
                v-if="session.focusRating"
                class="text-xs text-secondary"
                :aria-label="`Focus rating ${session.focusRating} out of 5`"
              >
                {{ '★'.repeat(session.focusRating) }}<span class="text-muted">{{ '★'.repeat(5 - session.focusRating) }}</span>
              </span>
            </div>
            <p v-if="session.description" class="mt-1 text-sm text-secondary">
              {{ session.description }}
            </p>
          </div>

          <button
            class="focus-ring shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
            :aria-label="`Delete session from ${formatSessionTime(session.startedAt)}`"
            @click="deletingSession = session"
          >
            <Trash2 :size="15" />
          </button>
        </li>
      </ul>
    </BaseCard>

    <FinishSessionModal
      :open="finishOpen"
      :busy="finishing"
      @close="finishOpen = false"
      @confirm="finish"
    />

    <BaseConfirmDialog
      v-if="discardOpen"
      title="Discard session?"
      message="This session will be discarded and not saved. Start over whenever you're ready."
      @close="discardOpen = false"
      @confirm="confirmDiscard"
    />

    <BaseConfirmDialog
      v-if="deletingSession"
      title="Delete session?"
      :message="`Delete the session from ${formatSessionTime(deletingSession.startedAt)}? This cannot be undone.`"
      :busy="deleting"
      @close="deletingSession = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
