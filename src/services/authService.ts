import { supabase } from '@/lib/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'

async function signUp(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { user: null, error: error.message }
    if (data.user && !data.user.identities?.length) {
      return { user: null, error: 'User with this email already exists' }
    }
    return { user: data.user, error: null }
  } catch (e: unknown) {
    return { user: null, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

async function signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { user: null, error: error.message }
    return { user: data.user, error: null }
  } catch (e: unknown) {
    return { user: null, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

async function signInWithGoogle(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) return { error: error.message }
    return { error: null }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) return { error: error.message }
    return { error: null }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

async function updateUser(params: {
  data?: Record<string, unknown>
  password?: string
}): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.updateUser(params)
    if (error) return { user: null, error: error.message }
    return { user: data.user, error: null }
  } catch (e: unknown) {
    return { user: null, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

async function getSession(): Promise<Session | null> {
  try {
    const { data } = await supabase.auth.getSession()
    return data.session
  } catch {
    return null
  }
}

export const authService = { signUp, signIn, signInWithGoogle, signOut, getSession, updateUser }
