import { describe, expect, it } from 'vitest'
import { format, startOfToday } from 'date-fns'
import type { StudySession } from '@/types'
import {
  averageSessionMinutes,
  formatCountdown,
  formatElapsed,
  formatMinutes,
  formatSessionTime,
  minutesPerDay,
  minutesPerMonth,
  percentChange,
  sessionDurationMinutes,
  totalMinutes,
  totalMinutesBetween,
  totalMinutesForPeriod,
  weekdayLabels,
} from '@/utils/time'

function makeSession(overrides: Partial<StudySession> = {}): StudySession {
  return {
    id: 's1',
    userId: 'u1',
    courseId: null,
    startedAt: '2026-08-01T10:00:00Z',
    endedAt: null,
    durationMinutes: null,
    focusRating: null,
    description: null,
    createdAt: '2026-08-01T10:00:00Z',
    ...overrides,
  }
}

describe('formatElapsed', () => {
  it('renders zero and negatives as 00:00:00', () => {
    expect(formatElapsed(0)).toBe('00:00:00')
    expect(formatElapsed(-500)).toBe('00:00:00')
  })

  it('pads hours, minutes and seconds', () => {
    expect(formatElapsed(3661000)).toBe('01:01:01')
    expect(formatElapsed(59000)).toBe('00:00:59')
    expect(formatElapsed(3600000)).toBe('01:00:00')
  })

  it('floors partial seconds', () => {
    expect(formatElapsed(1500)).toBe('00:00:01')
  })
})

describe('formatCountdown', () => {
  it('renders zero and negatives as 00:00', () => {
    expect(formatCountdown(0)).toBe('00:00')
    expect(formatCountdown(-10)).toBe('00:00')
  })

  it('ceils partial seconds', () => {
    expect(formatCountdown(1000)).toBe('00:01')
    expect(formatCountdown(1001)).toBe('00:02')
  })

  it('shows M:SS without an hour segment', () => {
    expect(formatCountdown(61000)).toBe('01:01')
    expect(formatCountdown(60000 * 2 + 5000)).toBe('02:05')
  })

  it('includes hours once >= 1h and rolls over at 60 min', () => {
    expect(formatCountdown(3600000)).toBe('01:00:00')
    expect(formatCountdown(3599999)).toBe('01:00:00')
    expect(formatCountdown(60 * 60 * 1000 + 61 * 1000)).toBe('01:01:01')
  })
})

describe('formatMinutes', () => {
  it('renders pure minutes', () => {
    expect(formatMinutes(0)).toBe('0m')
    expect(formatMinutes(45)).toBe('45m')
  })

  it('renders pure hours', () => {
    expect(formatMinutes(60)).toBe('1h')
    expect(formatMinutes(180)).toBe('3h')
  })

  it('renders combined hours and minutes', () => {
    expect(formatMinutes(90)).toBe('1h 30m')
    expect(formatMinutes(125)).toBe('2h 5m')
  })

  it('clamps negatives to zero and rounds', () => {
    expect(formatMinutes(-5)).toBe('0m')
    expect(formatMinutes(59.6)).toBe('1h')
  })
})

describe('sessionDurationMinutes', () => {
  it('prefers the stored duration', () => {
    const session = makeSession({ durationMinutes: 25 })
    expect(sessionDurationMinutes(session)).toBe(25)
  })

  it('falls back to the started/ended diff', () => {
    const session = makeSession({
      durationMinutes: null,
      startedAt: '2026-08-01T10:00:00Z',
      endedAt: '2026-08-01T11:30:00Z',
    })
    expect(sessionDurationMinutes(session)).toBe(90)
  })

  it('clamps tiny diffs to at least 1 minute', () => {
    const session = makeSession({
      durationMinutes: null,
      startedAt: '2026-08-01T10:00:00Z',
      endedAt: '2026-08-01T10:00:20Z',
    })
    expect(sessionDurationMinutes(session)).toBe(1)
  })

  it('returns 0 when no timing data exists', () => {
    expect(sessionDurationMinutes(makeSession())).toBe(0)
  })
})

describe('totalMinutes', () => {
  it('sums durations across sessions', () => {
    const sessions = [
      makeSession({ durationMinutes: 25 }),
      makeSession({ durationMinutes: null, startedAt: '2026-08-01T10:00:00Z', endedAt: '2026-08-01T11:00:00Z' }),
      makeSession({ durationMinutes: 5 }),
    ]
    expect(totalMinutes(sessions)).toBe(90)
  })

  it('returns 0 for an empty list', () => {
    expect(totalMinutes([])).toBe(0)
  })
})

describe('averageSessionMinutes', () => {
  it('returns the rounded average', () => {
    const sessions = [makeSession({ durationMinutes: 25 }), makeSession({ durationMinutes: 50 })]
    expect(averageSessionMinutes(sessions)).toBe(38)
  })

  it('returns 0 for an empty list', () => {
    expect(averageSessionMinutes([])).toBe(0)
  })
})

