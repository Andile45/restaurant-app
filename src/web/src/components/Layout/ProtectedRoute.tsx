import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { isCMSUser } from '../../utils/roleHelpers';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, session } = useAppSelector((state) => state.auth);

  if (!session || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!isCMSUser(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
