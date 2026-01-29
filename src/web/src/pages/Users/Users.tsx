import { HiOutlineRefresh, HiOutlineSearch, HiOutlineUserAdd } from 'react-icons/hi';
import { getRoleDisplayName } from '../../utils/roleHelpers';
import { useUsers } from './useUsers';
import { UsersTable } from './UsersTable';
import { ChangeRoleModal } from './ChangeRoleModal';
import { InviteUserModal } from './InviteUserModal';
import { ROLES } from './types';
import type { RoleFilter } from './types';

export const Users: React.FC = () => {
  const {
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
  } = useUsers();

  if (loading) {
    return (
      <div className="p-8">
        <div className="heading text-text-primary mb-6">Users</div>
        <div className="body text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <h1 className="heading-lg text-text-primary">User Management</h1>
        <div className="flex items-center gap-2">
          {canChangeRoles && (
            <button
              type="button"
              onClick={handleOpenInvite}
              className="flex items-center gap-2 px-4 py-2 button text-white bg-primary hover:opacity-90 rounded-md transition-opacity"
            >
              <HiOutlineUserAdd className="w-4 h-4" />
              Invite user
            </button>
          )}
          <button
            type="button"
            onClick={fetchProfiles}
            className="flex items-center gap-2 px-4 py-2 body-sm font-medium text-text-primary bg-bg-surface border border-border rounded-md hover:bg-secondary transition-colors"
          >
            <HiOutlineRefresh className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 body-sm text-status-error bg-errorLight border border-status-error rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-bg-surface text-text-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', ...ROLES] as RoleFilter[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 body-sm font-medium rounded-md transition-colors ${
                roleFilter === role
                  ? 'bg-primary text-white'
                  : 'bg-bg-surface text-text-primary border border-border hover:bg-secondary'
              }`}
            >
              {role === 'all' ? 'All' : getRoleDisplayName(role)}
            </button>
          ))}
        </div>
      </div>

      <UsersTable
        filteredProfiles={filteredProfiles}
        canChangeRoles={!!canChangeRoles}
        onOpenChangeRole={handleOpenChangeRole}
      />

      {changeRoleTarget && (
        <ChangeRoleModal
          profile={changeRoleTarget}
          newRole={newRole}
          onNewRoleChange={setNewRole}
          onClose={handleCloseChangeRole}
          onSave={handleUpdateRole}
          updating={updating}
        />
      )}

      {showInviteModal && (
        <InviteUserModal
          email={inviteEmail}
          onEmailChange={setInviteEmail}
          inviteRole={inviteRole}
          onInviteRoleChange={setInviteRole}
          onClose={handleCloseInvite}
          onInvite={handleInviteUser}
          inviting={inviting}
        />
      )}
    </div>
  );
};
