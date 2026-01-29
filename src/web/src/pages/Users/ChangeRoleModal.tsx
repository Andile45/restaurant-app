import { getRoleDisplayName } from '../../utils/roleHelpers';
import type { ProfileRow } from './types';
import type { UserRole } from '../../utils/roleHelpers';
import { ROLES } from './types';

interface ChangeRoleModalProps {
  profile: ProfileRow;
  newRole: UserRole;
  onNewRoleChange: (role: UserRole) => void;
  onClose: () => void;
  onSave: () => void;
  updating: boolean;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  profile,
  newRole,
  onNewRoleChange,
  onClose,
  onSave,
  updating,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-overlay)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-role-title"
    >
      <div className="bg-bg-surface rounded-lg border border-border shadow-lg max-w-md w-full p-6">
        <h2 id="change-role-title" className="heading text-text-primary mb-2">
          Change role
        </h2>
        <p className="body-sm text-text-secondary mb-4">
          {profile.name} {profile.surname} ({profile.email})
        </p>
        <label htmlFor="new-role-select" className="block label text-text-primary mb-2">
          New role
        </label>
        <select
          id="new-role-select"
          value={newRole}
          onChange={(e) => onNewRoleChange(e.target.value as UserRole)}
          className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary mb-6 bg-bg-surface text-text-primary"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {getRoleDisplayName(role)}
            </option>
          ))}
        </select>
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
            onClick={onSave}
            disabled={updating || profile.role === newRole}
            className="px-4 py-2 button text-white bg-primary hover:opacity-90 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
