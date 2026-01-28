import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FoodItem } from '../../../common/types/foodItem';

export interface CartItem extends FoodItem {
  cartItemId: string;
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
        JSON.stringify(item.extras || {}) === JSON.stringify(extras || {})
      );

      if (existingItemIndex >= 0) {
        // Item already exists, increase quantity
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // New item - generate unique cart item ID for React keys
        const cartItemId = `${foodItem.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        state.items.push({
          ...foodItem,
          cartItemId,
          quantity,
          extras: extras || {},
        });
      }

      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const cartItemId = action.payload;
      state.items = state.items.filter(item => item.cartItemId !== cartItemId);
      state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    updateQuantity: (state, action: PayloadAction<{ cartItemId: string; quantity: number }>) => {
      const { cartItemId, quantity } = action.payload;
      const item = state.items.find(item => item.cartItemId === cartItemId);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.cartItemId !== cartItemId);
        } else {
          item.quantity = quantity;
        }
        state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
    },
    updateItemExtras: (state, action: PayloadAction<{ cartItemId: string; extras: CartItem['extras'] }>) => {
      const { cartItemId, extras } = action.payload;
      const item = state.items.find(item => item.cartItemId === cartItemId);
      
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
