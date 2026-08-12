import { describe, expect, it } from 'vitest'
import type { Goal } from '@/types'
import {
  daysUntilDeadline,
  goalPhase,
  goalProgressPercent,
  isGoalOverdue,
} from '@/utils/progress'

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

describe('goalProgressPercent', () => {
  it('returns 0 when the target is not positive', () => {
    expect(goalProgressPercent(50, 0)).toBe(0)
    expect(goalProgressPercent(50, -1)).toBe(0)
  })

  it('returns the rounded percentage', () => {
    expect(goalProgressPercent(50, 100)).toBe(50)
    expect(goalProgressPercent(1, 3)).toBe(33)
  })

  it('clamps to the 0-100 range', () => {
    expect(goalProgressPercent(-20, 100)).toBe(0)
    expect(goalProgressPercent(150, 100)).toBe(100)
  })
})

describe('daysUntilDeadline', () => {
  it('counts calendar days from a fixed today', () => {
    const today = new Date(2026, 7, 10) // Aug 10, 2026
    expect(daysUntilDeadline('2026-08-13', today)).toBe(3)
    expect(daysUntilDeadline('2026-08-10', today)).toBe(0)
    expect(daysUntilDeadline('2026-08-07', today)).toBe(-3)
  })
})

describe('isGoalOverdue', () => {
  it('is false for achieved goals even with a past deadline', () => {
    const goal = makeGoal({ status: 'achieved', deadline: '2026-07-01' })
    expect(isGoalOverdue(goal)).toBe(false)
  })

  it('is false when there is no deadline', () => {
    expect(isGoalOverdue(makeGoal({ deadline: null }))).toBe(false)
  })

  it('is true for a non-achieved goal with a deadline in the past', () => {
    const goal = makeGoal({ deadline: '2026-07-01' })
    expect(isGoalOverdue(goal)).toBe(true)
  })

  it('is false when the deadline is today or in the future', () => {
    const today = new Date(2026, 7, 10)
    expect(isGoalOverdue(makeGoal({ deadline: '2026-08-10' }), today)).toBe(false)
    expect(isGoalOverdue(makeGoal({ deadline: '2026-08-15' }), today)).toBe(false)
  })
})

describe('goalPhase', () => {
  it('returns archived for archived goals', () => {
    const goal = makeGoal({ status: 'archived', currentValue: 100 })
    expect(goalPhase(goal)).toBe('archived')
  })

  it('returns achieved when status is achieved', () => {
    const goal = makeGoal({ status: 'achieved', currentValue: 50 })
    expect(goalPhase(goal)).toBe('achieved')
  })

  it('auto-detects achieved when current reaches the target', () => {
    const goal = makeGoal({ status: 'active', currentValue: 100, targetValue: 100 })
    expect(goalPhase(goal)).toBe('achieved')
  })

  it('returns overdue for non-achieved goals past their deadline', () => {
    const goal = makeGoal({ deadline: '2026-07-01', currentValue: 40 })
    expect(goalPhase(goal)).toBe('overdue')
  })

  it('returns active otherwise', () => {
    const today = new Date(2026, 7, 10)
    const goal = makeGoal({ deadline: '2026-08-20', currentValue: 40 })
    expect(goalPhase(goal, today)).toBe('active')
  })
})
