import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineSearch, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import { FoodItem } from '../../types';
import { Category } from '../../types';

export const Items: React.FC = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    is_available: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('food_items')
        .select('*')
        .order('name', { ascending: true });

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      price: '',
      description: '',
      is_available: true,
    });
    setShowAddModal(true);
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category_id: item.category_id,
      price: item.price.toString(),
      description: item.description || '',
      is_available: item.is_available,
    });
    setShowAddModal(true);
  };

  const handleToggleAvailability = async (item: FoodItem) => {
    try {
      const { error } = await supabase
        .from('food_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id);

      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category_id || !formData.price) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        alert('Please enter a valid price.');
        return;
      }

      if (editingItem) {
        // Update
        const { error } = await supabase
          .from('food_items')
          .update({
            name: formData.name.trim(),
            category_id: formData.category_id,
            price: price,
            description: formData.description.trim() || null,
            is_available: formData.is_available,
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('food_items')
          .insert([
            {
              name: formData.name.trim(),
              category_id: formData.category_id,
              price: price,
              description: formData.description.trim() || null,
              is_available: formData.is_available,
            },
          ]);

        if (error) throw error;
      }

      setShowAddModal(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item. Please try again.');
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  if (loading && items.length === 0) {
    return (
      <div className="p-8">
        <div className="heading text-text-primary mb-6">Menu &gt; Items</div>
        <div className="body text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <h1 className="heading-lg text-text-primary">Menu &gt; Items</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 button text-white bg-primary hover:opacity-90 rounded-md transition-opacity"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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

      {/* Items Table */}
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
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center body text-text-secondary">
                  {searchQuery ? 'No items found matching your search.' : 'No items found. Add your first item!'}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-secondary transition-colors">
                  <td className="px-6 py-4">
                    <div className="body text-text-primary font-medium">{item.name}</div>
                    {item.description && (
                      <div className="body-sm text-text-secondary mt-1">{item.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 body-sm text-text-secondary">
                    {getCategoryName(item.category_id)}
                  </td>
                  <td className="px-6 py-4 text-right body font-semibold text-text-primary">
                    R {parseFloat(item.price.toString()).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleAvailability(item)}
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
                        onClick={() => handleEdit(item)}
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

      {/* Add/Edit Modal */}
      {showAddModal && (
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Item name"
                />
              </div>
              <div>
                <label className="block label text-text-primary mb-2">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block label text-text-primary mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Item description (optional)"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <span className="label text-text-primary">In Stock</span>
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 body-sm text-text-secondary hover:bg-secondary rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 button-sm text-white bg-primary hover:opacity-90 rounded-md transition-opacity"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
