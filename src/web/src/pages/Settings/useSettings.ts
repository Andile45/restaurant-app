import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { getErrorMessageForUser } from '../../utils/errorUtils';
import { DEFAULT_RESTAURANT, DEFAULT_HOURS, DEFAULT_TAX } from './settingsConstants';
import type { DayKey } from './settingsConstants';

export type RestaurantInfo = { name: string; address: string; contact: string };
export type OperatingHours = Record<DayKey, { open: string; close: string; enabled: boolean }>;
export type TaxAndFees = { vat: string; serviceFee: string };

export function useSettings() {
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(DEFAULT_RESTAURANT);
  const [operatingHours, setOperatingHours] = useState<OperatingHours>(DEFAULT_HOURS);
  const [taxAndFees, setTaxAndFees] = useState<TaxAndFees>(DEFAULT_TAX);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') return;
        throw fetchError;
      }
      if (data) {
        setRestaurantInfo({
          name: data.restaurant_name ?? DEFAULT_RESTAURANT.name,
          address: data.address ?? '',
          contact: data.contact ?? '',
        });
        if (data.operating_hours && typeof data.operating_hours === 'object') {
          setOperatingHours({ ...DEFAULT_HOURS, ...(data.operating_hours as object) } as OperatingHours);
        }
        setTaxAndFees({
          vat: data.vat_percent != null ? String(data.vat_percent) : DEFAULT_TAX.vat,
          serviceFee: data.service_fee != null ? String(data.service_fee) : DEFAULT_TAX.serviceFee,
        });
      }
    } catch (err: unknown) {
      setError(getErrorMessageForUser(err, 'Settings could not be loaded. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);
      const payload = {
        id: 1,
        restaurant_name: restaurantInfo.name.trim() || DEFAULT_RESTAURANT.name,
        address: restaurantInfo.address.trim() || null,
        contact: restaurantInfo.contact.trim() || null,
        operating_hours: operatingHours,
        vat_percent: parseFloat(taxAndFees.vat) || 0,
        service_fee: parseFloat(taxAndFees.serviceFee) || 0,
      };
      const { error: upsertError } = await supabase
        .from('restaurant_settings')
        .upsert(payload, { onConflict: 'id' });
      if (upsertError) throw upsertError;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setError(getErrorMessageForUser(err, 'Settings could not be saved. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const clearSuccessOnEdit = () => {
    if (saveSuccess) setSaveSuccess(false);
  };

  return {
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
  };
}
