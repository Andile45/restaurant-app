import { supabase } from './supabaseClient';
import type { Category } from '../../common/types/category';
import type { FoodItem } from '../../common/types/foodItem';

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
