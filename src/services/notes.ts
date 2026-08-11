import { getSupabase, supabase } from '@/services/supabase'
import type { Note } from '@/types'

export interface NoteInput {
  title: string
  englishContent?: string | null
  chineseContent?: string | null
  tags: string[]
  courseId?: string | null
}

export interface NoteFilters {
  courseId?: string
  tag?: string
  search?: string
}

export async function listNotes(filters: NoteFilters = {}): Promise<Note[]> {
  if (!supabase) {
    return []
  }
  let query = supabase.from('notes').select('*')
  if (filters.courseId && filters.courseId !== 'all') {
    query = query.eq('course_id', filters.courseId)
  }
  if (filters.tag) {
    query = query.contains('tags', [filters.tag])
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,english_content.ilike.%${filters.search}%`)
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) {
    throw new Error(error.message)
  }
  return data as Note[]
}

export async function createNote(input: NoteInput): Promise<Note> {
  const client = getSupabase()
  const { data, error } = await client
    .from('notes')
    .insert({
      title: input.title,
      english_content: input.englishContent ?? null,
      chinese_content: input.chineseContent ?? null,
      tags: input.tags,
      course_id: input.courseId ?? null,
    })
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as Note
}

export async function updateNote(id: string, input: NoteInput): Promise<Note> {
  const client = getSupabase()
  const { data, error } = await client
    .from('notes')
    .update({
      title: input.title,
      english_content: input.englishContent ?? null,
      chinese_content: input.chineseContent ?? null,
      tags: input.tags,
      course_id: input.courseId ?? null,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as Note
}

export async function deleteNote(id: string): Promise<void> {
  const client = getSupabase()
  const { error } = await client.from('notes').delete().eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
}
