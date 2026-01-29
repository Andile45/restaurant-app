import { HiOutlineTrendingUp } from 'react-icons/hi';
import type { TopItem } from './dashboardUtils';

interface TopItemsListProps {
  topItems: TopItem[];
}

export const TopItemsList: React.FC<TopItemsListProps> = ({ topItems }) => {
  return (
    <div className="bg-bg-surface rounded-lg border border-border shadow-sm">
      <div className="p-6 border-b border-border flex items-center gap-2">
        <HiOutlineTrendingUp className="w-5 h-5 text-primary" />
        <h2 className="heading text-text-primary">Top Items</h2>
      </div>
      <div className="p-6">
        {topItems.length === 0 ? (
          <p className="body text-text-secondary">No order items in this period.</p>
        ) : (
          <ul className="space-y-3">
            {topItems.map((item, index) => (
              <li key={item.food_id} className="flex items-center justify-between body-sm">
                <span className="text-text-primary">
                  <span className="font-medium text-text-secondary w-6 inline-block">{index + 1}.</span>
                  {item.name}
                </span>
                <span className="font-semibold text-primary">{item.total_quantity} sold</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
