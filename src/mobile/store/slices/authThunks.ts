import { AppDispatch } from '../index';
import type { Profile } from '../../../common/types/profile';
import { signIn, signUp, signOut, signInWithGoogle, resetPassword } from '../../api/auth.api';
import { supabase } from '../../api/supabaseClient';
import { setLoading, setError, setUser, setSession, clearAuth } from './authSlice';
import { mapProfileFromDatabase } from '../../utils/profileMapper';

export const loginUser = (email: string, password: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const { data, error } = await signIn(email, password);

    if (error) throw error;

    if (data.session) {
      dispatch(setSession(data.session));
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_uid', data.session.user.id)
        .single();

      if (profileError) throw profileError;
      if (profile) {
        const mappedProfile = mapProfileFromDatabase(profile, data.session.user.id);
        dispatch(setUser(mappedProfile));
      }
    }
  } catch (error: any) {
    dispatch(setError(error.message || 'Login failed'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const registerUser = (
  email: string,
  password: string,
  name: string,
  surname: string,
  contactNumber?: string
) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const { data, error } = await signUp(email, password);

    if (error) {
      const errorMessage = error.message || 'Failed to create account';
      dispatch(setError(errorMessage));
      throw error;
    }

    if (!data.session || !data.user) {
      const errorMessage = 'Account created but session not available. Please try logging in.';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    }
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        auth_uid: data.user.id,
        email,
        name,
        surname,
        contact_number: contactNumber || null,
        role: 'user',
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      console.error('Error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      });
      
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Failed to sign out after profile creation error:', signOutError);
      }

      let errorMessage = 'Database error saving new user';
      if (profileError.code === '42501' || profileError.message?.includes('permission') || profileError.message?.includes('policy')) {
        errorMessage = 'Permission denied. Please contact support or check database policies.';
      } else if (profileError.message) {
        errorMessage = profileError.message;
      }
      
      dispatch(setError(errorMessage));
      throw profileError;
    }

    if (!profile) {
      const errorMessage = 'Profile created but data not returned';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    }

    dispatch(setSession(data.session));
    const mappedProfile = mapProfileFromDatabase(profile, data.user.id);
    dispatch(setUser(mappedProfile));
  } catch (error: any) {
    if (!error.message || !error.message.includes('Database error')) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      dispatch(setError(errorMessage));
    }
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const logoutUser = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    await signOut();
    dispatch(clearAuth());
  } catch (error: any) {
    dispatch(setError(error.message || 'Logout failed'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const checkAuthSession = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      dispatch(setSession(session));
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_uid', session.user.id)
        .single();

      if (!error && profile) {
        const mappedProfile = mapProfileFromDatabase(profile, session.user.id);
        dispatch(setUser(mappedProfile));
      }
    } else {
      dispatch(clearAuth());
    }
  } catch (error: any) {
    dispatch(setError(error.message || 'Session check failed'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const loginWithGoogle = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const { data, error } = await signInWithGoogle();

    if (error) throw error;
  } catch (error: any) {
    dispatch(setError(error.message || 'Google sign-in failed'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const resetUserPassword = (email: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const { error } = await resetPassword(email);

    if (error) throw error;
  } catch (error: any) {
    dispatch(setError(error.message || 'Password reset failed'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};
