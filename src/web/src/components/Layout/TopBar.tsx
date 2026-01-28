import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { supabase } from '../../api/supabaseClient';
import { clearAuth } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLogout, HiOutlineUserCircle } from 'react-icons/hi';
import { getRoleDisplayName } from '../../utils/roleHelpers';

export const TopBar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(clearAuth());
    navigate('/login');
  };

  return (
    <div className="h-16 bg-bg-surface border-b border-border flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="heading-sm text-white">BX</span>
          </div>
          <div>
            <h1 className="heading-sm text-text-primary">BiteX</h1>
            <p className="caption-xs text-text-secondary">Restaurant CMS</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <HiOutlineUserCircle className="w-5 h-5 text-text-secondary" />
          <div className="text-right">
            <p className="body-sm font-medium text-text-primary">
              {user?.name} {user?.surname}
            </p>
            <p className="caption-xs text-text-secondary">
              {getRoleDisplayName(user?.role || 'user')}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 body-sm text-status-error hover:bg-red-50 rounded-md transition-colors"
        >
          <HiOutlineLogout className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};
