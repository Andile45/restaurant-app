import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';

export type PaymentRow = {
  id: string;
  order_id: string;
  amount: number;
  payment_status: string;
  method: string | null;
  provider: string | null;
  transaction_id: string | null;
  currency: string | null;
  created_at: string;
};

export type StatusFilter = 'all' | 'pending' | 'completed' | 'failed';

export function usePayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('payments')
        .select('id, order_id, amount, payment_status, method, provider, transaction_id, currency, created_at')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('payment_status', statusFilter);
      }
      if (dateFrom) {
        query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
      }
      if (dateTo) {
        query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPayments((data as PaymentRow[]) || []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, dateFrom, dateTo]);

  const goToOrder = (orderId: string) => {
    navigate('/orders', { state: { highlightOrderId: orderId } });
  };

  return {
    payments,
    loading,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    goToOrder,
  };
}

export function formatPaymentCurrency(amount: number, currency?: string | null): string {
  const code = currency || 'ZAR';
  return code === 'ZAR' ? `R ${Number(amount).toFixed(2)}` : `${code} ${Number(amount).toFixed(2)}`;
}

export function formatPaymentDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return dateStr;
  }
}

export function getPaymentStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-green-50 text-status-success';
    case 'pending': return 'bg-yellow-50 text-status-warning';
    case 'failed': return 'bg-red-50 text-status-error';
    default: return 'bg-secondary text-text-secondary';
  }
}
