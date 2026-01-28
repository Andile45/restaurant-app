import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useAppSelector } from '../../store/hooks';
import { HiOutlineEye } from 'react-icons/hi';
import { Order } from '../../types';
import { canUpdateOrderStatus } from '../../utils/roleHelpers';
import { OrderDetailModal } from './OrderDetailModal';

// Extend Order type to include all possible statuses
type ExtendedOrder = Omit<Order, 'status'> & {
  status: 'pending' | 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
};

type OrderStatus = 'all' | 'pending' | 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export const Orders: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        // Handle 'pending' filter to include both 'pending' and 'new' statuses
        if (selectedStatus === 'pending') {
          query = query.in('status', ['pending', 'new']);
        } else {
          query = query.eq('status', selectedStatus);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-50 text-status-success';
      case 'preparing':
        return 'bg-yellow-50 text-status-warning';
      case 'ready':
        return 'bg-blue-50 text-status-info';
      case 'pending':
      case 'new':
        return 'bg-primary-light text-primary';
      case 'cancelled':
        return 'bg-red-50 text-status-error';
      default:
        return 'bg-secondary text-text-secondary';
    }
  };

  const getStatusActions = (order: ExtendedOrder) => {
    const status = order.status.toLowerCase();
    const actions = [];

    if (status === 'pending' || status === 'new') {
      if (canUpdateOrderStatus(user?.role || '')) {
        actions.push({
          label: 'Accept',
          action: () => handleUpdateStatus(order.id, 'preparing'),
          color: 'text-status-success',
        });
      }
    }

    if (status === 'preparing') {
      if (canUpdateOrderStatus(user?.role || '')) {
        actions.push({
          label: 'Mark Ready',
          action: () => handleUpdateStatus(order.id, 'ready'),
          color: 'text-status-info',
        });
      }
    }

    if (status === 'ready') {
      if (canUpdateOrderStatus(user?.role || '')) {
        actions.push({
          label: 'Complete',
          action: () => handleUpdateStatus(order.id, 'completed'),
          color: 'text-status-success',
        });
      }
    }

    if ((status === 'pending' || status === 'new' || status === 'preparing') && (user?.role === 'admin' || user?.role === 'manager')) {
      actions.push({
        label: 'Cancel',
        action: () => {
          if (window.confirm('Are you sure you want to cancel this order?')) {
            handleUpdateStatus(order.id, 'cancelled');
          }
        },
        color: 'text-status-error',
      });
    }

    return actions;
  };

  const formatOrderNumber = (_id: string, index: number) => {
    return `#${String(1245 + orders.length - index - 1).padStart(4, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`;
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

      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'pending', 'preparing', 'ready', 'completed'] as OrderStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 body-sm font-medium rounded-md transition-colors ${
              selectedStatus === status
                ? 'bg-primary text-white'
                : 'bg-bg-surface text-text-primary border border-border hover:bg-secondary'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Order #</th>
              <th className="px-6 py-3 text-right body-sm font-semibold text-text-primary">Total</th>
              <th className="px-6 py-3 text-center body-sm font-semibold text-text-primary">Status</th>
              <th className="px-6 py-3 text-right body-sm font-semibold text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center body text-text-secondary">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order, index) => {
                const actions = getStatusActions(order);
                return (
                  <tr key={order.id} className="hover:bg-secondary transition-colors">
                    <td className="px-6 py-4 body text-text-primary font-medium">
                      {formatOrderNumber(order.id, index)}
                    </td>
                    <td className="px-6 py-4 text-right body font-semibold text-text-primary">
                      {formatCurrency(parseFloat(order.total.toString()))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full body-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-2 text-primary hover:bg-primary-light rounded-md transition-colors"
                          title="View"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </button>
                        {actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={action.action}
                            className={`px-3 py-1 body-sm font-medium rounded-md transition-colors ${action.color} hover:opacity-80`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={handleUpdateStatus}
          userRole={user?.role || 'user'}
        />
      )}
    </div>
  );
};
