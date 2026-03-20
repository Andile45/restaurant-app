/**
 * Supabase client for the mobile app.
 * URL and anon key come from app.config.js extra (in turn from .env EXPO_PUBLIC_*).
 */
import { createClient } from "@supabase/supabase-js"
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage =
    'Missing Supabase environment variables.\n\n' +
    'Please create a .env file in src/mobile/ with:\n' +
    'EXPO_PUBLIC_SUPABASE_URL=your_supabase_url\n' +
    'EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key\n\n' +
    'Then restart Expo with: npx expo start -c\n\n' +
    `Current values: URL=${supabaseUrl ? 'set' : 'missing'}, Key=${supabaseAnonKey ? 'set' : 'missing'}`;
  console.error('Supabase Config Error:', errorMessage);
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
