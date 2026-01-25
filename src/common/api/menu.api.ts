import { supabase } from './supabaseClient.js';
import type { Category } from '../types/category.js';
import type { FoodItem } from '../types/foodItem.js';

export const fetchCategories = async (): Promise<{ data: Category[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  return { data, error };
};

export const fetchFoodItems = async (): Promise<{ data: FoodItem[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .eq('is_available', true)
    .order('name', { ascending: true });

  return { data, error };
};

export const fetchFoodItemsByCategory = async (
  categoryId: string
): Promise<{ data: FoodItem[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_available', true)
    .order('name', { ascending: true });

  return { data, error };
};
