import { describe, expect, it } from 'vitest'
import { startOfWeek } from 'date-fns'
import type { Goal, StudySession, Task } from '@/types'
import {
  WEEKDAY_LABELS,
  dayKey,
  formatMonthTitle,
  groupEventsByDay,
  isCurrentDay,
  isCurrentMonth,
  monthGrid,
  parseDayKey,
  totalEventCount,
} from '@/utils/calendar'

describe('WEEKDAY_LABELS', () => {
  it('starts on Monday', () => {
    expect(WEEKDAY_LABELS).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
  })
})

describe('monthGrid', () => {
  it('returns 42 cells starting from the Monday before the month', () => {
    const monthStart = new Date(2026, 7, 1) // Aug 2026
    const grid = monthGrid(monthStart)
    expect(grid).toHaveLength(42)
    const expectedStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    expect(dayKey(grid[0])).toBe(dayKey(expectedStart))
    /* Mon Jul 27 2026 */
    expect(dayKey(grid[0])).toBe('2026-07-27')
    /* Sun Sep 6 2026 (41 days later) */
    expect(dayKey(grid[41])).toBe('2026-09-06')
  })

  it('honours an alternate week start day', () => {
    const grid = monthGrid(new Date(2026, 7, 1), 0)
    expect(grid).toHaveLength(42)
    expect(dayKey(grid[0])).toBe(dayKey(startOfWeek(new Date(2026, 7, 1), { weekStartsOn: 0 })))
  })
})

describe('dayKey / parseDayKey', () => {
  it('round-trips a date through its key', () => {
    for (const [year, month, day] of [
      [2026, 7, 5],
      [2026, 0, 1],
      [2024, 11, 31],
    ] as const) {
      const date = new Date(year, month, day)
      expect(parseDayKey(dayKey(date)).getTime()).toBe(date.getTime())
      expect(dayKey(parseDayKey(dayKey(date)))).toBe(dayKey(date))
    }
  })

  it('parses zero-padded keys', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('isCurrentMonth', () => {
  it('distinguishes days in the current month', () => {
    const monthStart = new Date(2026, 7, 1)
    expect(isCurrentMonth(new Date(2026, 7, 15), monthStart)).toBe(true)
    expect(isCurrentMonth(new Date(2026, 8, 1), monthStart)).toBe(false)
    expect(isCurrentMonth(new Date(2026, 6, 31), monthStart)).toBe(false)
  })
})

describe('isCurrentDay', () => {
  it('matches only the provided today', () => {
    const today = new Date(2026, 7, 10)
    expect(isCurrentDay(new Date(2026, 7, 10), today)).toBe(true)
    expect(isCurrentDay(new Date(2026, 7, 11), today)).toBe(false)
  })
})

describe('formatMonthTitle', () => {
  it('formats as "MMMM yyyy"', () => {
    expect(formatMonthTitle(new Date(2026, 7, 1))).toBe('August 2026')
  })
})

describe('groupEventsByDay', () => {
  const makeTask = (overrides: Partial<Task>): Task =>
    ({
      id: overrides.id ?? 't',
      userId: 'u1',
      courseId: null,
      title: 'Task',
      description: null,
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      estimatedMinutes: null,
      createdAt: '2026-08-01T00:00:00',
      updatedAt: '2026-08-01T00:00:00',
      ...overrides,
    }) as Task

  const makeSession = (overrides: Partial<StudySession>): StudySession =>
    ({
      id: overrides.id ?? 's',
      userId: 'u1',
      courseId: null,
      startedAt: '2026-08-01T10:00:00',
      endedAt: null,
      durationMinutes: null,
      focusRating: null,
      description: null,
      createdAt: '2026-08-01T00:00:00',
      ...overrides,
    }) as StudySession

  const makeGoal = (overrides: Partial<Goal>): Goal =>
    ({
      id: overrides.id ?? 'g',
      userId: 'u1',
      courseId: null,
      title: 'Goal',
      description: null,
      targetValue: 100,
      currentValue: 0,
      deadline: null,
      status: 'active',
      createdAt: '2026-08-01T00:00:00',
      updatedAt: '2026-08-01T00:00:00',
      ...overrides,
    }) as Goal

  it('groups tasks, sessions and goals under their day keys and skips null dates', () => {
    const tasks = [
      makeTask({ id: 't1', dueDate: '2026-08-05' }),
      makeTask({ id: 't2', dueDate: null }),
    ]
    const sessions = [makeSession({ id: 's1', startedAt: '2026-08-05T10:00:00' })]
    const goals = [
      makeGoal({ id: 'g1', deadline: '2026-08-05' }),
      makeGoal({ id: 'g2', deadline: null }),
    ]
    const map = groupEventsByDay(tasks, sessions, goals)
    expect(map.size).toBe(1)
    const events = map.get('2026-08-05')!
    expect(events.tasks.map((t) => t.id)).toEqual(['t1'])
    expect(events.sessions.map((s) => s.id)).toEqual(['s1'])
    expect(events.goals.map((g) => g.id)).toEqual(['g1'])
  })

  it('sorts each collection by createdAt/startedAt ascending', () => {
    const tasks = [
      makeTask({ id: 'tb', dueDate: '2026-08-05', createdAt: '2026-08-05T12:00:00' }),
      makeTask({ id: 'ta', dueDate: '2026-08-05', createdAt: '2026-08-05T09:00:00' }),
    ]
    const sessions = [
      makeSession({ id: 'sb', startedAt: '2026-08-05T11:00:00' }),
      makeSession({ id: 'sa', startedAt: '2026-08-05T09:00:00' }),
    ]
    const goals = [
      makeGoal({ id: 'gb', deadline: '2026-08-05', createdAt: '2026-08-05T12:00:00' }),
      makeGoal({ id: 'ga', deadline: '2026-08-05', createdAt: '2026-08-05T09:00:00' }),
    ]
    const events = groupEventsByDay(tasks, sessions, goals).get('2026-08-05')!
    expect(events.tasks.map((t) => t.id)).toEqual(['ta', 'tb'])
    expect(events.sessions.map((s) => s.id)).toEqual(['sa', 'sb'])
    expect(events.goals.map((g) => g.id)).toEqual(['ga', 'gb'])
  })
})

describe('totalEventCount', () => {
  it('returns 0 for falsy input', () => {
    expect(totalEventCount(null)).toBe(0)
    expect(totalEventCount(undefined)).toBe(0)
  })

  it('sums the three collections', () => {
    expect(
      totalEventCount({
        tasks: Array.from({ length: 2 }) as Task[],
        sessions: Array.from({ length: 3 }) as StudySession[],
        goals: Array.from({ length: 1 }) as Goal[],
      }),
    ).toBe(6)
  })
})
