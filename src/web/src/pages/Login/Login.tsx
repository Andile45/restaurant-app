import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser, setSession, setError, setLoading } from '../../store/slices/authSlice';
import { isCMSUser } from '../../utils/roleHelpers';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.auth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    dispatch(setError(null));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        dispatch(setError(error.message));
        setIsLoading(false);
        return;
      }

      if (!data.session) {
        dispatch(setError('Login failed. Email confirmation may be required. Please check your email.'));
        setIsLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_uid', data.session.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        dispatch(setError(`Profile error: ${profileError.message}. Auth ID: ${data.session.user.id}`));
        setIsLoading(false);
        return;
      }

      if (!profile) {
        console.error('Profile not found for auth_uid:', data.session.user.id);
        dispatch(setError(`Profile not found for user. Please contact support. Auth ID: ${data.session.user.id}`));
        setIsLoading(false);
        return;
      }

      if (!isCMSUser(profile.role)) {
        await supabase.auth.signOut();
        dispatch(setError('Access denied. This is a CMS for staff only.'));
        setIsLoading(false);
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

      dispatch(setSession(data.session));
      dispatch(setUser(mappedProfile));
      navigate('/dashboard');
    } catch (error: any) {
      dispatch(setError(error.message || 'An unexpected error occurred'));
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-app p-4">
      <div className="max-w-md w-full bg-bg-surface rounded-lg shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="heading-lg text-text-primary">
            BiteX CMS Login
          </h2>
          <p className="mt-2 body-sm text-text-secondary">
            Sign in to access the admin panel
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="body-sm text-status-error">{error}</p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block body-sm font-medium text-text-primary mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-border placeholder-text-secondary text-text-primary bg-bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors body"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block body-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-border placeholder-text-secondary text-text-primary bg-bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors body"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent body font-medium rounded-md text-text-inverse bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
