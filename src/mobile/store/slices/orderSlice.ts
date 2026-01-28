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

/**
 * Verify order before payment
 * Checks if order exists, belongs to user, is pending, and amount matches
 */
export const verifyOrderForPayment = (
  orderId: string,
  userId: string,
  expectedAmount: number
) => async (dispatch: any) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, user_id, total, status')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Order not found');
    }

    if (data.user_id !== userId) {
      throw new Error('Order does not belong to current user');
    }

    // Verify order is pending
    if (data.status !== 'pending') {
      throw new Error(`Order is already ${data.status}`);
    }

    const orderAmount = Number(data.total);
    const amountDifference = Math.abs(orderAmount - expectedAmount);
    if (amountDifference > 0.01) {
      throw new Error(`Order amount mismatch. Expected ${expectedAmount}, got ${orderAmount}`);
    }

    // Check if order already has a completed payment
    const { data: existingPayments, error: paymentCheckError } = await supabase
      .from('payments')
      .select('id')
      .eq('order_id', orderId)
      .eq('payment_status', 'completed')
      .limit(1);

    if (paymentCheckError && paymentCheckError.code !== 'PGRST116') {
      throw paymentCheckError;
    }

    if (existingPayments && existingPayments.length > 0) {
      throw new Error('Order has already been paid');
    }

    return data;
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to verify order'));
    throw error;
  }
};

/**
 * Update order status in database
 */
export const updateOrderStatusInDb = (
  orderId: string,
  status: Order['status']
) => async (dispatch: any) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;

    dispatch(updateOrderStatus({ orderId, status }));
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to update order status'));
    throw error;
  }
};

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

/**
 * Fetch order by ID with food item details
 */
export const fetchOrderById = (orderId: string, userId: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          food_id
        )
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError) throw orderError;

    if (!order) {
      throw new Error('Order not found');
    }

    const foodIds = order.order_items?.map((item: any) => item.food_id) || [];
    if (foodIds.length > 0) {
      const { data: foodItems, error: foodError } = await supabase
        .from('food_items')
        .select('id, name, description, price, image_url')
        .in('id', foodIds);

      if (foodError) throw foodError;

      const foodMap = new Map(foodItems?.map((item: any) => [item.id, item]) || []);
      order.order_items = order.order_items?.map((item: any) => ({
        ...item,
        food_item: foodMap.get(item.food_id),
      })) || [];
    }

    dispatch(setCurrentOrder(order as Order));
    return order as Order;
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to fetch order'));
    throw error;
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

    if (items.some(item => item.price !== undefined)) {
      const priceMismatches = items.filter(item => {
        if (item.price === undefined) return false;
        const currentPrice = priceMap.get(item.food_id);
        const cartPrice = item.price;
        return currentPrice && Math.abs(currentPrice - cartPrice) > 0.01;
      });

      if (priceMismatches.length > 0) {
        throw new Error('Item prices have changed. Please refresh your cart.');
      }
    }

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

    const orderItems = items.map(item => {
      return {
        order_id: order.id,
        food_id: item.food_id,
        quantity: item.quantity,
        extras: item.extras || {},
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

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
