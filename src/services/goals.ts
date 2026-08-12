import { getSupabase, supabase } from '@/services/supabase'
import type { Goal, GoalStatus } from '@/types'
import { toCamel, toCamelArray } from '@/utils/rows'

export interface GoalInput {
  title: string
  description?: string | null
  courseId?: string | null
  targetValue: number
  currentValue?: number
  deadline?: string | null
  status?: GoalStatus
}

export interface GoalFilters {
  courseId?: string
  status?: GoalStatus | 'all'
  search?: string
}

export async function listGoals(filters: GoalFilters = {}): Promise<Goal[]> {
  if (!supabase) {
    return []
  }
  let query = supabase.from('goals').select('*')
  if (filters.courseId && filters.courseId !== 'all') {
    query = query.eq('course_id', filters.courseId)
  }
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) {
    throw new Error(error.message)
  }
  return toCamelArray<Goal>(data ?? [])
}

export async function createGoal(input: GoalInput): Promise<Goal> {
  const client = getSupabase()
  const { data, error } = await client
    .from('goals')
    .insert({
      title: input.title,
      description: input.description ?? null,
      course_id: input.courseId ?? null,
      target_value: input.targetValue,
      current_value: input.currentValue ?? 0,
      deadline: input.deadline ?? null,
      status: input.status ?? 'active',
    })
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return toCamel<Goal>(data)
}

export async function updateGoal(id: string, input: GoalInput): Promise<Goal> {
  const client = getSupabase()
  const { data, error } = await client
    .from('goals')
    .update({
      title: input.title,
      description: input.description ?? null,
      course_id: input.courseId ?? null,
      target_value: input.targetValue,
      current_value: input.currentValue ?? 0,
      deadline: input.deadline ?? null,
      status: input.status ?? 'active',
    })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return toCamel<Goal>(data)
}

export async function deleteGoal(id: string): Promise<void> {
  const client = getSupabase()
  const { error } = await client.from('goals').delete().eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
}
