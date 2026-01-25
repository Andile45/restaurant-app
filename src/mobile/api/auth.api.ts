import { supabase } from './supabaseClient'

export const signUp = async (email: string, password: string) =>
  supabase.auth.signUp({ email, password })

export const signIn = async (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = async () =>
  supabase.auth.signOut()

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/callback`,
    },
  });
  return { data, error };
}

export const resetPassword = async (email: string) =>
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/reset-password`,
  })
