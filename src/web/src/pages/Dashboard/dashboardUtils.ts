export type DateRange = 'today' | '7days' | '30days' | 'month';

export interface DashboardStats {
  orderCount: number;
  revenue: number;
  activeItems: number;
  totalItems: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

export interface TopItem {
  food_id: string;
  name: string;
  total_quantity: number;
}

export function getDateRange(range: DateRange): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (range === 'today') return { start, end };
  if (range === '7days') {
    start.setDate(start.getDate() - 6);
    return { start, end };
  }
  if (range === '30days') {
    start.setDate(start.getDate() - 29);
    return { start, end };
  }
  if (range === 'month') {
    start.setDate(1);
    return { start, end };
  }
  return { start, end };
}

export function getRangeLabel(range: DateRange): string {
  switch (range) {
    case 'today': return 'Today';
    case '7days': return 'Last 7 days';
    case '30days': return 'Last 30 days';
    case 'month': return 'This month';
    default: return 'Today';
  }
}
