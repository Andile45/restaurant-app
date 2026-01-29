import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useAppSelector } from '../../store/hooks';
import { getErrorMessageForUser } from '../../utils/errorUtils';
import type { ExtendedOrder, OrderStatus } from './ordersHelpers';
import { OrdersTable } from './OrdersTable';

export const Orders: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchOrders = async () => {
    try {
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
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleViewOrder = (order: ExtendedOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
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
      alert(getErrorMessageForUser(err, 'Order status could not be updated. Please try again.'));
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
