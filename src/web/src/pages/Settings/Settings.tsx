import { useState } from 'react';
import { HiOutlineOfficeBuilding, HiOutlineClock, HiOutlineCurrencyDollar } from 'react-icons/hi';

export const Settings: React.FC = () => {
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'BiteX Restaurant',
    address: '',
    contact: '',
  });

  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '09:00', close: '22:00', enabled: true },
    tuesday: { open: '09:00', close: '22:00', enabled: true },
    wednesday: { open: '09:00', close: '22:00', enabled: true },
    thursday: { open: '09:00', close: '22:00', enabled: true },
    friday: { open: '09:00', close: '23:00', enabled: true },
    saturday: { open: '10:00', close: '23:00', enabled: true },
    sunday: { open: '10:00', close: '22:00', enabled: true },
  });

  const [taxAndFees, setTaxAndFees] = useState({
    vat: '15',
    serviceFee: '0',
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ] as const;

  return (
    <div className="p-8">
      <h1 className="heading-lg text-text-primary mb-6">Settings</h1>

      <div className="space-y-8">
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
                onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })}
                className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block label text-text-primary mb-2">Address</label>
              <textarea
                value={restaurantInfo.address}
                onChange={(e) => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })}
                className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
            <div>
              <label className="block label text-text-primary mb-2">Contact Number</label>
              <input
                type="text"
                value={restaurantInfo.contact}
                onChange={(e) => setRestaurantInfo({ ...restaurantInfo, contact: e.target.value })}
                className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+27 12 345 6789"
              />
            </div>
          </div>
        </div>

        <div className="bg-bg-surface rounded-lg border border-border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <HiOutlineClock className="w-6 h-6 text-primary" />
            <h2 className="heading text-text-primary">Operating Hours</h2>
          </div>
          <div className="space-y-3">
            {days.map((day) => {
              const dayHours = operatingHours[day.key];
              return (
                <div key={day.key} className="flex items-center gap-4">
                  <div className="w-24">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dayHours.enabled}
                        onChange={(e) =>
                          setOperatingHours({
                            ...operatingHours,
                            [day.key]: { ...dayHours, enabled: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <span className="body-sm text-text-primary">{day.label}</span>
                    </label>
                  </div>
                  {dayHours.enabled && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={dayHours.open}
                        onChange={(e) =>
                          setOperatingHours({
                            ...operatingHours,
                            [day.key]: { ...dayHours, open: e.target.value },
                          })
                        }
                        className="px-3 py-2 body-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="body-sm text-text-secondary">to</span>
                      <input
                        type="time"
                        value={dayHours.close}
                        onChange={(e) =>
                          setOperatingHours({
                            ...operatingHours,
                            [day.key]: { ...dayHours, close: e.target.value },
                          })
                        }
                        className="px-3 py-2 body-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                  {!dayHours.enabled && (
                    <span className="body-sm text-text-secondary italic">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-bg-surface rounded-lg border border-border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <HiOutlineCurrencyDollar className="w-6 h-6 text-primary" />
            <h2 className="heading text-text-primary">Tax & Fees</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block label text-text-primary mb-2">VAT (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxAndFees.vat}
                onChange={(e) => setTaxAndFees({ ...taxAndFees, vat: e.target.value })}
                className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block label text-text-primary mb-2">Service Fee (R)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={taxAndFees.serviceFee}
                onChange={(e) => setTaxAndFees({ ...taxAndFees, serviceFee: e.target.value })}
                className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 button text-white bg-primary hover:opacity-90 rounded-md transition-opacity"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
