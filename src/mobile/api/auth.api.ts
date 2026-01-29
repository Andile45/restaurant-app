import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { supabase } from './supabaseClient';

// Complete the auth session when done
WebBrowser.maybeCompleteAuthSession();

export const signUp = async (email: string, password: string) =>
  supabase.auth.signUp({ email, password })

export const signIn = async (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = async () =>
  supabase.auth.signOut()

export const signInWithGoogle = async () => {
  try {
    // Get the redirect URL for the current platform (deep link back to app)
    // This will be something like: restaurant-app://auth/callback
    // IMPORTANT: This URL must be added to Supabase Dashboard:
    // Authentication → URL Configuration → Redirect URLs
    const redirectTo = AuthSession.makeRedirectUri({
      scheme: 'restaurant-app',
      path: 'auth/callback',
    });

    console.log('OAuth redirect URL:', redirectTo);

    // Start the OAuth flow
    // Supabase will redirect to our custom scheme URL after authentication
    // Flow: App → Google OAuth → Supabase callback → App (via deep link)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      return { data: null, error };
    }

    if (!data?.url) {
      return { data: null, error: new Error('No OAuth URL returned') };
    }

    // Open the OAuth URL in the browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo
    );

    if (result.type === 'success') {
      // Extract the URL from the result
      const url = result.url;
      
      // Supabase OAuth callback URLs contain tokens in the hash fragment
      // Format: restaurant-app://auth/callback#access_token=...&refresh_token=...
      const hashParams = new URLSearchParams(url.split('#')[1] || '');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        // Set the session using the tokens
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        return { data: sessionData, error: sessionError };
      }

      // Also check query parameters (some OAuth flows use query params)
      // Handle both http:// and custom scheme URLs
      try {
        // For custom scheme URLs, we need to add a protocol to parse them
        const urlToParse = url.includes('://') ? url : `https://${url}`;
        const parsedUrl = new URL(urlToParse);
        const queryAccessToken = parsedUrl.searchParams.get('access_token');
        const queryRefreshToken = parsedUrl.searchParams.get('refresh_token');

        if (queryAccessToken && queryRefreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: queryAccessToken,
            refresh_token: queryRefreshToken,
          });

          return { data: sessionData, error: sessionError };
        }
      } catch (parseError) {
        // URL parsing failed, tokens should be in hash fragment
      }

      return { data: null, error: new Error('No tokens found in OAuth response') };
    }

    if (result.type === 'cancel') {
      return { data: null, error: new Error('OAuth flow cancelled by user') };
    }

    return { data: null, error: new Error('OAuth flow failed') };
  } catch (error: any) {
    return { data: null, error };
  }
}

export const resetPassword = async (email: string) =>
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/reset-password`,
  })
