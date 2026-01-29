import { useSettings } from './useSettings';
import { RestaurantInfoSection } from './RestaurantInfoSection';
import { OperatingHoursSection } from './OperatingHoursSection';
import { TaxFeesSection } from './TaxFeesSection';

export const Settings: React.FC = () => {
  const {
    restaurantInfo,
    setRestaurantInfo,
    operatingHours,
    setOperatingHours,
    taxAndFees,
    setTaxAndFees,
    loading,
    saving,
    error,
    saveSuccess,
    handleSave,
    clearSuccessOnEdit,
  } = useSettings();

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="heading-lg text-text-primary mb-6">Settings</h1>
        <p className="body text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="heading-lg text-text-primary mb-6">Settings</h1>

      {error && (
        <div className="mb-6 p-4 body-sm text-status-error bg-errorLight border border-status-error rounded-md">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 p-4 body-sm text-status-success bg-green-50 border border-status-success rounded-md">
          Settings saved successfully.
        </div>
      )}

      <div className="space-y-8">
        <RestaurantInfoSection
          restaurantInfo={restaurantInfo}
          onRestaurantInfoChange={setRestaurantInfo}
          onEdit={clearSuccessOnEdit}
        />
        <OperatingHoursSection
          operatingHours={operatingHours}
          onOperatingHoursChange={setOperatingHours}
          onEdit={clearSuccessOnEdit}
        />
        <TaxFeesSection
          taxAndFees={taxAndFees}
          onTaxAndFeesChange={setTaxAndFees}
          onEdit={clearSuccessOnEdit}
        />

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 button text-white bg-primary hover:opacity-90 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
