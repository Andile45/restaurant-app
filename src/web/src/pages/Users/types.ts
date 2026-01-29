import type { UserRole } from '../../utils/roleHelpers';

export type ProfileRow = {
  id: string;
  auth_uid: string;
  name: string;
  surname: string;
  email: string;
  contact_number: string | null;
  address: string | null;
  role: string;
  created_at: string;
};

export const ROLES: UserRole[] = ['user', 'staff', 'manager', 'admin'];
export type RoleFilter = 'all' | UserRole;
