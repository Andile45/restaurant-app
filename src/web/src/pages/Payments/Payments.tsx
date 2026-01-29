import { usePayments } from './usePayments';
import { PaymentsTable } from './PaymentsTable';

export const Payments: React.FC = () => {
  const {
    payments,
    loading,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    goToOrder,
  } = usePayments();

  if (loading && payments.length === 0) {
    return (
      <div className="p-8">
        <h1 className="heading-lg text-text-primary mb-6">Payments</h1>
        <p className="body text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <PaymentsTable
      payments={payments}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      dateFrom={dateFrom}
      onDateFromChange={setDateFrom}
      dateTo={dateTo}
      onDateToChange={setDateTo}
      onGoToOrder={goToOrder}
    />
  );
};
