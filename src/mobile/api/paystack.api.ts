import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Check if running in Expo Go (where native modules may not work)
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Use WebView-based payment for Expo Go, native SDK for development builds
const USE_WEBVIEW_PAYMENT = isExpoGo || Platform.OS === 'web';

// Lazy import Paystack to avoid issues with module loading
let Paystack: any = null;
let isInitialized = false;

// Initialize Paystack SDK
const PAYSTACK_PUBLIC_KEY = Constants.expoConfig?.extra?.paystackPublicKey || 
  process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY;
  
if (!PAYSTACK_PUBLIC_KEY) {
  throw new Error('Paystack public key is not configured. Please set EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY in your .env file.');
}

// Initialize Paystack SDK (only on native platforms)
const initializePaystack = () => {
  if (isInitialized) return;
  
  try {
    // Only initialize on native platforms (not web)
    if (Platform.OS === 'web') {
      // Web platform - Paystack SDK not available
      if (__DEV__) {
        console.log('Paystack SDK: Skipping initialization on web platform');
      }
      return;
    }

    // Check if running in Expo Go
    if (isExpoGo) {
      if (__DEV__) {
        console.warn(
          'Paystack SDK: Native modules like paystack-react-native require a development build.\n' +
          'Expo Go does not support custom native modules.\n' +
          'To use Paystack:\n' +
          '1. Create a development build: npx expo run:ios or npx expo run:android\n' +
          '2. Or use EAS Build: eas build --profile development\n' +
          'The payment screen will show an error when attempting to process payments.'
        );
      }
      return;
    }

    // Try to load Paystack module
    let paystackModule;
    try {
      paystackModule = require('paystack-react-native');
    } catch (requireError: any) {
      // Module not found or not properly linked
      if (__DEV__) {
        console.warn(
          'Paystack SDK: Module not found. Make sure paystack-react-native is properly installed and linked.\n' +
          'Run: npm install paystack-react-native\n' +
          (Platform.OS === 'ios' ? 'For iOS: cd ios && pod install\n' : '') +
          'Then rebuild the app.\n' +
          'Error:', requireError.message
        );
      }
      return;
    }

    // Extract Paystack from module
    Paystack = paystackModule?.default || paystackModule?.Paystack || paystackModule;
    
    // Check if Paystack object exists and has initSdk method
    if (!Paystack) {
      if (__DEV__) {
        console.warn('Paystack SDK: Module loaded but Paystack object not found');
      }
      return;
    }

    if (typeof Paystack.initSdk === 'function') {
      Paystack.initSdk(PAYSTACK_PUBLIC_KEY);
      isInitialized = true;
      if (__DEV__) {
        console.log('Paystack SDK: Initialized successfully');
      }
    } else {
      // Check for alternative initialization methods
      if (typeof Paystack.initialize === 'function') {
        Paystack.initialize(PAYSTACK_PUBLIC_KEY);
        isInitialized = true;
        if (__DEV__) {
          console.log('Paystack SDK: Initialized using initialize() method');
        }
      } else {
        if (__DEV__) {
          console.warn(
            'Paystack SDK: initSdk method not found. Available methods:',
            Object.keys(Paystack).filter(key => typeof Paystack[key] === 'function')
          );
        }
      }
    }
  } catch (error: any) {
    if (__DEV__) {
      console.error('Paystack SDK: Failed to initialize:', error.message || error);
    }
    // Don't throw - allow the app to continue even if Paystack fails to initialize
  }
};

export interface PaystackChargeParams {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  email: string;
  amount: number; // Amount in kobo (smallest currency unit) - for ZAR, amount * 100
  currency: string;
  reference: string;
}

export interface PaystackChargeResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    reference: string;
    authorization_code?: string;
    card?: {
      last4: string;
      brand: string;
    };
  };
}

/**
 * Charge a card using Paystack
 * Uses WebView-based payment for Expo Go, native SDK for development builds
 */
export const chargeCard = async (
  params: PaystackChargeParams
): Promise<PaystackChargeResponse> => {
  // For Expo Go or Web, return a special response indicating WebView should be used
  if (USE_WEBVIEW_PAYMENT) {
    return {
      status: 'error',
      message: 'USE_WEBVIEW_PAYMENT', // Special flag to indicate WebView payment should be used
      data: {
        reference: generatePaymentReference(),
      },
    };
  }

  // Use native SDK for development builds
  try {
    // Ensure Paystack is initialized
    if (!isInitialized) {
      initializePaystack();
    }

    // Check if Paystack is available
    if (!Paystack) {
      throw new Error(
        'Paystack SDK is not available. The paystack-react-native module may not be properly installed or linked.\n' +
        'Please ensure:\n' +
        '1. Run: npm install paystack-react-native\n' +
        '2. For iOS: cd ios && pod install\n' +
        '3. Rebuild the app'
      );
    }

    if (typeof Paystack.chargeCard !== 'function') {
      // Check for alternative method names
      const availableMethods = Object.keys(Paystack).filter(
        key => typeof Paystack[key] === 'function'
      );
      throw new Error(
        `Paystack SDK: chargeCard method not found. Available methods: ${availableMethods.join(', ')}\n` +
        'Please check the paystack-react-native documentation for the correct API.'
      );
    }

    // Convert amount to kobo (smallest currency unit)
    // For ZAR, multiply by 100 to get cents
    const amountInKobo = Math.round(params.amount * 100);

    const chargeParams = {
      ...params,
      amount: amountInKobo,
    };

    const response = await Paystack.chargeCard(chargeParams);
    
    return {
      status: response.status === 'success' ? 'success' : 'error',
      message: response.message || 'Payment processed',
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Payment failed',
    };
  }
};

/**
 * Generate a unique payment reference
 * Includes order ID prefix for better traceability
 */
export const generatePaymentReference = (orderId?: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const orderPrefix = orderId ? orderId.substring(0, 8).replace(/-/g, '') : 'ORDER';
  return `BiteX_${orderPrefix}_${timestamp}_${random}`.toUpperCase();
};

export default Paystack;
export { initializePaystack };
