import { useState, useEffect } from 'react';
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
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

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
      const { error } = await supabase
        .from('food_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id);
      if (error) throw error;
      fetchItems();
    } catch (err: unknown) {
      alert(getErrorMessageForUser(err, 'Availability could not be updated. Please try again.'));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category_id || !formData.price) {
      alert('Please fill in name, category, and price.');
      return;
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price (a positive number).');
      return;
    }
    try {
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
      fetchItems();
    } catch (err: unknown) {
      alert(getErrorMessageForUser(err, 'Item could not be saved. Please try again.'));
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
  };
}
