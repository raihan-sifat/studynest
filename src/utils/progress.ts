import { differenceInCalendarDays } from 'date-fns'
import type { Goal } from '@/types'

export function goalProgressPercent(currentValue: number, targetValue: number): number {
  if (targetValue <= 0) {
    return 0
  }
  return Math.min(100, Math.max(0, Math.round((currentValue / targetValue) * 100)))
}

export function daysUntilDeadline(deadline: string, today = new Date()): number {
  return differenceInCalendarDays(new Date(`${deadline}T00:00:00`), today)
}

export function isGoalOverdue(goal: Goal, today = new Date()): boolean {
  return goal.status !== 'achieved' && goal.deadline !== null && daysUntilDeadline(goal.deadline, today) < 0
}

export type GoalPhase = 'achieved' | 'overdue' | 'active' | 'archived'

export function goalPhase(goal: Goal, today = new Date()): GoalPhase {
  if (goal.status === 'archived') {
    return 'archived'
  }
  if (goal.status === 'achieved' || goal.currentValue >= goal.targetValue) {
    return 'achieved'
  }
  if (isGoalOverdue(goal, today)) {
    return 'overdue'
  }
  return 'active'
}
