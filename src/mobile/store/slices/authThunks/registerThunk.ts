import { AppDispatch } from '../../index';
import { supabase } from '../../../api/supabaseClient';
import { setLoading, setError, setUser, setSession, clearAuth, setRegistrationSuccess } from '../authSlice';
import { mapProfileFromDatabase } from '../../../utils/profileMapper';
import { waitForProfile, createProfileViaFunction, createProfileViaDirectInsert } from './registerThunkHelpers';

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

    console.log('Starting registration for:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          surname,
          contact_number: contactNumber || null,
        },
      },
    });

    if (error) {
      console.error('SignUp error:', error);
      dispatch(setError(error.message || 'Failed to create account'));
      throw error;
    }

    if (!data.user) {
      dispatch(setError('Account creation failed. Please try again.'));
      throw new Error('Account creation failed');
    }

    const userId = data.user.id;
    console.log('User created with ID:', userId);

    let profile = await waitForProfile(userId);

    if (!profile) {
      console.warn('Trigger did not create profile, attempting to use database function...');
      try {
        profile = await createProfileViaFunction(userId, email, name, surname, contactNumber);
      } catch (functionError: any) {
        console.warn('Trying direct insert as last resort...');
        try {
          profile = await createProfileViaDirectInsert(userId, email, name, surname, contactNumber);
        } catch (directError: any) {
          console.error('All profile creation methods failed:', directError);
          await supabase.auth.signOut();

          let errorMessage = 'Database error saving new user';
          if (directError.code === '42501' || directError.message?.includes('permission')) {
            errorMessage = 'Permission denied. Please contact support or check database policies.';
          } else if (directError.code === '23505') {
            errorMessage = 'Email already exists. Please use a different email or try logging in.';
          } else if (directError.message) {
            errorMessage = directError.message;
          }
          
          dispatch(setError(errorMessage));
          throw directError;
        }
      }
    }

    if (data.session && profile) {
      dispatch(setSession(data.session));
      const mappedProfile = mapProfileFromDatabase(profile, userId);
      dispatch(setUser(mappedProfile));
      console.log('User authenticated and profile set');
    } else if (!data.session) {
      console.log('Registration successful. Email confirmation required.');
      dispatch(setRegistrationSuccess({ email }));
      dispatch(setError(null));
      await supabase.auth.signOut();
      dispatch(clearAuth());
    } else {
      console.warn('Session exists but profile not found');
      dispatch(setError('Account created but profile not found. Please contact support.'));
      await supabase.auth.signOut();
      dispatch(clearAuth());
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    if (!error.message || !error.message.includes('Database error')) {
      dispatch(setError(error.message || 'Registration failed. Please try again.'));
    }
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};
