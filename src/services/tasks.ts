import { getSupabase, supabase } from '@/services/supabase'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import { toCamel, toCamelArray } from '@/utils/rows'

export interface TaskInput {
  title: string
  description?: string | null
  courseId?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  estimatedMinutes?: number | null
}

export interface TaskFilters {
  courseId?: string
  status?: TaskStatus | 'all'
  search?: string
}

export async function listTasks(filters: TaskFilters = {}): Promise<Task[]> {
  if (!supabase) {
    return []
  }
  let query = supabase.from('tasks').select('*')
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
  return toCamelArray<Task>(data ?? [])
}

export async function createTask(input: TaskInput): Promise<Task> {
  const client = getSupabase()
  const { data, error } = await client
    .from('tasks')
    .insert({
      title: input.title,
      description: input.description ?? null,
      course_id: input.courseId ?? null,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      due_date: input.dueDate ?? null,
      estimated_minutes: input.estimatedMinutes ?? null,
    })
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return toCamel<Task>(data)
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const client = getSupabase()
  const { data, error } = await client
    .from('tasks')
    .update({
      title: input.title,
      description: input.description ?? null,
      course_id: input.courseId ?? null,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      due_date: input.dueDate ?? null,
      estimated_minutes: input.estimatedMinutes ?? null,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return toCamel<Task>(data)
}

export async function patchTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const client = getSupabase()
  const { data, error } = await client
    .from('tasks')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return toCamel<Task>(data)
}

export async function deleteTask(id: string): Promise<void> {
  const client = getSupabase()
  const { error } = await client.from('tasks').delete().eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
}
