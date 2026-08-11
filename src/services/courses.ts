import { getSupabase, supabase } from '@/services/supabase'
import type { Course, CourseStatus } from '@/types'

export interface CourseInput {
  title: string
  description?: string | null
  color: string
  targetDate?: string | null
  status?: CourseStatus
}

export async function listCourses(): Promise<Course[]> {
  if (!supabase) {
    return []
  }
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    throw new Error(error.message)
  }
  return data as Course[]
}

export async function getCourse(id: string): Promise<Course | null> {
  if (!supabase) {
    return null
  }
  const { data, error } = await supabase.from('courses').select('*').eq('id', id).maybeSingle()
  if (error) {
    throw new Error(error.message)
  }
  return (data as Course) ?? null
}

export async function createCourse(input: CourseInput): Promise<Course> {
  const client = getSupabase()
  const { data, error } = await client
    .from('courses')
    .insert({
      title: input.title,
      description: input.description ?? null,
      color: input.color,
      target_date: input.targetDate ?? null,
      status: input.status ?? 'active',
    })
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as Course
}

export async function updateCourse(id: string, input: CourseInput): Promise<Course> {
  const client = getSupabase()
  const { data, error } = await client
    .from('courses')
    .update({
      title: input.title,
      description: input.description ?? null,
      color: input.color,
      target_date: input.targetDate ?? null,
      status: input.status ?? 'active',
    })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as Course
}

export async function deleteCourse(id: string): Promise<void> {
  const client = getSupabase()
  const { error } = await client.from('courses').delete().eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
}