describe('totalMinutesForPeriod', () => {
  it('counts only sessions started in the current day', () => {
    const today = makeSession({ startedAt: startOfToday().toISOString(), durationMinutes: 30 })
    const yesterday = new Date(startOfToday().getTime() - 24 * 60 * 60 * 1000)
    const past = makeSession({ startedAt: yesterday.toISOString(), durationMinutes: 45 })
    expect(totalMinutesForPeriod([today, past], 'day')).toBe(30)
  })

  it('still counts older sessions within the week and month', () => {
    const yesterday = new Date(startOfToday().getTime() - 24 * 60 * 60 * 1000)
    const past = makeSession({ startedAt: yesterday.toISOString(), durationMinutes: 45 })
    expect(totalMinutesForPeriod([past], 'week')).toBe(45)
    expect(totalMinutesForPeriod([past], 'month')).toBe(45)
  })
})

describe('formatSessionTime', () => {
  it('formats an ISO date as MMM d, HH:mm', () => {
    const input = '2026-08-05T14:30:00'
    expect(formatSessionTime(input)).toBe(format(new Date(input), 'MMM d, HH:mm'))
  })
})

describe('totalMinutesBetween', () => {
  const from = new Date(2026, 6, 1) // Jul 1
  const to = new Date(2026, 7, 1) // Aug 1

  it('includes only sessions within [from, to)', () => {
    const inside = makeSession({
      startedAt: '2026-07-15T09:00:00',
      durationMinutes: 30,
    })
    const before = makeSession({
      startedAt: '2026-06-30T23:00:00',
      durationMinutes: 10,
    })
    const onEndBoundary = makeSession({
      startedAt: '2026-08-01T00:00:00',
      durationMinutes: 20,
    })
    expect(totalMinutesBetween([inside, before, onEndBoundary], from, to)).toBe(30)
  })
})

describe('minutesPerMonth', () => {
  const now = new Date(2026, 7, 15) // Aug 15, 2026

  it('builds the last N month buckets with labels from oldest to newest', () => {
    const result = minutesPerMonth([], 3, now)
    expect(result.map((b) => b.label)).toEqual(['Jun', 'Jul', 'Aug'])
    expect(result.every((b) => b.minutes === 0)).toBe(true)
  })

  it('buckets sessions into the right month ranges', () => {
    const sessions = [
      makeSession({ startedAt: '2026-06-10T09:00:00', durationMinutes: 60 }),
      makeSession({ startedAt: '2026-07-05T09:00:00', durationMinutes: 90 }),
      makeSession({ startedAt: '2026-09-01T09:00:00', durationMinutes: 30 }),
    ]
    const result = minutesPerMonth(sessions, 3, now)
    expect(result.map((b) => b.minutes)).toEqual([60, 90, 0])
  })
})

describe('percentChange', () => {
  it('returns null when there is no previous baseline but current > 0', () => {
    expect(percentChange(50, 0)).toBeNull()
  })

  it('returns 0 when both are 0', () => {
    expect(percentChange(0, 0)).toBe(0)
  })

  it('computes rounded percentages', () => {
    expect(percentChange(120, 100)).toBe(20)
    expect(percentChange(50, 100)).toBe(-50)
    expect(percentChange(33, 100)).toBe(-67)
  })
})

describe('minutesPerDay', () => {
  const weekStart = new Date(2026, 7, 3) // Mon Aug 3, 2026

  it('distributes sessions across Mon-Sun buckets', () => {
    const sessions = [
      makeSession({ startedAt: '2026-08-03T09:00:00', durationMinutes: 10 }), // Mon
      makeSession({ startedAt: '2026-08-05T09:00:00', durationMinutes: 20 }), // Wed
      makeSession({ startedAt: '2026-08-09T09:00:00', durationMinutes: 30 }), // Sun
    ]
    expect(minutesPerDay(sessions, weekStart)).toEqual([10, 0, 20, 0, 0, 0, 30])
  })

  it('ignores sessions outside the week', () => {
    const sessions = [
      makeSession({ startedAt: '2026-08-02T09:00:00', durationMinutes: 99 }), // Sun before
      makeSession({ startedAt: '2026-08-10T09:00:00', durationMinutes: 99 }), // Mon after
    ]
    expect(minutesPerDay(sessions, weekStart)).toEqual([0, 0, 0, 0, 0, 0, 0])
  })
})

describe('weekdayLabels', () => {
  it('returns 7 labels starting from the week start', () => {
    const weekStart = new Date(2026, 7, 3)
    const labels = weekdayLabels(weekStart)
    expect(labels).toHaveLength(7)
    expect(labels[0]).toBe(format(weekStart, 'EEE'))
    expect(labels[6]).toBe(format(new Date(2026, 7, 9), 'EEE'))
  })
})


