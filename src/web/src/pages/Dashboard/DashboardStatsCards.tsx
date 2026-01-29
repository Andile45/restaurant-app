import { HiOutlineClipboardList, HiOutlineCurrencyDollar, HiOutlineCube } from 'react-icons/hi';
import { getRangeLabel } from './dashboardUtils';
import type { DateRange } from './dashboardUtils';
import type { DashboardStats } from './dashboardUtils';

interface DashboardStatsCardsProps {
  dateRange: DateRange;
  stats: DashboardStats;
}

function formatCurrency(amount: number) {
  return `R ${amount.toFixed(2)}`;
}

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({ dateRange, stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-bg-surface p-6 rounded-lg border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="heading-sm text-text-primary">Orders</h3>
          <HiOutlineClipboardList className="w-6 h-6 text-primary" />
        </div>
        <p className="heading-lg text-primary">{stats.orderCount}</p>
        <p className="body-sm text-text-secondary mt-1">{getRangeLabel(dateRange)}</p>
      </div>
      <div className="bg-bg-surface p-6 rounded-lg border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="heading-sm text-text-primary">Revenue</h3>
          <HiOutlineCurrencyDollar className="w-6 h-6 text-status-success" />
        </div>
        <p className="heading-lg text-status-success">{formatCurrency(stats.revenue)}</p>
        <p className="body-sm text-text-secondary mt-1">{getRangeLabel(dateRange)}</p>
      </div>
      <div className="bg-bg-surface p-6 rounded-lg border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="heading-sm text-text-primary">Active Items</h3>
          <HiOutlineCube className="w-6 h-6 text-status-info" />
        </div>
        <p className="heading-lg text-status-info">
          {stats.activeItems} / {stats.totalItems}
        </p>
      </div>
    </div>
  );
};
