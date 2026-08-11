import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabase, supabase } from '@/services/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
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
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
    })
    loading.value = false
  }

  async function login(email: string, password: string): Promise<void> {
    const client = getSupabase()
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) {
      throw new Error(error.message)
    }
  }

  async function register(email: string, password: string): Promise<void> {
    const client = getSupabase()
    const { error } = await client.auth.signUp({ email, password })
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

  return { session, user, loading, isAuthenticated, init, login, register, logout }
})
