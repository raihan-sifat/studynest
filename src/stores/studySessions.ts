import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { FocusRating, StudySession } from '@/types'
import { totalMinutesForPeriod } from '@/utils/time'
import {
  createStudySession as createStudySessionRequest,
  deleteStudySession as deleteStudySessionRequest,
  listStudySessions as listStudySessionsRequest,
  type StudySessionInput,
} from '@/services/studySessions'

export type SessionMode = 'stopwatch' | 'timer'

interface ActiveSessionState {
  mode: SessionMode
  courseId: string | null
  originalStartedAt: number
  startedAt: number
  accumulatedMs: number
  paused: boolean
  totalMs: number | null
}

const STORAGE_KEY = 'studynest:active-session'

function loadActive(): ActiveSessionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<ActiveSessionState>
    if (typeof parsed.startedAt !== 'number' || typeof parsed.accumulatedMs !== 'number') {
      return null
    }
    const mode: SessionMode = parsed.mode === 'timer' ? 'timer' : 'stopwatch'
    return {
      mode,
      courseId: parsed.courseId ?? null,
      originalStartedAt: parsed.originalStartedAt ?? parsed.startedAt,
      startedAt: parsed.startedAt,
      accumulatedMs: parsed.accumulatedMs,
      paused: Boolean(parsed.paused),
      totalMs: mode === 'timer' ? Math.max(0, parsed.totalMs ?? 0) : null,
    }
  } catch {
    return null
  }
}

export const useStudySessionsStore = defineStore('studySessions', () => {
  const sessions = ref<StudySession[]>([])
  const loading = ref(false)
  const error = ref('')
  const active = ref<ActiveSessionState | null>(loadActive())

  const isRunning = computed(() => active.value !== null && !active.value.paused)

  function persist(state: ActiveSessionState | null): void {
    if (state === null) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }

  function elapsedMs(now: number): number {
    const state = active.value
    if (!state) {
      return 0
    }
    const counted = state.paused
      ? state.accumulatedMs
      : state.accumulatedMs + Math.max(0, now - state.startedAt)
    if (state.mode === 'timer' && state.totalMs !== null) {
      return Math.max(0, state.totalMs - counted)
    }
    return counted
  }

  function isExpired(now: number): boolean {
    const state = active.value
    return state !== null && state.mode === 'timer' && elapsedMs(now) <= 0
  }

  async function fetchSessions(force = false): Promise<void> {
    if (!loading.value && !force && sessions.value.length > 0) {
      return
    }
    loading.value = true
    error.value = ''
    try {
      sessions.value = await listStudySessionsRequest()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to load sessions'
    } finally {
      loading.value = false
    }
  }

  function startSession(
    courseId: string | null,
    mode: SessionMode = 'stopwatch',
    totalMs: number | null = null,
  ): void {
    const now = Date.now()
    active.value = {
      mode,
      courseId,
      originalStartedAt: now,
      startedAt: now,
      accumulatedMs: 0,
      paused: false,
      totalMs: mode === 'timer' ? Math.max(1, totalMs ?? 0) : null,
    }
    persist(active.value)
  }

  function pauseSession(): void {
    const state = active.value
    if (!state || state.paused) {
      return
    }
    const now = Date.now()
    state.accumulatedMs += now - state.startedAt
    state.paused = true
    persist(state)
  }

  function resumeSession(): void {
    const state = active.value
    if (!state || !state.paused) {
      return
    }
    state.startedAt = Date.now()
    state.paused = false
    persist(state)
  }

  function discardSession(): void {
    active.value = null
    persist(null)
  }

  async function finishSession(input: {
    focusRating: FocusRating
    description?: string | null
  }): Promise<boolean> {
    const state = active.value
    if (!state) {
      return false
    }
    const totalMs = elapsedMs(Date.now())
    const savedDurationMs =
      state.mode === 'timer' && state.totalMs !== null
        ? totalMs > 0
          ? totalMs
          : state.totalMs
        : totalMs
    const sessionInput: StudySessionInput = {
      courseId: state.courseId,
      startedAt: new Date(state.originalStartedAt).toISOString(),
      endedAt: new Date().toISOString(),
      durationMinutes: Math.max(1, Math.round(savedDurationMs / 60000)),
      focusRating: input.focusRating,
      description: input.description ?? null,
    }
    try {
      const session = await createStudySessionRequest(sessionInput)
      sessions.value = [session, ...sessions.value]
      discardSession()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to save session'
      return false
    }
  }

  async function removeSession(id: string): Promise<boolean> {
    try {
      await deleteStudySessionRequest(id)
      sessions.value = sessions.value.filter((session) => session.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to delete session'
      return false
    }
  }

  const totals = computed(() => ({
    day: totalMinutesForPeriod(sessions.value, 'day'),
    week: totalMinutesForPeriod(sessions.value, 'week'),
    month: totalMinutesForPeriod(sessions.value, 'month'),
  }))

  function sessionsForCourse(courseId: string): StudySession[] {
    return sessions.value.filter((session) => session.courseId === courseId)
  }

  return {
    sessions,
    loading,
    error,
    active,
    isRunning,
    elapsedMs,
    isExpired,
    fetchSessions,
    startSession,
    pauseSession,
    resumeSession,
    discardSession,
    finishSession,
    removeSession,
    totals,
    sessionsForCourse,
  }
})
