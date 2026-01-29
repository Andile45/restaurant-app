import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { HiOutlineX, HiOutlineCheckCircle } from 'react-icons/hi';
import { OrderItem } from '../../types';
import { FoodItem } from '../../types';
import { canUpdateOrderStatus } from '../../utils/roleHelpers';
import type { ExtendedOrder } from './ordersHelpers';

interface OrderDetailModalProps {
  order: ExtendedOrder;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  userRole: string;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onStatusUpdate,
  userRole,
}) => {
  const [orderItems, setOrderItems] = useState<(OrderItem & { food_item: FoodItem })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderItems();
  }, [order.id]);

  const fetchOrderItems = async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          food_items (*)
        `)
        .eq('order_id', order.id);

      if (error) throw error;
      setOrderItems(
        (data || []).map((item: any) => ({
          ...item,
          food_item: item.food_items,
        }))
      );
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`;
  };

  const getNextStatusAction = () => {
    const status = order.status.toLowerCase();
    if (status === 'pending' || status === 'new') {
      return { label: 'Accept Order', status: 'preparing' };
    }
    if (status === 'preparing') {
      return { label: 'Mark Ready', status: 'ready' };
    }
    if (status === 'ready') {
      return { label: 'Complete Order', status: 'completed' };
    }
    return null;
  };

  const nextAction = getNextStatusAction();
  const canCancel = (order.status === 'pending' || order.status === 'new' || order.status === 'preparing') && 
                    (userRole === 'admin' || userRole === 'manager');

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="heading text-text-primary">
            Order {order.order_number != null ? `#${String(order.order_number).padStart(4, '0')}` : order.id.slice(0, 8)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:bg-secondary rounded-md transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="heading-sm text-text-primary mb-4">Items</h3>
            {loading ? (
              <div className="body text-text-secondary">Loading items...</div>
            ) : orderItems.length === 0 ? (
              <div className="body text-text-secondary">No items found.</div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                    <div>
                      <div className="body text-text-primary font-medium">
                        {item.food_item?.name || 'Unknown Item'} x {item.quantity}
                      </div>
                      {item.food_item && (
                        <div className="body-sm text-text-secondary mt-1">
                          {formatCurrency(parseFloat(item.price_at_purchase?.toString() || item.food_item.price.toString()))} each
                        </div>
                      )}
                    </div>
                    <div className="body font-semibold text-text-primary">
                      {formatCurrency(parseFloat((item.price_at_purchase || item.food_item?.price || 0).toString()) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="heading-sm text-text-primary">Total</span>
              <span className="heading-lg text-text-primary">
                {formatCurrency(parseFloat(order.total.toString()))}
              </span>
            </div>
          </div>

          {order.address && (
            <div>
              <h3 className="heading-sm text-text-primary mb-2">Delivery Address</h3>
              <p className="body text-text-secondary">{order.address}</p>
            </div>
          )}

          {canUpdateOrderStatus(userRole) && (nextAction || canCancel) && (
            <div className="flex gap-3 pt-4 border-t border-border">
              {nextAction && (
                <button
                  onClick={() => {
                    onStatusUpdate(order.id, nextAction.status);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 button-sm text-white bg-primary hover:opacity-90 rounded-md transition-opacity"
                >
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  {nextAction.label}
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this order?')) {
                      onStatusUpdate(order.id, 'cancelled');
                      onClose();
                    }
                  }}
                  className="px-4 py-2 button-sm text-status-error border border-status-error hover:bg-red-50 rounded-md transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
