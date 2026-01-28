import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineMenu } from 'react-icons/hi';
import { Category } from '../../types';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
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
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setShowAddModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) return;

    try {
      if (editingCategory) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update({ name: categoryName.trim() })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('categories')
          .insert([{ name: categoryName.trim() }]);

        if (error) throw error;
      }

      setShowAddModal(false);
      setCategoryName('');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This will also delete all items in this category.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="heading text-text-primary mb-6">Menu &gt; Categories</div>
        <div className="body text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-lg text-text-primary">Menu &gt; Categories</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 button text-white bg-primary hover:opacity-90 rounded-md transition-opacity"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Categories Table */}
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
                        onClick={() => handleEdit(category)}
                        className="p-2 text-primary hover:bg-primary-light rounded-md transition-colors"
                        title="Edit"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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

      {/* Add/Edit Modal */}
      {showAddModal && (
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
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Category name"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setCategoryName('');
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 body-sm text-text-secondary hover:bg-secondary rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 button-sm text-white bg-primary hover:opacity-90 rounded-md transition-opacity"
                >
                  {editingCategory ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
