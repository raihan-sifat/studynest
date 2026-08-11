<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Flag, Pause, Play, Timer, Trash2 } from '@lucide/vue'
import type { StudySession } from '@/types'
import { useStudySessionsStore } from '@/stores/studySessions'
import { useCoursesStore } from '@/stores/courses'
import { formatElapsed, formatMinutes, formatSessionTime } from '@/utils/time'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import FinishSessionModal from '@/components/studySessions/FinishSessionModal.vue'

const sessionsStore = useStudySessionsStore()
const coursesStore = useCoursesStore()

const courseFilter = ref('all')
const now = ref(Date.now())
const finishOpen = ref(false)
const finishing = ref(false)
const deletingSession = ref<StudySession | null>(null)
const deleting = ref(false)
const discardOpen = ref(false)

let intervalId: ReturnType<typeof setInterval> | undefined

const courseOptions = computed(() => [
  { value: 'all', label: 'All sessions' },
  ...coursesStore.courses.map((course) => ({ value: course.id, label: course.title })),
])

const courseTitle = (courseId: string | null) =>
  courseId ? coursesStore.byId.get(courseId)?.title ?? 'General' : 'General'

const courseColor = (courseId: string | null) => coursesStore.byId.get(courseId ?? '')?.color ?? ''

const elapsed = computed(() => formatElapsed(sessionsStore.elapsedMs(now.value)))

const activeCourseTitle = computed(() => courseTitle(sessionsStore.active?.courseId ?? null))

const activeCourseColor = computed(() =>
  courseColor(sessionsStore.active?.courseId ?? null),
)

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
  intervalId = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

function start(): void {
  sessionsStore.startSession(courseFilter.value === 'all' ? null : courseFilter.value)
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
  const ok = await sessionsStore.finishSession({ focusRating: rating as 1 | 2 | 3 | 4 | 5, description })
  finishing.value = false
  if (ok) {
    finishOpen.value = false
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
  }
}
</script>

<template>
  <div>
    <PageHeader title="Study Sessions" description="Track focused study time with the timer." />

    <p v-if="sessionsStore.error" class="mb-4 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
      {{ sessionsStore.error }}
    </p>

    <BaseCard padding="lg" class="text-center">
      <div v-if="sessionsStore.active" class="flex flex-col items-center">
        <span
          v-if="activeCourseTitle !== 'General'"
          class="inline-flex items-center gap-1.5 text-sm text-secondary"
        >
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: activeCourseColor }" />
          {{ activeCourseTitle }}
        </span>
        <span
          class="mt-3 font-mono text-5xl font-semibold tabular-nums tracking-tight text-primary"
          :class="sessionsStore.isRunning ? 'text-accent' : ''"
          aria-live="polite"
        >
          {{ elapsed }}
        </span>
        <span class="mt-1 text-xs font-medium" :class="sessionsStore.isRunning ? 'text-accent' : 'text-muted'">
          {{ sessionsStore.isRunning ? 'Focusing…' : 'Paused' }}
        </span>

        <div class="mt-5 flex flex-wrap items-center justify-center gap-2">
          <BaseButton variant="secondary" @click="togglePause">
            <Pause v-if="sessionsStore.isRunning" :size="16" />
            <Play v-else :size="16" />
            {{ sessionsStore.isRunning ? 'Pause' : 'Resume' }}
          </BaseButton>
          <BaseButton @click="finishOpen = true">
            <Flag :size="16" />
            Finish
          </BaseButton>
          <BaseButton variant="ghost" class="text-danger hover:!bg-danger/10" @click="discardOpen = true">
            Discard
          </BaseButton>
        </div>
      </div>

      <div v-else class="flex flex-col items-center">
        <Timer :size="36" class="text-muted" />
        <h3 class="mt-3 text-lg font-semibold text-primary">Ready to focus?</h3>
        <p class="mt-1 max-w-sm text-sm text-secondary">
          Start a timer for a study session. You can pause and resume anytime — the timer keeps
          running even if you leave this page.
        </p>
        <div class="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
          <BaseSelect
            v-model="courseFilter"
            label="Course"
            class="w-56"
            :options="courseOptions"
          />
          <BaseButton size="lg" @click="start">
            <Play :size="18" />
            Start session
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
          <span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: courseColor(session.courseId) || '#8B8B96' }" />

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
            class="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
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
      @confirm="sessionsStore.discardSession(); discardOpen = false"
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
