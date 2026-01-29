import type { FoodItem } from '../../../types';
import type { Category } from '../../../types';
import type { ItemFormData } from './useMenuItems';

interface ItemFormModalProps {
  editingItem: FoodItem | null;
  formData: ItemFormData;
  onFormDataChange: (data: ItemFormData) => void;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  editingItem,
  formData,
  onFormDataChange,
  categories,
  onClose,
  onSave,
}) => {
  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="heading text-text-primary mb-4">
          {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block label text-text-primary mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Item name"
            />
          </div>
          <div>
            <label className="block label text-text-primary mb-2">Category *</label>
            <select
              value={formData.category_id}
              onChange={(e) => onFormDataChange({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-bg-surface"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block label text-text-primary mb-2">Price (R) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => onFormDataChange({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block label text-text-primary mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Item description (optional)"
            />
          </div>
          <div>
            <label className="block label text-text-primary mb-2">Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => onFormDataChange({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://example.com/image.jpg (optional)"
            />
            {formData.image_url.trim() && (
              <div className="mt-2">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="h-24 w-24 object-cover rounded border border-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => onFormDataChange({ ...formData, is_available: e.target.checked })}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <span className="label text-text-primary">In Stock</span>
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 body-sm text-text-secondary hover:bg-secondary rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 button-sm text-white bg-primary hover:opacity-90 rounded-md transition-opacity"
            >
              {editingItem ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
