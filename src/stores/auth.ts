import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabase, supabase } from '@/services/supabase'
import { getProfile, upsertProfile, type ProfileInput } from '@/services/profiles'
import type { Profile } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref(true)

  let initPromise: Promise<void> | null = null

  const user = computed<User | null>(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => session.value !== null)

  function init(): Promise<void> {
    if (!initPromise) {
      initPromise = doInit()
    }
    return initPromise
  }

  async function doInit(): Promise<void> {
    if (!supabase) {
      loading.value = false
      return
    }
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    await fetchProfile()
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      if (newSession) {
        void fetchProfile()
      } else {
        profile.value = null
      }
    })
    loading.value = false
  }

  async function fetchProfile(): Promise<void> {
    const currentUser = user.value
    if (!currentUser) {
      profile.value = null
      return
    }
    profile.value = await getProfile(currentUser.id)
  }

  async function updateProfile(input: ProfileInput): Promise<void> {
    const currentUser = user.value
    if (!currentUser) {
      throw new Error('Not authenticated')
    }
    profile.value = await upsertProfile(currentUser.id, input)
  }

  async function login(email: string, password: string): Promise<void> {
    const client = getSupabase()
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) {
      throw new Error(error.message)
    }
  }

  async function register(email: string, password: string): Promise<boolean> {
    const client = getSupabase()
    const { data, error } = await client.auth.signUp({ email, password })
    if (error) {
      throw new Error(error.message)
    }
    return data.session !== null
  }

  async function requestPasswordReset(email: string): Promise<void> {
    const client = getSupabase()
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      throw new Error(error.message)
    }
  }

  async function updatePassword(newPassword: string): Promise<void> {
    const client = getSupabase()
    const { error } = await client.auth.updateUser({ password: newPassword })
    if (error) {
      throw new Error(error.message)
    }
  }

  async function logout(): Promise<void> {
    if (!supabase) {
      session.value = null
      return
    }
    await supabase.auth.signOut()
  }

  return {
    session,
    profile,
    user,
    loading,
    isAuthenticated,
    init,
    fetchProfile,
    updateProfile,
    login,
    register,
    requestPasswordReset,
    updatePassword,
    logout,
  }
})
