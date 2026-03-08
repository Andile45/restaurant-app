import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useAppSelector } from '../../store/hooks';
import { getErrorMessageForUser } from '../../utils/errorUtils';
import { canManageUsers } from '../../utils/roleHelpers';
import type { ProfileRow, RoleFilter } from './types';
import type { UserRole } from '../../utils/roleHelpers';

export function useUsers() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [changeRoleTarget, setChangeRoleTarget] = useState<ProfileRow | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('user');
  const [inviting, setInviting] = useState(false);

  const canChangeRoles = currentUser && canManageUsers(currentUser.role);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, auth_uid, name, surname, email, contact_number, address, role, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProfiles((data as ProfileRow[]) || []);
    } catch (err: unknown) {
      setError(getErrorMessageForUser(err, 'User list could not be loaded. Please try again.'));
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const roleFilteredProfiles =
    roleFilter === 'all' ? profiles : profiles.filter((p) => p.role === roleFilter);

  const searchLower = searchQuery.trim().toLowerCase();
  const filteredProfiles = searchLower
    ? roleFilteredProfiles.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.surname.toLowerCase().includes(searchLower) ||
          p.email.toLowerCase().includes(searchLower)
      )
    : roleFilteredProfiles;

  const handleOpenChangeRole = (profile: ProfileRow) => {
    setChangeRoleTarget(profile);
    setNewRole(profile.role as UserRole);
  };

  const handleCloseChangeRole = () => setChangeRoleTarget(null);

  const handleUpdateRole = async () => {
    if (!changeRoleTarget || !canChangeRoles) return;
    if (changeRoleTarget.role === newRole) {
      handleCloseChangeRole();
      return;
    }
    const isSelf = currentUser?.auth_id === changeRoleTarget.auth_uid;
    if (isSelf && newRole !== 'admin') {
      const confirmed = window.confirm(
        'You are changing your own role. You may lose access to this CMS. Continue?'
      );
      if (!confirmed) return;
    }
    try {
      setUpdating(true);
      setError(null);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', changeRoleTarget.id);
      if (updateError) throw updateError;
      await fetchProfiles();
      handleCloseChangeRole();
    } catch (err: unknown) {
      setError(getErrorMessageForUser(err, 'Role could not be updated. Please try again.'));
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenInvite = () => {
    setInviteEmail('');
    setInviteRole('user');
    setError(null);
    setShowInviteModal(true);
  };

  const handleCloseInvite = () => setShowInviteModal(false);

  const handleInviteUser = async () => {
    const email = inviteEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    let token = currentSession?.access_token;
    if (!token) {
      const { data: { session: refreshed } } = await supabase.auth.refreshSession();
      token = refreshed?.access_token;
    }
    if (!token) {
      setError('Your session may have expired. Please sign in again and try inviting the user.');
      return;
    }
    setInviting(true);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role: inviteRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          setError('Your session may have expired. Please sign in again and try inviting the user.');
          return;
        }
        if (res.status === 403) {
          setError('You do not have permission to invite users.');
          return;
        }
        throw new Error(data?.error || 'Invite failed');
      }
      await fetchProfiles();
      handleCloseInvite();
    } catch (err: unknown) {
      setError(getErrorMessageForUser(err, 'Invite could not be sent. Please try again.'));
    } finally {
      setInviting(false);
    }
  };

  return {
    loading,
    error,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
    filteredProfiles,
    canChangeRoles,
    fetchProfiles,
    handleOpenChangeRole,
    handleCloseChangeRole,
    changeRoleTarget,
    newRole,
    setNewRole,
    handleUpdateRole,
    updating,
    showInviteModal,
    handleOpenInvite,
    handleCloseInvite,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    handleInviteUser,
    inviting,
  };
}
