import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import {
  type DateRange,
  type DashboardStats,
  type RecentOrder,
  type TopItem,
  getDateRange,
} from './dashboardUtils';

export function useDashboardData() {
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [stats, setStats] = useState<DashboardStats>({
    orderCount: 0,
    revenue: 0,
    activeItems: 0,
    totalItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange(dateRange);
      const startIso = start.toISOString();
      const endIso = end.toISOString();

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, total, status, created_at')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      const orders = ordersData || [];
      const orderCount = orders.length;
      const revenue = orders.reduce((sum, o) => sum + parseFloat(String(o.total)), 0);

      const recentSlice = orders.slice(0, 10);
      const formattedOrders: RecentOrder[] = recentSlice.map((order, index) => {
        const num = order.order_number != null ? order.order_number : orderCount - index;
        return {
          id: order.id,
          order_number: `#${String(num).padStart(4, '0')}`,
          total: parseFloat(String(order.total)),
          status: order.status,
          created_at: order.created_at,
        };
      });
      setRecentOrders(formattedOrders);
      setStats((prev) => ({ ...prev, orderCount, revenue }));

      const orderIds = orders.map((o) => o.id);
      if (orderIds.length > 0) {
        const { data: orderItemsData, error: oiError } = await supabase
          .from('order_items')
          .select('food_id, quantity')
          .in('order_id', orderIds);
        if (!oiError && orderItemsData?.length) {
          const foodIds = [...new Set(orderItemsData.map((oi) => oi.food_id))];
          const { data: foodData } = await supabase
            .from('food_items')
            .select('id, name')
            .in('id', foodIds);
          const nameMap = new Map((foodData || []).map((f) => [f.id, f.name]));
          const qtyByFood = new Map<string, number>();
          orderItemsData.forEach((oi) => {
            qtyByFood.set(oi.food_id, (qtyByFood.get(oi.food_id) || 0) + (oi.quantity || 0));
          });
          const top: TopItem[] = Array.from(qtyByFood.entries())
            .map(([food_id, total_quantity]) => ({
              food_id,
              name: nameMap.get(food_id) || 'Unknown',
              total_quantity,
            }))
            .sort((a, b) => b.total_quantity - a.total_quantity)
            .slice(0, 10);
          setTopItems(top);
        } else {
          setTopItems([]);
        }
      } else {
        setTopItems([]);
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from('food_items')
        .select('id, is_available');
      if (!itemsError && itemsData) {
        const totalItems = itemsData.length;
        const activeItems = itemsData.filter((i) => i.is_available).length;
        setStats((prev) => ({ ...prev, activeItems, totalItems }));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  return { dateRange, setDateRange, stats, recentOrders, topItems, loading, fetchDashboardData };
}
