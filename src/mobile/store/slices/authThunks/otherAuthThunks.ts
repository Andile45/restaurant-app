import { AppDispatch } from '../../index';
import { signOut, signInWithGoogle, resetPassword } from '../../../api/auth.api';
import { setLoading, setError, clearAuth, setUser } from '../authSlice';
import { supabase } from '../../../api/supabaseClient';
import { mapProfileFromDatabase } from '../../../utils/profileMapper';

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

export const updateProfile = (updates: {
  name: string;
  surname: string;
  contact_number: string;
  address?: string;
}) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Get current user session
    const { data: { user: authUser }, error: sessionError } = await supabase.auth.getUser();
    
    if (sessionError || !authUser) {
      throw new Error('Not authenticated');
    }

    // Update profile in database
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        surname: updates.surname,
        contact_number: updates.contact_number,
        address: updates.address || null,
      })
      .eq('auth_uid', authUser.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    if (!updatedProfile) {
      throw new Error('Profile not found');
    }

    // Update Redux state with new profile data
    const mappedProfile = mapProfileFromDatabase(updatedProfile, authUser.id);
    dispatch(setUser(mappedProfile));

    return mappedProfile;
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to update profile';
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};
