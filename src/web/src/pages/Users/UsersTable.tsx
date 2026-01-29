import { HiOutlinePencil } from 'react-icons/hi';
import { getRoleDisplayName, getRoleColor } from '../../utils/roleHelpers';
import type { ProfileRow } from './types';

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

interface UsersTableProps {
  filteredProfiles: ProfileRow[];
  canChangeRoles: boolean;
  onOpenChangeRole: (profile: ProfileRow) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  filteredProfiles,
  canChangeRoles,
  onOpenChangeRole,
}) => {
  return (
    <div className="bg-bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-secondary">
          <tr>
            <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Name</th>
            <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Email</th>
            <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Role</th>
            <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Joined</th>
            {canChangeRoles && (
              <th className="px-6 py-3 text-right body-sm font-semibold text-text-primary">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredProfiles.length === 0 ? (
            <tr>
              <td
                colSpan={canChangeRoles ? 5 : 4}
                className="px-6 py-8 text-center body text-text-secondary"
              >
                No users found.
              </td>
            </tr>
          ) : (
            filteredProfiles.map((profile) => (
              <tr key={profile.id} className="hover:bg-secondary transition-colors">
                <td className="px-6 py-4 body text-text-primary font-medium">
                  {profile.name} {profile.surname}
                </td>
                <td className="px-6 py-4 body-sm text-text-secondary">{profile.email}</td>
                <td className="px-6 py-4">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full body-sm font-medium"
                    style={{
                      backgroundColor: `${getRoleColor(profile.role)}20`,
                      color: getRoleColor(profile.role),
                    }}
                  >
                    {getRoleDisplayName(profile.role)}
                  </span>
                </td>
                <td className="px-6 py-4 body-sm text-text-secondary">
                  {formatDate(profile.created_at)}
                </td>
                {canChangeRoles && (
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => onOpenChangeRole(profile)}
                        className="p-2 text-primary hover:bg-primary-light rounded-md transition-colors"
                        title="Change role"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
