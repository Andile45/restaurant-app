import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { TopBar } from './TopBar';
import { 
  HiOutlineChartBar, 
  HiOutlineMenu, 
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlineUsers
} from 'react-icons/hi';

export const Layout = () => {
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: HiOutlineChartBar,
      roles: ['admin', 'manager', 'staff'],
    },
    {
      path: '/menu',
      label: 'Menu',
      icon: HiOutlineMenu,
      roles: ['admin', 'manager'],
    },
    {
      path: '/orders',
      label: 'Orders',
      icon: HiOutlineClipboardList,
      roles: ['admin', 'manager', 'staff'],
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: HiOutlineCog,
      roles: ['admin'],
    },
    {
      path: '/users',
      label: 'Users',
      icon: HiOutlineUsers,
      roles: ['admin'],
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className="min-h-screen bg-bg-app flex flex-col">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-bg-surface border-r border-border flex flex-col">
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {visibleMenuItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 body rounded-md transition-colors ${
                    active
                      ? 'bg-primary'
                      : 'text-text-primary hover:bg-secondary'
                  }`}
                  style={active ? { color: 'var(--color-text-inverse)' } : undefined}
                >
                  <IconComponent 
                    className="w-5 h-5" 
                    style={active ? { color: 'var(--color-text-inverse)' } : undefined}
                  />
                  <span style={active ? { color: 'var(--color-text-inverse)' } : undefined}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
