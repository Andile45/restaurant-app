import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineMenu } from 'react-icons/hi';
import type { Category } from '../../../types';

interface CategoriesTableProps {
  categories: Category[];
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-lg text-text-primary">Menu &gt; Categories</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 button text-white bg-primary hover:opacity-90 rounded-md transition-opacity"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <div className="bg-bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">
                <HiOutlineMenu className="inline w-4 h-4 mr-2" />
                Category
              </th>
              <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Status</th>
              <th className="px-6 py-3 text-right body-sm font-semibold text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center body text-text-secondary">
                  No categories found. Add your first category!
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-secondary transition-colors">
                  <td className="px-6 py-4 body text-text-primary">{category.name}</td>
                  <td className="px-6 py-4">
                    <span className="body-sm text-status-success font-medium">Active</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(category)}
                        className="p-2 text-primary hover:bg-primary-light rounded-md transition-colors"
                        title="Edit"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(category.id)}
                        className="p-2 text-status-error hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
