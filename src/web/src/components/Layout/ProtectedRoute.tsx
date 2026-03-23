import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { isCMSUser } from '../../utils/roleHelpers';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, session, loading } = useAppSelector((state) => state.auth);

  // Important: wait for auth bootstrap to finish before deciding to redirect.
  // Otherwise, a transient `null` session/user on refresh can bounce the admin to `/login`.
  if (loading) {
    return <div className="p-8 body text-text-secondary">Loading...</div>;
  }

  if (!session || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!isCMSUser(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
