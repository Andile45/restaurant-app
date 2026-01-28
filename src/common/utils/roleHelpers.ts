/**
 * Role Helper Utilities
 * 
 * Provides functions for checking user roles and permissions
 * Used by both mobile app and web CMS
 */

export type UserRole = 'user' | 'admin' | 'manager' | 'staff';

/**
 * Role hierarchy mapping
 * Higher number = more permissions
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  staff: 1,
  manager: 2,
  admin: 3,
};

/**
 * Check if a role is a CMS role (not a customer)
 */
export const isCMSUser = (role: string): boolean => {
  return ['admin', 'manager', 'staff'].includes(role);
};

/**
 * Check if a role is a customer role
 */
export const isCustomer = (role: string): boolean => {
  return role === 'user';
};

/**
 * Check if user has a specific role or higher in the hierarchy
 * 
 * @param userRole - The user's current role
 * @param requiredRole - The minimum role required
 * @returns true if userRole >= requiredRole in hierarchy
 * 
 * @example
 * hasPermission('admin', 'manager') // true
 * hasPermission('staff', 'manager') // false
 * hasPermission('manager', 'manager') // true
 */
export const hasPermission = (
  userRole: string,
  requiredRole: UserRole
): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole as UserRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
};

/**
 * Check if user can manage menu (categories and food items)
 * Only Admin and Manager can manage menu
 */
export const canManageMenu = (role: string): boolean => {
  return role === 'admin' || role === 'manager';
};

/**
 * Check if user can manage orders
 * Admin, Manager, and Staff can manage orders
 */
export const canManageOrders = (role: string): boolean => {
  return ['admin', 'manager', 'staff'].includes(role);
};

/**
 * Check if user can update order status
 * Admin, Manager, and Staff can update order status
 */
export const canUpdateOrderStatus = (role: string): boolean => {
  return ['admin', 'manager', 'staff'].includes(role);
};

/**
 * Check if user can manage users/profiles
 * Only Admin can manage users
 */
export const canManageUsers = (role: string): boolean => {
  return role === 'admin';
};

/**
 * Check if user can view all orders
 * Admin, Manager, and Staff can view all orders
 */
export const canViewAllOrders = (role: string): boolean => {
  return ['admin', 'manager', 'staff'].includes(role);
};

/**
 * Check if user can view payments
 * Only Admin and Manager can view payments (for reports/analytics)
 */
export const canViewPayments = (role: string): boolean => {
  return role === 'admin' || role === 'manager';
};

/**
 * Check if user can manage payments (refunds, cancellations)
 * Only Admin can manage payments (prevents Manager from deleting historical data)
 */
export const canManagePayments = (role: string): boolean => {
  return role === 'admin';
};

/**
 * Check if user can update order fields beyond status
 * Staff can ONLY update status field
 * Manager and Admin can update any order field
 */
export const canUpdateOrderFields = (role: string): boolean => {
  return role === 'admin' || role === 'manager';
};

/**
 * Check if user can only update order status (Staff restriction)
 * Returns true if user is Staff (who can only update status)
 */
export const canOnlyUpdateStatus = (role: string): boolean => {
  return role === 'staff';
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: string): string => {
  const displayNames: Record<string, string> = {
    user: 'Customer',
    admin: 'Administrator',
    manager: 'Manager',
    staff: 'Staff',
  };
  return displayNames[role] || role;
};

/**
 * Get role color (for UI display)
 */
export const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    user: '#3b82f6',      // Blue
    admin: '#ef4444',     // Red
    manager: '#f59e0b',   // Orange/Amber
    staff: '#10b981',     // Green
  };
  return colors[role] || '#6b7280'; // Gray as default
};
