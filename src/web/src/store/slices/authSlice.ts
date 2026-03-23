import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Profile } from '../../types';

interface AuthState {
  user: Profile | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  // Start in "loading" to prevent `ProtectedRoute` from redirecting
  // before `supabase.auth.getSession()` has run on the first render.
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUser: (state, action: PayloadAction<Profile | null>) => {
      state.user = action.payload;
    },
    setSession: (state, action: PayloadAction<any | null>) => {
      state.session = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.error = null;
    },
  },
});

export const { setLoading, setError, setUser, setSession, clearAuth } = authSlice.actions;
export default authSlice.reducer;
