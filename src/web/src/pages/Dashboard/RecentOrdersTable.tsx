import type { RecentOrder } from './dashboardUtils';

function formatCurrency(amount: number) {
  return `R ${amount.toFixed(2)}`;
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'completed': return 'text-status-success';
    case 'preparing': return 'text-status-warning';
    case 'ready': return 'text-status-info';
    case 'pending':
    case 'new': return 'text-primary';
    default: return 'text-text-secondary';
  }
}

interface RecentOrdersTableProps {
  recentOrders: RecentOrder[];
  onExportCsv: () => void;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  recentOrders,
  onExportCsv,
}) => {
  return (
    <div className="bg-bg-surface rounded-lg border border-border shadow-sm">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="heading text-text-primary">Recent Orders</h2>
        <button
          type="button"
          onClick={onExportCsv}
          className="body-sm text-primary hover:underline"
        >
          Export
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Order #</th>
              <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Status</th>
              <th className="px-6 py-3 text-right body-sm font-semibold text-text-primary">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center body text-text-secondary">
                  No orders in this period
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-secondary transition-colors">
                  <td className="px-6 py-4 body text-text-primary">{order.order_number}</td>
                  <td className="px-6 py-4">
                    <span className={`body-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right body font-semibold text-text-primary">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
