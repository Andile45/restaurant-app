import { HiOutlineDownload } from 'react-icons/hi';
import { getRangeLabel } from './dashboardUtils';
import type { DateRange } from './dashboardUtils';
import { useDashboardData } from './useDashboardData';
import { DashboardStatsCards } from './DashboardStatsCards';
import { RecentOrdersTable } from './RecentOrdersTable';
import { TopItemsList } from './TopItemsList';

export const Dashboard: React.FC = () => {
  const { dateRange, setDateRange, stats, recentOrders, topItems, loading } = useDashboardData();

  const handleExportCsv = () => {
    const headers = ['Order ID', 'Date', 'Total (R)', 'Status'];
    const rows = recentOrders.map((o) => [
      o.id,
      new Date(o.created_at).toLocaleString(),
      o.total.toFixed(2),
      o.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${getRangeLabel(dateRange).replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && recentOrders.length === 0) {
    return (
      <div className="p-8">
        <div className="heading text-text-primary mb-6">Dashboard</div>
        <div className="body text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <h1 className="heading-lg text-text-primary">Dashboard</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {(['today', '7days', '30days', 'month'] as DateRange[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 body-sm font-medium rounded-md transition-colors ${
                dateRange === range
                  ? 'bg-primary text-white'
                  : 'bg-bg-surface text-text-primary border border-border hover:bg-secondary'
              }`}
            >
              {getRangeLabel(range)}
            </button>
          ))}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 body-sm font-medium text-text-primary bg-bg-surface border border-border rounded-md hover:bg-secondary transition-colors"
          >
            <HiOutlineDownload className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <DashboardStatsCards dateRange={dateRange} stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RecentOrdersTable recentOrders={recentOrders} onExportCsv={handleExportCsv} />
        <TopItemsList topItems={topItems} />
      </div>
    </div>
  );
};
