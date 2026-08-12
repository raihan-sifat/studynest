import { addDays, format, isSameDay, isSameMonth, startOfWeek, type Day } from 'date-fns'
import type { Goal, StudySession, Task } from '@/types'

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export function monthGrid(monthStart: Date, weekStartsOn: Day = 1): Date[] {
  const gridStart = startOfWeek(monthStart, { weekStartsOn })
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}

export function dayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function isCurrentMonth(day: Date, monthStart: Date): boolean {
  return isSameMonth(day, monthStart)
}

export function isCurrentDay(day: Date, today = new Date()): boolean {
  return isSameDay(day, today)
}

export function formatMonthTitle(monthStart: Date): string {
  return format(monthStart, 'MMMM yyyy')
}

export interface DayEvents {
  tasks: Task[]
  sessions: StudySession[]
  goals: Goal[]
}

export function groupEventsByDay(
  tasks: Task[],
  sessions: StudySession[],
  goals: Goal[],
): Map<string, DayEvents> {
  const map = new Map<string, DayEvents>()
  const ensure = (key: string): DayEvents => {
    const existing = map.get(key)
    if (existing) {
      return existing
    }
    const entry: DayEvents = { tasks: [], sessions: [], goals: [] }
    map.set(key, entry)
    return entry
  }
  for (const task of tasks) {
    if (task.dueDate) {
      ensure(task.dueDate).tasks.push(task)
    }
  }
  for (const session of sessions) {
    ensure(dayKey(new Date(session.startedAt))).sessions.push(session)
  }
  for (const goal of goals) {
    if (goal.deadline) {
      ensure(goal.deadline).goals.push(goal)
    }
  }
  map.forEach((events) => {
    events.tasks.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    events.sessions.sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    events.goals.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  })
  return map
}

export function totalEventCount(events: DayEvents | null | undefined): number {
  if (!events) {
    return 0
  }
  return events.tasks.length + events.sessions.length + events.goals.length
}
