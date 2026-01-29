import { HiOutlineEye } from 'react-icons/hi';
import { OrderDetailModal } from './OrderDetailModal';
import type { ExtendedOrder, OrderStatus } from './ordersHelpers';
import { getStatusColor, getStatusActions, formatOrderNumber, formatCurrency } from './ordersHelpers';

interface OrdersTableProps {
  orders: ExtendedOrder[];
  selectedStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onViewOrder: (order: ExtendedOrder) => void;
  selectedOrder: ExtendedOrder | null;
  showDetailModal: boolean;
  onCloseDetailModal: () => void;
  userRole: string;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  selectedStatus,
  onStatusChange,
  onUpdateStatus,
  onViewOrder,
  selectedOrder,
  showDetailModal,
  onCloseDetailModal,
  userRole,
}) => {
  return (
    <>
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'pending', 'preparing', 'ready', 'completed'] as OrderStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
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
                const actions = getStatusActions(order, userRole, onUpdateStatus);
                return (
                  <tr key={order.id} className="hover:bg-secondary transition-colors">
                    <td className="px-6 py-4 body text-text-primary font-medium">
                      {formatOrderNumber(order, orders.length, index)}
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
                          onClick={() => onViewOrder(order)}
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

      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={onCloseDetailModal}
          onStatusUpdate={onUpdateStatus}
          userRole={userRole}
        />
      )}
    </>
  );
};
