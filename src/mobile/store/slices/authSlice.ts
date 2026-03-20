/**
 * Auth slice: user, session, loading, errors, and registration success state.
 * Thunks (login, register, logout, checkAuthSession, etc.) live in authThunks.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Profile } from '../../../common/types/profile';

interface AuthState {
  user: Profile | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  registrationSuccess: boolean;
  registrationEmail: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  registrationSuccess: false,
  registrationEmail: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUser: (state, action: PayloadAction<Profile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setSession: (state, action: PayloadAction<any | null>) => {
      state.session = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.isAuthenticated = false;
      state.error = null;
      state.registrationSuccess = false;
      state.registrationEmail = null;
    },
    setRegistrationSuccess: (state, action: PayloadAction<{ email: string }>) => {
      state.registrationSuccess = true;
      state.registrationEmail = action.payload.email;
      state.error = null;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
      state.registrationEmail = null;
    },
  },
});

export const { setLoading, setError, setUser, setSession, clearAuth, setRegistrationSuccess, clearRegistrationSuccess } = authSlice.actions;

export {
  loginUser,
  registerUser,
  logoutUser,
  checkAuthSession,
  loginWithGoogle,
  resetUserPassword,
  updateProfile,
} from './authThunks';

export default authSlice.reducer;
