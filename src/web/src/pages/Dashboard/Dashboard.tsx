import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { HiOutlineClipboardList, HiOutlineCurrencyDollar, HiOutlineCube } from 'react-icons/hi';

interface DashboardStats {
  todayOrders: number;
  revenue: number;
  activeItems: number;
  totalItems: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    revenue: 0,
    activeItems: 0,
    totalItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch today's orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;

      // Calculate stats
      const todayOrders = ordersData?.length || 0;
      const revenue = ordersData?.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0) || 0;
      
      // Fetch menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from('food_items')
        .select('id, is_available');

      if (itemsError) throw itemsError;

      const totalItems = itemsData?.length || 0;
      const activeItems = itemsData?.filter(item => item.is_available).length || 0;

      // Format recent orders
      const formattedOrders = (ordersData || []).map((order, index) => ({
        id: order.id,
        order_number: `#${String(1245 + (todayOrders - index - 1)).padStart(4, '0')}`,
        total: parseFloat(order.total.toString()),
        status: order.status,
        created_at: order.created_at,
      }));

      setStats({
        todayOrders,
        revenue,
        activeItems,
        totalItems,
      });
      setRecentOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-status-success';
      case 'preparing':
        return 'text-status-warning';
      case 'ready':
        return 'text-status-info';
      case 'pending':
      case 'new':
        return 'text-primary';
      default:
        return 'text-text-secondary';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="heading text-text-primary mb-6">Dashboard</div>
        <div className="body text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="heading-lg text-text-primary mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-bg-surface p-6 rounded-lg border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading-sm text-text-primary">Today's Orders</h3>
            <HiOutlineClipboardList className="w-6 h-6 text-primary" />
          </div>
          <p className="heading-lg text-primary">{stats.todayOrders}</p>
        </div>

        <div className="bg-bg-surface p-6 rounded-lg border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading-sm text-text-primary">Revenue</h3>
            <HiOutlineCurrencyDollar className="w-6 h-6 text-status-success" />
          </div>
          <p className="heading-lg text-status-success">{formatCurrency(stats.revenue)}</p>
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

      <div className="bg-bg-surface rounded-lg border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="heading text-text-primary">Recent Orders</h2>
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
                    No orders today
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
    </div>
  );
};
