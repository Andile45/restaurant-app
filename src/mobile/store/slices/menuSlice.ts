import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Category } from '../../../common/types/category';
import type { FoodItem } from '../../../common/types/foodItem';
import { fetchCategories, fetchFoodItems, fetchFoodItemsByCategory } from '../../api/menu.api';
import { AppDispatch } from '../index';

interface MenuState {
  categories: Category[];
  foodItems: FoodItem[];
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  categories: [],
  foodItems: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setFoodItems: (state, action: PayloadAction<FoodItem[]>) => {
      state.foodItems = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    clearMenu: (state) => {
      state.categories = [];
      state.foodItems = [];
      state.selectedCategory = null;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setCategories,
  setFoodItems,
  setSelectedCategory,
  clearMenu,
} = menuSlice.actions;

// Async thunks
export const loadCategories = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const { data, error } = await fetchCategories();

    if (error) throw error;

    if (data) {
      dispatch(setCategories(data));
    }
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to fetch categories'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const loadFoodItems = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const { data, error } = await fetchFoodItems();

    if (error) throw error;

    if (data) {
      dispatch(setFoodItems(data));
    }
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to fetch food items'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const loadFoodItemsByCategory = (categoryId: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(setSelectedCategory(categoryId));

    const { data, error } = await fetchFoodItemsByCategory(categoryId);

    if (error) throw error;

    if (data) {
      dispatch(setFoodItems(data));
    }
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to fetch food items by category'));
  } finally {
    dispatch(setLoading(false));
  }
};

export default menuSlice.reducer;
