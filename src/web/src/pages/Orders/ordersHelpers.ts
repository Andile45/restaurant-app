import { Order } from '../../types';

export type ExtendedOrder = Omit<Order, 'status'> & {
  status: 'pending' | 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
};

export type OrderStatus = 'all' | 'pending' | 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed': return 'bg-green-50 text-status-success';
    case 'preparing': return 'bg-yellow-50 text-status-warning';
    case 'ready': return 'bg-blue-50 text-status-info';
    case 'pending':
    case 'new': return 'bg-primary-light text-primary';
    case 'cancelled': return 'bg-red-50 text-status-error';
    default: return 'bg-secondary text-text-secondary';
  }
}

export type StatusAction = { label: string; action: () => void; color: string };

export function getStatusActions(
  order: ExtendedOrder,
  userRole: string | undefined,
  onUpdateStatus: (orderId: string, newStatus: string) => void
): StatusAction[] {
  const status = order.status.toLowerCase();
  const actions: StatusAction[] = [];
  const canUpdate = ['admin', 'manager', 'staff'].includes(userRole || '');
  const canCancel = (userRole === 'admin' || userRole === 'manager');

  if ((status === 'pending' || status === 'new') && canUpdate) {
    actions.push({
      label: 'Accept',
      action: () => onUpdateStatus(order.id, 'preparing'),
      color: 'text-status-success',
    });
  }
  if (status === 'preparing' && canUpdate) {
    actions.push({
      label: 'Mark Ready',
      action: () => onUpdateStatus(order.id, 'ready'),
      color: 'text-status-info',
    });
  }
  if (status === 'ready' && canUpdate) {
    actions.push({
      label: 'Complete',
      action: () => onUpdateStatus(order.id, 'completed'),
      color: 'text-status-success',
    });
  }
  if ((status === 'pending' || status === 'new' || status === 'preparing') && canCancel) {
    actions.push({
      label: 'Cancel',
      action: () => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
          onUpdateStatus(order.id, 'cancelled');
        }
      },
      color: 'text-status-error',
    });
  }
  return actions;
}

export function formatOrderNumber(order: ExtendedOrder, ordersLength: number, index: number): string {
  if (order.order_number != null) {
    return `#${String(order.order_number).padStart(4, '0')}`;
  }
  return `#${String(ordersLength - index).padStart(4, '0')}`;
}

export function formatCurrency(amount: number): string {
  return `R ${amount.toFixed(2)}`;
}
