import type { Category } from '../../../types';

interface CategoryModalProps {
  editingCategory: Category | null;
  categoryName: string;
  onCategoryNameChange: (name: string) => void;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  editingCategory,
  categoryName,
  onCategoryNameChange,
  onClose,
  onSave,
  saving = false,
}) => {
  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
      <div className="bg-bg-surface rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="heading text-text-primary mb-4">
          {editingCategory ? 'Edit Category' : 'Add Category'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block label text-text-primary mb-2">Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => onCategoryNameChange(e.target.value)}
              className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Category name"
              autoFocus
              disabled={saving}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 body-sm text-text-secondary hover:bg-secondary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 button-sm text-white bg-primary hover:opacity-90 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
