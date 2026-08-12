import { addDays, format, startOfDay, startOfISOWeek, startOfMonth, startOfToday, subMonths } from 'date-fns'
import type { StudySession } from '@/types'

export type PeriodKey = 'day' | 'week' | 'month'

export function formatElapsed(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}

export function formatMinutes(minutes: number): string {
  const total = Math.max(0, Math.round(minutes))
  const hours = Math.floor(total / 60)
  const mins = total % 60
  if (hours === 0) {
    return `${mins}m`
  }
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h ${mins}m`
}

export function sessionDurationMinutes(session: StudySession): number {
  if (session.durationMinutes !== null) {
    return session.durationMinutes
  }
  if (session.startedAt && session.endedAt) {
    const diff =
      (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000
    return Math.max(1, Math.round(diff))
  }
  return 0
}

export function totalMinutes(sessions: StudySession[]): number {
  return sessions.reduce((sum, session) => sum + sessionDurationMinutes(session), 0)
}

export function averageSessionMinutes(sessions: StudySession[]): number {
  if (sessions.length === 0) {
    return 0
  }
  return Math.round(totalMinutes(sessions) / sessions.length)
}

export function periodStart(key: PeriodKey): Date {
  switch (key) {
    case 'day':
      return startOfToday()
    case 'week':
      return startOfISOWeek(new Date())
    case 'month':
      return startOfMonth(new Date())
  }
}

export function totalMinutesForPeriod(sessions: StudySession[], key: PeriodKey): number {
  const since = periodStart(key).getTime()
  return sessions.reduce((sum, session) => {
    if (new Date(session.startedAt).getTime() >= since) {
      return sum + sessionDurationMinutes(session)
    }
    return sum
  }, 0)
}

export function formatSessionTime(iso: string): string {
  return format(new Date(iso), 'MMM d, HH:mm')
}

export function totalMinutesBetween(sessions: StudySession[], from: Date, to: Date): number {
  const start = from.getTime()
  const end = to.getTime()
  return sessions.reduce((sum, session) => {
    const startedAt = new Date(session.startedAt).getTime()
    if (startedAt >= start && startedAt < end) {
      return sum + sessionDurationMinutes(session)
    }
    return sum
  }, 0)
}

export function minutesPerMonth(
  sessions: StudySession[],
  months: number,
  now = new Date(),
): { label: string; minutes: number }[] {
  const out: { label: string; minutes: number }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const from = startOfMonth(subMonths(now, i))
    const to = startOfMonth(subMonths(now, i - 1))
    out.push({ label: format(from, 'MMM'), minutes: totalMinutesBetween(sessions, from, to) })
  }
  return out
}

export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) {
    return current > 0 ? null : 0
  }
  return Math.round(((current - previous) / previous) * 100)
}

export function minutesPerDay(sessions: StudySession[], weekStart: Date): number[] {
  const out = Array.from({ length: 7 }, () => 0)
  const weekStartDay = startOfDay(weekStart).getTime()
  for (const session of sessions) {
    const started = new Date(session.startedAt)
    const dayIndex = Math.floor(
      (startOfDay(started).getTime() - weekStartDay) / (24 * 60 * 60 * 1000),
    )
    if (dayIndex >= 0 && dayIndex < 7) {
      out[dayIndex] += sessionDurationMinutes(session)
    }
  }
  return out
}

export function weekdayLabels(weekStart: Date): string[] {
  return Array.from({ length: 7 }, (_, index) => format(addDays(weekStart, index), 'EEE'))
}
