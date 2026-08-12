import type { Course, CourseStatus, Goal, Task } from '@/types'

export interface TaskCompletionStats {
  total: number
  done: number
  open: number
  percent: number
}

export function taskCompletionStats(tasks: Task[]): TaskCompletionStats {
  const total = tasks.length
  const done = tasks.filter((task) => task.status === 'done').length
  return {
    total,
    done,
    open: total - done,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}

export function courseStatusCounts(courses: Course[]): Record<CourseStatus, number> {
  const counts: Record<CourseStatus, number> = { active: 0, completed: 0, archived: 0 }
  for (const course of courses) {
    counts[course.status] += 1
  }
  return counts
}

export interface GoalStatusCounts {
  achieved: number
  active: number
  archived: number
}

export function goalStatusCounts(goals: Goal[]): GoalStatusCounts {
  const counts: GoalStatusCounts = { achieved: 0, active: 0, archived: 0 }
  for (const goal of goals) {
    if (goal.status === 'archived') {
      counts.archived += 1
    } else if (goal.status === 'achieved' || goal.currentValue >= goal.targetValue) {
      counts.achieved += 1
    } else {
      counts.active += 1
    }
  }
  return counts
}
