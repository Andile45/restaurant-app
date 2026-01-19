import { supabase } from './supabaseClient.js'

export const signUp = async (email: string, password: string) =>
  supabase.auth.signUp({ email, password })

export const signIn = async (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = async () =>
  supabase.auth.signOut()
