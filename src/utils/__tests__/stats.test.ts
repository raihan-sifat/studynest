import { describe, expect, it } from 'vitest'
import type { Course, Goal, Task } from '@/types'
import { courseStatusCounts, goalStatusCounts, taskCompletionStats } from '@/utils/stats'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
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
  }
}

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 'c1',
    userId: 'u1',
    title: 'Course',
    description: null,
    color: '#047857',
    targetDate: null,
    status: 'active',
    createdAt: '2026-08-01T00:00:00',
    updatedAt: '2026-08-01T00:00:00',
    ...overrides,
  }
}

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'g1',
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
  }
}

describe('taskCompletionStats', () => {
  it('returns zeros for an empty list', () => {
    expect(taskCompletionStats([])).toEqual({ total: 0, done: 0, open: 0, percent: 0 })
  })

  it('computes done/open/percent', () => {
    const tasks = [
      makeTask({ status: 'done' }),
      makeTask({ status: 'done' }),
      makeTask({ status: 'todo' }),
      makeTask({ status: 'in_progress' }),
    ]
    expect(taskCompletionStats(tasks)).toEqual({ total: 4, done: 2, open: 2, percent: 50 })
  })

  it('rounds percent', () => {
    const tasks = [makeTask({ status: 'done' }), makeTask({ status: 'todo' }), makeTask({ status: 'todo' })]
    expect(taskCompletionStats(tasks)).toEqual({ total: 3, done: 1, open: 2, percent: 33 })
  })
})

describe('courseStatusCounts', () => {
  it('counts each status, defaulting to zero', () => {
    const courses = [
      makeCourse({ status: 'active' }),
      makeCourse({ status: 'active' }),
      makeCourse({ status: 'completed' }),
      makeCourse({ status: 'archived' }),
    ]
    expect(courseStatusCounts(courses)).toEqual({ active: 2, completed: 1, archived: 1 })
  })

  it('returns zeroed counts for an empty list', () => {
    expect(courseStatusCounts([])).toEqual({ active: 0, completed: 0, archived: 0 })
  })
})

describe('goalStatusCounts', () => {
  it('counts archived, achieved and active goals', () => {
    const goals = [
      makeGoal({ status: 'archived' }),
      makeGoal({ status: 'archived' }),
      makeGoal({ status: 'achieved', currentValue: 50 }),
      makeGoal({ status: 'active', currentValue: 10 }),
    ]
    expect(goalStatusCounts(goals)).toEqual({ archived: 2, achieved: 1, active: 1 })
  })

  it('auto-detects achieved when current reaches the target, even if status is active', () => {
    const goals = [makeGoal({ status: 'active', currentValue: 100, targetValue: 100 })]
    expect(goalStatusCounts(goals)).toEqual({ archived: 0, achieved: 1, active: 0 })
  })

  it('returns zeroed counts for an empty list', () => {
    expect(goalStatusCounts([])).toEqual({ achieved: 0, active: 0, archived: 0 })
  })
})
