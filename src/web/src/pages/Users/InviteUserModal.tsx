import { getRoleDisplayName } from '../../utils/roleHelpers';
import type { UserRole } from '../../utils/roleHelpers';
import { ROLES } from './types';

interface InviteUserModalProps {
  email: string;
  onEmailChange: (value: string) => void;
  inviteRole: UserRole;
  onInviteRoleChange: (role: UserRole) => void;
  onClose: () => void;
  onInvite: () => void;
  inviting: boolean;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  email,
  onEmailChange,
  inviteRole,
  onInviteRoleChange,
  onClose,
  onInvite,
  inviting,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-overlay)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-user-title"
    >
      <div className="bg-bg-surface rounded-lg border border-border shadow-lg max-w-md w-full p-6">
        <h2 id="invite-user-title" className="heading text-text-primary mb-4">
          Invite user
        </h2>
        <label htmlFor="invite-email" className="block label text-text-primary mb-2">
          Email address
        </label>
        <input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="colleague@example.com"
          className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary mb-4 bg-bg-surface text-text-primary"
        />
        <label htmlFor="invite-role-select" className="block label text-text-primary mb-2">
          Role
        </label>
        <select
          id="invite-role-select"
          value={inviteRole}
          onChange={(e) => onInviteRoleChange(e.target.value as UserRole)}
          className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary mb-6 bg-bg-surface text-text-primary"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {getRoleDisplayName(role)}
            </option>
          ))}
        </select>
        <p className="body-sm text-text-secondary mb-4">
          They will receive an email to set their password and sign in.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 body-sm font-medium text-text-primary bg-secondary border border-border rounded-md hover:opacity-90 transition-opacity"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onInvite}
            disabled={inviting}
            className="px-4 py-2 button text-white bg-primary hover:opacity-90 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {inviting ? 'Sending...' : 'Send invite'}
          </button>
        </div>
      </div>
    </div>
  );
};
