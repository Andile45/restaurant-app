import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import type { RestaurantInfo } from './useSettings';

interface RestaurantInfoSectionProps {
  restaurantInfo: RestaurantInfo;
  onRestaurantInfoChange: (info: RestaurantInfo) => void;
  onEdit: () => void;
}

export const RestaurantInfoSection: React.FC<RestaurantInfoSectionProps> = ({
  restaurantInfo,
  onRestaurantInfoChange,
  onEdit,
}) => {
  return (
    <div className="bg-bg-surface rounded-lg border border-border shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <HiOutlineOfficeBuilding className="w-6 h-6 text-primary" />
        <h2 className="heading text-text-primary">Restaurant Info</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block label text-text-primary mb-2">Restaurant Name</label>
          <input
            type="text"
            value={restaurantInfo.name}
            onChange={(e) => { onEdit(); onRestaurantInfoChange({ ...restaurantInfo, name: e.target.value }); }}
            className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block label text-text-primary mb-2">Address</label>
          <textarea
            value={restaurantInfo.address}
            onChange={(e) => { onEdit(); onRestaurantInfoChange({ ...restaurantInfo, address: e.target.value }); }}
            className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
        </div>
        <div>
          <label className="block label text-text-primary mb-2">Contact Number</label>
          <input
            type="text"
            value={restaurantInfo.contact}
            onChange={(e) => { onEdit(); onRestaurantInfoChange({ ...restaurantInfo, contact: e.target.value }); }}
            className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="+27 12 345 6789"
          />
        </div>
      </div>
    </div>
  );
};
