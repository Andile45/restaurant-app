import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../api/supabaseClient';
import type { Payment } from '../../../common/types/payment';

interface PaymentState {
  isLoading: boolean;
  error: string | null;
  currentPayment: Payment | null;
}

const initialState: PaymentState = {
  isLoading: false,
  error: null,
  currentPayment: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentPayment: (state, action: PayloadAction<Payment | null>) => {
      state.currentPayment = action.payload;
    },
    clearPayment: (state) => {
      state.currentPayment = null;
      state.error = null;
    },
  },
});

export const { setLoading, setError, setCurrentPayment, clearPayment } = paymentSlice.actions;

/**
 * Create a payment record in the database
 */
export const createPayment = (
  orderId: string,
  amount: number,
  transactionId: string,
  cardLast4?: string,
  method: Payment['method'] = 'card',
  provider: string = 'paystack'
) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        amount,
        transaction_id: transactionId,
        card_last4: cardLast4 || null,
        payment_status: 'completed',
        method,
        provider,
        currency: 'ZAR',
      })
      .select()
      .single();

    if (error) throw error;

    if (data) {
      dispatch(setCurrentPayment(data as Payment));
      return data;
    }
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to create payment record'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = (
  paymentId: string,
  status: Payment['payment_status']
) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const { data, error } = await supabase
      .from('payments')
      .update({ payment_status: status })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      dispatch(setCurrentPayment(data as Payment));
      return data;
    }
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to update payment status'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export default paymentSlice.reducer;
