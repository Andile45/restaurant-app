import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../api/supabaseClient';
import { getErrorMessageForUser } from '../../../utils/errorUtils';
import type { FoodItem } from '../../../types';
import type { Category } from '../../../types';

export type ItemFormData = {
  name: string;
  category_id: string;
  price: string;
  description: string;
  image_url: string;
  is_available: boolean;
};

const emptyForm: ItemFormData = {
  name: '',
  category_id: '',
  price: '',
  description: '',
  image_url: '',
  is_available: true,
};

export function useMenuItems() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchItems = useCallback(async () => {
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
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  // Supabase realtime: new/updated/deleted menu items + category changes.
  // This updates the CMS menu instantly without manual refresh.
  useEffect(() => {
    const channel = supabase
      .channel('cms-menu-items-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_items' },
        () => {
          fetchItems();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          fetchCategories();
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems, fetchCategories]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ ...emptyForm, category_id: categories[0]?.id || '' });
    setShowAddModal(true);
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category_id: item.category_id,
      price: item.price.toString(),
      description: item.description || '',
      image_url: item.image_url || '',
      is_available: item.is_available,
    });
    setShowAddModal(true);
  };

  const handleToggleAvailability = async (item: FoodItem) => {
    try {
      setErrorMessage(null);
      const { error } = await supabase
        .from('food_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id);
      if (error) throw error;
      fetchItems();
    } catch (err: unknown) {
      const message = getErrorMessageForUser(err, '');
      setErrorMessage(message || null);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category_id || !formData.price) {
      setErrorMessage('Please fill in name, category, and price.');
      return;
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setErrorMessage('Please enter a valid price (a positive number).');
      return;
    }
    setSaving(true);
    try {
      setErrorMessage(null);
      if (editingItem) {
        const { error } = await supabase
          .from('food_items')
          .update({
            name: formData.name.trim(),
            category_id: formData.category_id,
            price,
            description: formData.description.trim() || null,
            image_url: formData.image_url.trim() || null,
            is_available: formData.is_available,
          })
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('food_items')
          .insert([{
            name: formData.name.trim(),
            category_id: formData.category_id,
            price,
            description: formData.description.trim() || null,
            image_url: formData.image_url.trim() || null,
            is_available: formData.is_available,
          }]);
        if (error) throw error;
      }
      setShowAddModal(false);
      setEditingItem(null);
      fetchItems();
    } catch (err: unknown) {
      const message = getErrorMessageForUser(err, '');
      setErrorMessage(message || null);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
  };

  return {
    items: filteredItems,
    categories,
    loading,
    saving,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    showAddModal,
    editingItem,
    formData,
    setFormData,
    handleAdd,
    handleEdit,
    handleToggleAvailability,
    handleSave,
    closeModal,
    fetchItems,
    errorMessage,
    dismissError: () => setErrorMessage(null),
  };
}
