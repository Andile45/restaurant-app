import { AppDispatch } from '../../index';
import { signIn } from '../../../api/auth.api';
import { supabase } from '../../../api/supabaseClient';
import { setLoading, setError, setUser, setSession, clearAuth } from '../authSlice';
import { mapProfileFromDatabase } from '../../../utils/profileMapper';

export const loginUser = (email: string, password: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const { data, error } = await signIn(email, password);

    if (error) {
      dispatch(setError(error.message || 'Login failed'));
      throw error;
    }

    if (!data.session) {
      const errorMessage = 'Login successful but no session received';
      dispatch(setError(errorMessage));
      throw new Error(errorMessage);
    }

    dispatch(setSession(data.session));
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_uid', data.session.user.id)
      .single();

    if (profileError) {
      console.error('Profile lookup error during login:', profileError);
      console.error('Error code:', profileError.code);
      console.error('Error message:', profileError.message);
      console.error('User ID:', data.session.user.id);
      
      const errorMessage = profileError.code === 'PGRST116' 
        ? 'Profile not found. Please complete your registration.'
        : `Profile lookup failed: ${profileError.message}`;
      
      dispatch(setError(errorMessage));
      await supabase.auth.signOut();
      dispatch(clearAuth());
      throw profileError;
    }

    if (!profile) {
      console.error('Profile is null after successful lookup');
      const errorMessage = 'Profile not found. Please contact support.';
      dispatch(setError(errorMessage));
      await supabase.auth.signOut();
      dispatch(clearAuth());
      throw new Error(errorMessage);
    }

    const mappedProfile = mapProfileFromDatabase(profile, data.session.user.id);
    dispatch(setUser(mappedProfile));
  } catch (error: any) {
    if (!error.message || !error.message.includes('Profile')) {
      dispatch(setError(error.message || 'Login failed'));
    }
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};
