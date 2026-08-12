import { describe, expect, it } from 'vitest'
import { toCamel, toCamelArray } from '@/utils/rows'

interface TestRow {
  startedAt: string
  courseId: string | null
  durationMinutes: number | null
  userId: string
  createdAt: string
}

describe('toCamel', () => {
  it('converts snake_case keys to camelCase', () => {
    const row = {
      started_at: '2026-08-01T10:00:00Z',
      course_id: 'c1',
      duration_minutes: 30,
      user_id: 'u1',
      created_at: '2026-08-01T10:00:00Z',
    }
    const result = toCamel<TestRow>(row)
    expect(result.startedAt).toBe('2026-08-01T10:00:00Z')
    expect(result.courseId).toBe('c1')
    expect(result.durationMinutes).toBe(30)
    expect(result.userId).toBe('u1')
    expect(result.createdAt).toBe('2026-08-01T10:00:00Z')
  })

  it('leaves camelCase and non-underscore keys untouched', () => {
    const result = toCamel<{ id: string; alreadyCamel: number }>({
      id: 'x1',
      already_camel: 1,
      plain: 'kept',
    } as unknown as Record<string, unknown>)
    expect(result.id).toBe('x1')
    expect(result.alreadyCamel).toBe(1)
  })

  it('preserves values as-is, including nulls', () => {
    const result = toCamel<TestRow>({
      started_at: '2026-08-01T10:00:00Z',
      course_id: null,
      duration_minutes: null,
      user_id: 'u1',
      created_at: '2026-08-01T10:00:00Z',
    })
    expect(result.courseId).toBeNull()
    expect(result.durationMinutes).toBeNull()
  })
})

describe('toCamelArray', () => {
  it('maps every row', () => {
    const rows = [
      { started_at: '2026-08-01T10:00:00Z', duration_minutes: 30 },
      { started_at: '2026-08-02T11:00:00Z', duration_minutes: 45 },
    ]
    const result = toCamelArray<{ startedAt: string; durationMinutes: number }>(rows)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ startedAt: '2026-08-01T10:00:00Z', durationMinutes: 30 })
    expect(result[1]).toEqual({ startedAt: '2026-08-02T11:00:00Z', durationMinutes: 45 })
  })

  it('returns an empty array for an empty list', () => {
    expect(toCamelArray([])).toEqual([])
  })
})
