import { useState, useEffect } from 'react';
import { supabase } from '../../../api/supabaseClient';
import { getErrorMessageForUser } from '../../../utils/errorUtils';
import type { Category } from '../../../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
        const { error } = await supabase
          .from('categories')
          .update({ name: categoryName.trim() })
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ name: categoryName.trim() }]);
        if (error) throw error;
      }
      setShowAddModal(false);
      setCategoryName('');
      setEditingCategory(null);
      fetchCategories();
    } catch (err: unknown) {
      alert(getErrorMessageForUser(err, 'Category could not be saved. Please try again.'));
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
    } catch (err: unknown) {
      alert(getErrorMessageForUser(err, 'Category could not be deleted. Please try again.'));
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setCategoryName('');
    setEditingCategory(null);
  };

  return {
    categories,
    loading,
    showAddModal,
    editingCategory,
    categoryName,
    setCategoryName,
    handleAdd,
    handleEdit,
    handleSave,
    handleDelete,
    closeModal,
  };
}
