import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FoodItem } from '../../../common/types/foodItem';

interface CartItem extends FoodItem {
  quantity: number;
  extras?: {
    add_ons?: string[];
    remove?: string[];
    sides?: string[];
    drinks?: string[];
  };
}

interface CartState {
  items: CartItem[];
  total: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ foodItem: FoodItem; quantity?: number; extras?: CartItem['extras'] }>) => {
      const { foodItem, quantity = 1, extras } = action.payload;
      
      const existingItemIndex = state.items.findIndex(
        item => item.id === foodItem.id && 
        JSON.stringify(item.extras) === JSON.stringify(extras)
      );

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // New item
        state.items.push({
          ...foodItem,
          quantity,
          extras: extras || {},
        });
      }

      // Recalculate total
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item.id !== itemId);
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    updateQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== itemId);
        } else {
          item.quantity = quantity;
        }
        state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
    },
    updateItemExtras: (state, action: PayloadAction<{ itemId: string; extras: CartItem['extras'] }>) => {
      const { itemId, extras } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      
      if (item) {
        item.extras = extras;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, updateItemExtras, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
