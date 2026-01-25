import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '../../../common/types/order';
import { supabase } from '../../api/supabaseClient';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
      }
      if (state.currentOrder?.id === orderId) {
        state.currentOrder.status = status;
      }
    },
  },
});

export const { setLoading, setError, setOrders, addOrder, setCurrentOrder, updateOrderStatus } = orderSlice.actions;

// Async thunks
export const fetchUserOrders = (userId: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          food_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data) {
      dispatch(setOrders(data as Order[]));
    }
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to fetch orders'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const createOrder = (
  userId: string,
  items: Array<{ food_id: string; quantity: number; extras?: any; price?: number }>,
  total: number,
  address?: string
) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Fetch food items to get current prices if not provided
    const foodIds = items.map(item => item.food_id);
    const { data: foodItems, error: foodError } = await supabase
      .from('food_items')
      .select('id, price')
      .in('id', foodIds);

    if (foodError) throw foodError;

    // Create a map of food_id to price
    const priceMap = new Map(
      foodItems?.map(item => [item.id, Number(item.price)]) || []
    );

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total,
        address: address || null,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items with price_at_purchase
    const orderItems = items.map(item => {
      const price = item.price ?? priceMap.get(item.food_id) ?? 0;
      return {
        order_id: order.id,
        food_id: item.food_id,
        quantity: item.quantity,
        price_at_purchase: price,
        extras: item.extras || {},
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Fetch complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          food_id
        )
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) throw fetchError;

    if (completeOrder) {
      dispatch(addOrder(completeOrder as Order));
      dispatch(setCurrentOrder(completeOrder as Order));
    }

    return completeOrder;
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to create order'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export default orderSlice.reducer;
