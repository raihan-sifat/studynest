import { getSupabase, supabase } from '@/services/supabase'
import type { Profile } from '@/types'

export interface ProfileInput {
  name?: string
  bio?: string | null
  avatarUrl?: string | null
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!supabase) {
    return null
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    return null
  }
  return data as Profile
}

export async function upsertProfile(userId: string, input: ProfileInput): Promise<Profile> {
  const client = getSupabase()
  const existing = await getProfile(userId)
  const { data, error } = await client
    .from('profiles')
    .upsert({
      user_id: userId,
      name: input.name ?? existing?.name ?? '',
      bio: input.bio ?? existing?.bio ?? null,
      avatar_url: input.avatarUrl ?? existing?.avatarUrl ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data as Profile
}
