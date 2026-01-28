import { AppDispatch } from '../../index';
import { supabase } from '../../../api/supabaseClient';
import { setLoading, setError, setUser, setSession, clearAuth } from '../authSlice';
import { mapProfileFromDatabase } from '../../../utils/profileMapper';

export const checkAuthSession = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session check error:', sessionError);
      dispatch(clearAuth());
      return;
    }
    
    if (session) {
      dispatch(setSession(session));
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_uid', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile lookup error in checkAuthSession:', profileError);
        console.error('Error code:', profileError.code);
        console.error('User ID:', session.user.id);
        
        if (profileError.code === 'PGRST116') {
          console.warn('Profile not found for user, clearing auth');
        }
        dispatch(clearAuth());
        return;
      }

      if (profile) {
        const mappedProfile = mapProfileFromDatabase(profile, session.user.id);
        dispatch(setUser(mappedProfile));
      } else {
        console.warn('Session exists but profile is null');
        dispatch(clearAuth());
      }
    } else {
      dispatch(clearAuth());
    }
  } catch (error: any) {
    console.error('checkAuthSession error:', error);
    dispatch(setError(error.message || 'Session check failed'));
    dispatch(clearAuth());
  } finally {
    dispatch(setLoading(false));
  }
};
