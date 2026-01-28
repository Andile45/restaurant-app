import Constants from 'expo-constants';

// Paystack Public Key
const PAYSTACK_PUBLIC_KEY = Constants.expoConfig?.extra?.paystackPublicKey || 
  process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY;
  
if (!PAYSTACK_PUBLIC_KEY) {
  throw new Error('Paystack public key is not configured. Please set EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY in your .env file.');
}

export interface PaystackWebChargeParams {
  email: string;
  amount: number; // Amount in kobo (smallest currency unit) - for ZAR, amount * 100
  currency: string;
  reference: string;
  metadata?: Record<string, any>;
}

export interface PaystackWebChargeResponse {
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
 * Create Paystack payment URL for WebView
 * This uses Paystack's inline payment form which works in WebView
 */
export const createPaystackPaymentUrl = (params: PaystackWebChargeParams): string => {
  const amountInKobo = Math.round(params.amount * 100);
  
  // Build Paystack payment URL
  const baseUrl = 'https://paystack.com/pay';
  const queryParams = new URLSearchParams({
    email: params.email,
    amount: amountInKobo.toString(),
    currency: params.currency,
    reference: params.reference,
    public_key: PAYSTACK_PUBLIC_KEY,
    callback_url: 'https://bitex-payment-callback.com', // This will be handled via WebView navigation
  });

  // Add metadata if provided
  if (params.metadata) {
    Object.entries(params.metadata).forEach(([key, value]) => {
      queryParams.append(`metadata[${key}]`, String(value));
    });
  }

  return `${baseUrl}?${queryParams.toString()}`;
};

/**
 * Sanitize string to prevent XSS in HTML
 */
const sanitizeForHTML = (str: string): string => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Alternative: Use Paystack's Popup/Inline JS SDK approach
 * This creates an HTML page that loads Paystack's inline payment form
 */
export const createPaystackInlineHTML = (params: PaystackWebChargeParams): string => {
  const amountInKobo = Math.round(params.amount * 100);
  
  // Sanitize all user inputs to prevent XSS
  const sanitizedEmail = sanitizeForHTML(params.email);
  const sanitizedAmount = sanitizeForHTML(params.amount.toFixed(2));
  const sanitizedCurrency = sanitizeForHTML(params.currency);
  const sanitizedReference = sanitizeForHTML(params.reference);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://js.paystack.co/v1/inline.js"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .payment-container {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 400px;
      width: 100%;
    }
    .payment-button {
      width: 100%;
      padding: 16px;
      background: #00B4BF;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 20px;
    }
    .payment-button:hover {
      background: #0099a3;
    }
    .payment-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .amount {
      font-size: 24px;
      font-weight: 700;
      color: #00B4BF;
      margin: 20px 0;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="payment-container">
    <h2>Complete Payment</h2>
    <div class="amount">${sanitizedCurrency} ${sanitizedAmount}</div>
    <button class="payment-button" id="payButton" onclick="payWithPaystack()">
      Pay Now
    </button>
  </div>

  <script>
    function payWithPaystack() {
      const button = document.getElementById('payButton');
      button.disabled = true;
      button.textContent = 'Processing...';

      const handler = PaystackPop.setup({
        key: '${PAYSTACK_PUBLIC_KEY}',
        email: '${sanitizedEmail}',
        amount: ${amountInKobo},
        currency: '${sanitizedCurrency}',
        ref: '${sanitizedReference}',
        callback: function(response) {
          // Payment successful
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'success',
            data: {
              reference: response.reference,
              authorization_code: response.authorization,
            }
          }));
        },
        onClose: function() {
          // User closed the payment modal
          button.disabled = false;
          button.textContent = 'Pay Now';
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'cancelled',
            message: 'Payment cancelled by user'
          }));
        }
      });
      
      handler.openIframe();
    }

    // Auto-trigger payment on load (optional - remove if you want manual trigger)
    // window.onload = function() {
    //   payWithPaystack();
    // };
  </script>
</body>
</html>
  `;
};

/**
 * Parse Paystack callback URL to extract payment result
 */
export const parsePaystackCallback = (url: string): PaystackWebChargeResponse | null => {
  try {
    const urlObj = new URL(url);
    
    // Check if this is a Paystack callback
    if (urlObj.hostname.includes('paystack.com') || urlObj.searchParams.has('reference')) {
      const reference = urlObj.searchParams.get('reference');
      const status = urlObj.searchParams.get('status') || urlObj.searchParams.get('trxref');
      
      if (reference && status) {
        return {
          status: status === 'success' || status === 'successful' ? 'success' : 'error',
          message: status === 'success' ? 'Payment successful' : 'Payment failed',
          data: {
            reference,
          },
        };
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};
