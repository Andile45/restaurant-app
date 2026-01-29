import { HiOutlineClock } from 'react-icons/hi';
import { DAYS } from './settingsConstants';
import type { OperatingHours } from './useSettings';

interface OperatingHoursSectionProps {
  operatingHours: OperatingHours;
  onOperatingHoursChange: (hours: OperatingHours) => void;
  onEdit: () => void;
}

export const OperatingHoursSection: React.FC<OperatingHoursSectionProps> = ({
  operatingHours,
  onOperatingHoursChange,
  onEdit,
}) => {
  return (
    <div className="bg-bg-surface rounded-lg border border-border shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <HiOutlineClock className="w-6 h-6 text-primary" />
        <h2 className="heading text-text-primary">Operating Hours</h2>
      </div>
      <div className="space-y-3">
        {DAYS.map((day) => {
          const dayHours = operatingHours[day.key];
          return (
            <div key={day.key} className="flex items-center gap-4">
              <div className="w-24">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dayHours.enabled}
                    onChange={(e) => {
                      onEdit();
                      onOperatingHoursChange({
                        ...operatingHours,
                        [day.key]: { ...dayHours, enabled: e.target.checked },
                      });
                    }}
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
                    onChange={(e) => {
                      onEdit();
                      onOperatingHoursChange({
                        ...operatingHours,
                        [day.key]: { ...dayHours, open: e.target.value },
                      });
                    }}
                    className="px-3 py-2 body-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="body-sm text-text-secondary">to</span>
                  <input
                    type="time"
                    value={dayHours.close}
                    onChange={(e) => {
                      onEdit();
                      onOperatingHoursChange({
                        ...operatingHours,
                        [day.key]: { ...dayHours, close: e.target.value },
                      });
                    }}
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
  );
};
