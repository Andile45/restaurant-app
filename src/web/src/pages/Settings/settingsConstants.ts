export const DEFAULT_RESTAURANT = { name: 'BiteX Restaurant', address: '', contact: '' };

export const DEFAULT_HOURS = {
  monday: { open: '09:00', close: '22:00', enabled: true },
  tuesday: { open: '09:00', close: '22:00', enabled: true },
  wednesday: { open: '09:00', close: '22:00', enabled: true },
  thursday: { open: '09:00', close: '22:00', enabled: true },
  friday: { open: '09:00', close: '23:00', enabled: true },
  saturday: { open: '10:00', close: '23:00', enabled: true },
  sunday: { open: '10:00', close: '22:00', enabled: true },
};

export const DEFAULT_TAX = { vat: '15', serviceFee: '0' };

export type DayKey = keyof typeof DEFAULT_HOURS;

export const DAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];
