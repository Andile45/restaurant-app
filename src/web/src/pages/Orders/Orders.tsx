import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useAppSelector } from '../../store/hooks';
import { getErrorMessageForUser } from '../../utils/errorUtils';
import type { ExtendedOrder, OrderStatus } from './ordersHelpers';
import { OrdersTable } from './OrdersTable';

export const Orders: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setErrorMessage(null);
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        if (selectedStatus === 'pending') {
          query = query.in('status', ['pending', 'new']);
        } else {
          query = query.eq('status', selectedStatus);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (err: unknown) {
      setOrders([]);
      const message = getErrorMessageForUser(err, '');
      setErrorMessage(message || null);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  // Supabase realtime: update CMS instantly on new orders/status changes.
  useEffect(() => {
    if (!user?.role) return;

    const channel = supabase
      .channel('cms-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Refetch so the selectedStatus filter always stays correct.
          fetchOrders().catch(() => {
            // Intentionally do not replace UI with a generic message here;
            // fetchOrders already has detailed error extraction.
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.role, fetchOrders]);

  const handleViewOrder = (order: ExtendedOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setErrorMessage(null);
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as ExtendedOrder['status'] });
      }
    } catch (err: unknown) {
      const message = getErrorMessageForUser(err, '');
      setErrorMessage(message || null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="heading text-text-primary mb-6">Orders</div>
        <div className="body text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="heading-lg text-text-primary mb-6">Orders</h1>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 body text-sm">
          {errorMessage}
        </div>
      )}

      <OrdersTable
        orders={orders}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onUpdateStatus={handleUpdateStatus}
        onViewOrder={handleViewOrder}
        selectedOrder={selectedOrder}
        showDetailModal={showDetailModal}
        onCloseDetailModal={() => {
          setShowDetailModal(false);
          setSelectedOrder(null);
        }}
        userRole={user?.role || 'user'}
      />
    </div>
  );
};
