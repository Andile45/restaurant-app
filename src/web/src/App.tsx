import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch } from './store/hooks';
import { setUser, setSession, clearAuth, setLoading } from './store/slices/authSlice';
import { supabase } from './api/supabaseClient';
import { isCMSUser } from './utils/roleHelpers';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Orders } from './pages/Orders/Orders';
import { Menu } from './pages/Menu/Menu';
import { Settings } from './pages/Settings/Settings';
import { Users } from './pages/Users/Users';
import { Payments } from './pages/Payments/Payments';

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch(setLoading(true));

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        dispatch(clearAuth());
        dispatch(setLoading(false));
        return;
      }

      if (session) {
        dispatch(setSession(session));

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_uid', session.user.id)
          .single();

        if (profileError || !profile) {
          dispatch(clearAuth());
          dispatch(setLoading(false));
          return;
        }

        if (!isCMSUser(profile.role)) {
          dispatch(clearAuth());
          dispatch(setLoading(false));
          return;
        }

        const mappedProfile = {
          id: profile.id,
          auth_id: profile.auth_uid,
          name: profile.name,
          surname: profile.surname,
          contact_number: profile.contact_number || '',
          email: profile.email,
          address: profile.address,
          card_last4: profile.card_last4,
          role: profile.role as 'user' | 'admin' | 'manager' | 'staff',
          created_at: profile.created_at,
        };

        dispatch(setUser(mappedProfile));
      } else {
        dispatch(clearAuth());
      }

      dispatch(setLoading(false));

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_OUT' || !session) {
            dispatch(clearAuth());
          } else if (event === 'SIGNED_IN' && session) {
            dispatch(setSession(session));

            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('auth_uid', session.user.id)
              .single();

            if (profile && isCMSUser(profile.role)) {
              const mappedProfile = {
                id: profile.id,
                auth_id: profile.auth_uid,
                name: profile.name,
                surname: profile.surname,
                contact_number: profile.contact_number || '',
                email: profile.email,
                address: profile.address,
                card_last4: profile.card_last4,
                role: profile.role as 'user' | 'admin' | 'manager' | 'staff',
                created_at: profile.created_at,
              };
              dispatch(setUser(mappedProfile));
            }
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, [dispatch]);

  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="payments" element={<Payments />} />
              <Route path="menu/*" element={<Menu />} />
              <Route path="settings" element={<Settings />} />
              <Route path="users" element={<Users />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
