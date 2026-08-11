import { getSupabase, supabase } from '@/services/supabase'
import type { FocusRating, StudySession } from '@/types'

export interface StudySessionInput {
  courseId?: string | null
  startedAt: string
  endedAt?: string | null
  durationMinutes?: number | null
  focusRating?: FocusRating | null
  description?: string | null
}

export interface StudySessionFilters {
  courseId?: string
  limit?: number
}

export async function listStudySessions(filters: StudySessionFilters = {}): Promise<StudySession[]> {
  if (!supabase) {
    return []
  }
  let query = supabase.from('study_sessions').select('*')
  if (filters.courseId && filters.courseId !== 'all') {
    query = query.eq('course_id', filters.courseId)
  }
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  const { data, error } = await query.order('started_at', { ascending: false })
  if (error) {
    throw new Error(error.message)
  }
  return data as StudySession[]
}

export async function createStudySession(input: StudySessionInput): Promise<StudySession> {
  const client = getSupabase()
  const { data, error } = await client
    .from('study_sessions')
    .insert({
      course_id: input.courseId ?? null,
      started_at: input.startedAt,
      ended_at: input.endedAt ?? null,
      duration_minutes: input.durationMinutes ?? null,
      focus_rating: input.focusRating ?? null,
      description: input.description ?? null,
    })
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as StudySession
}

export async function updateStudySession(
  id: string,
  input: StudySessionInput,
): Promise<StudySession> {
  const client = getSupabase()
  const { data, error } = await client
    .from('study_sessions')
    .update({
      course_id: input.courseId ?? null,
      started_at: input.startedAt,
      ended_at: input.endedAt ?? null,
      duration_minutes: input.durationMinutes ?? null,
      focus_rating: input.focusRating ?? null,
      description: input.description ?? null,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as StudySession
}

export async function deleteStudySession(id: string): Promise<void> {
  const client = getSupabase()
  const { error } = await client.from('study_sessions').delete().eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
}
