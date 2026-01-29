import { HiOutlinePlus, HiOutlinePencil, HiOutlineSearch, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import type { FoodItem } from '../../../types';
import type { Category } from '../../../types';

function getCategoryName(categories: Category[], categoryId: string) {
  return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
}

interface ItemsTableProps {
  items: FoodItem[];
  categories: Category[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  onAdd: () => void;
  onEdit: (item: FoodItem) => void;
  onToggleAvailability: (item: FoodItem) => void;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  categories,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onAdd,
  onEdit,
  onToggleAvailability,
}) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <h1 className="heading-lg text-text-primary">Menu &gt; Items</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 button text-white bg-primary hover:opacity-90 rounded-md transition-opacity"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-bg-surface"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Item</th>
              <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Category</th>
              <th className="px-6 py-3 text-right body-sm font-semibold text-text-primary">Price</th>
              <th className="px-6 py-3 text-center body-sm font-semibold text-text-primary">Status</th>
              <th className="px-6 py-3 text-right body-sm font-semibold text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center body text-text-secondary">
                  {searchQuery ? 'No items found matching your search.' : 'No items found. Add your first item!'}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-secondary transition-colors">
                  <td className="px-6 py-4">
                    <div className="body text-text-primary font-medium">{item.name}</div>
                    {item.description && (
                      <div className="body-sm text-text-secondary mt-1">{item.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 body-sm text-text-secondary">
                    {getCategoryName(categories, item.category_id)}
                  </td>
                  <td className="px-6 py-4 text-right body font-semibold text-text-primary">
                    R {parseFloat(item.price.toString()).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onToggleAvailability(item)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full body-sm font-medium transition-colors ${
                        item.is_available
                          ? 'bg-green-50 text-status-success hover:bg-green-100'
                          : 'bg-red-50 text-status-error hover:bg-red-100'
                      }`}
                    >
                      {item.is_available ? (
                        <>
                          <HiOutlineCheckCircle className="w-4 h-4" />
                          In Stock
                        </>
                      ) : (
                        <>
                          <HiOutlineXCircle className="w-4 h-4" />
                          Sold Out
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-primary hover:bg-primary-light rounded-md transition-colors"
                        title="Edit"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
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
