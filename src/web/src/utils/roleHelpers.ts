export type UserRole = 'user' | 'admin' | 'manager' | 'staff';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  staff: 1,
  manager: 2,
  admin: 3,
};

export const isCMSUser = (role: string): boolean => {
  return ['admin', 'manager', 'staff'].includes(role);
};

export const isCustomer = (role: string): boolean => {
  return role === 'user';
};

export const hasPermission = (
  userRole: string,
  requiredRole: UserRole
): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole as UserRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
};

export const canManageMenu = (role: string): boolean => {
  return role === 'admin' || role === 'manager';
};

export const canManageOrders = (role: string): boolean => {
  return ['admin', 'manager', 'staff'].includes(role);
};

export const canUpdateOrderStatus = (role: string): boolean => {
  return ['admin', 'manager', 'staff'].includes(role);
};

export const canManageUsers = (role: string): boolean => {
  return role === 'admin';
};

export const canViewAllOrders = (role: string): boolean => {
  return ['admin', 'manager', 'staff'].includes(role);
};

export const canViewPayments = (role: string): boolean => {
  return role === 'admin' || role === 'manager';
};

export const canManagePayments = (role: string): boolean => {
  return role === 'admin';
};

export const canUpdateOrderFields = (role: string): boolean => {
  return role === 'admin' || role === 'manager';
};

export const canOnlyUpdateStatus = (role: string): boolean => {
  return role === 'staff';
};

export const getRoleDisplayName = (role: string): string => {
  const displayNames: Record<string, string> = {
    user: 'Customer',
    admin: 'Administrator',
    manager: 'Manager',
    staff: 'Staff',
  };
  return displayNames[role] || role;
};

export const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    user: '#3b82f6',      // Blue
    admin: '#ef4444',     // Red
    manager: '#f59e0b',   // Orange/Amber
    staff: '#10b981',     // Green
  };
  return colors[role] || '#6b7280'; // Gray as default
};
