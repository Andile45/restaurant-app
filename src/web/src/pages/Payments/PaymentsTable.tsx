import { HiOutlineEye } from 'react-icons/hi';
import type { PaymentRow, StatusFilter } from './usePayments';
import { formatPaymentCurrency, formatPaymentDate, getPaymentStatusColor } from './usePayments';

interface PaymentsTableProps {
  payments: PaymentRow[];
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  onGoToOrder: (orderId: string) => void;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onGoToOrder,
}) => {
  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <h1 className="heading-lg text-text-primary">Payments</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'completed', 'failed'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusFilterChange(status)}
              className={`px-4 py-2 body-sm font-medium rounded-md transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-bg-surface text-text-primary border border-border hover:bg-secondary'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="body-sm text-text-secondary">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="px-3 py-2 body-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-bg-surface"
          />
          <label className="body-sm text-text-secondary">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="px-3 py-2 body-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-bg-surface"
          />
        </div>
      </div>

      <div className="bg-bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Order</th>
              <th className="px-6 py-3 text-right body-sm font-semibold text-text-primary">Amount</th>
              <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Status</th>
              <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Provider</th>
              <th className="px-6 py-3 text-left body-sm font-semibold text-text-primary">Date</th>
              <th className="px-6 py-3 text-right body-sm font-semibold text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center body text-text-secondary">
                  No payments found.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-secondary transition-colors">
                  <td className="px-6 py-4 body-sm text-text-primary font-mono">
                    {p.order_id.slice(0, 8)}…
                  </td>
                  <td className="px-6 py-4 text-right body font-semibold text-text-primary">
                    {formatPaymentCurrency(p.amount, p.currency)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full body-sm font-medium capitalize ${getPaymentStatusColor(p.payment_status)}`}
                    >
                      {p.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 body-sm text-text-secondary capitalize">
                    {p.provider || '—'}
                  </td>
                  <td className="px-6 py-4 body-sm text-text-secondary">
                    {formatPaymentDate(p.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onGoToOrder(p.order_id)}
                      className="p-2 text-primary hover:bg-primary-light rounded-md transition-colors"
                      title="View order"
                    >
                      <HiOutlineEye className="w-4 h-4" />
                    </button>
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
