import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.googlePlacesApiKey ?? process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

export interface PlacePrediction {
  description: string;
  place_id: string;
}

/**
 * Fetch address suggestions from Google Places Autocomplete (Legacy).
 * Only returns results that exist in Google Maps.
 */
export async function fetchAddressSuggestions(
  input: string
): Promise<{ suggestions: PlacePrediction[]; error: string | null }> {
  if (!API_KEY || !input.trim()) {
    return { suggestions: [], error: null };
  }

  const query = input.trim();
  if (query.length < 2) {
    return { suggestions: [], error: null };
  }

  try {
    const url =
      'https://maps.googleapis.com/maps/api/place/autocomplete/json?' +
      `input=${encodeURIComponent(query)}` +
      `&key=${encodeURIComponent(API_KEY)}` +
      '&types=address' +
      '&language=en';

    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'REQUEST_DENIED') {
      return { suggestions: [], error: 'Places API key invalid or not enabled' };
    }
    if (data.status === 'ZERO_RESULTS') {
      return { suggestions: [], error: null };
    }
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return { suggestions: [], error: data.error_message || data.status };
    }

    const suggestions: PlacePrediction[] = (data.predictions || []).map((p: any) => ({
      description: p.description || '',
      place_id: p.place_id || '',
    }));

    return { suggestions, error: null };
  } catch (e: any) {
    return { suggestions: [], error: e.message || 'Failed to fetch addresses' };
  }
}

export function isPlacesConfigured(): boolean {
  return Boolean(API_KEY && API_KEY.length > 0);
}
