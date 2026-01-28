import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store/index';
import { chargeCard, generatePaymentReference } from '../../api/paystack.api';
import { createPaystackInlineHTML } from '../../api/paystack-web.api';
import { createPayment } from '../../store/slices/paymentSlice';
import { updateOrderStatusInDb, verifyOrderForPayment } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { CustomButton } from '../../components/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatPrice } from '../../utils/formatPrice';

// Check if running in Expo Go (matches paystack.api.ts logic)
const isExpoGo = Constants.executionEnvironment === 'storeClient';
const USE_WEBVIEW_PAYMENT = isExpoGo || Platform.OS === 'web';

interface PaymentRouteParams {
  orderId: string;
  amount: number;
  email: string;
}

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Validate route params on mount
  useEffect(() => {
    if (!route.params) {
      Alert.alert('Error', 'Missing payment information. Please try again.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }

    const params = route.params as PaymentRouteParams;
    if (!params.orderId || !params.amount) {
      Alert.alert('Error', 'Invalid payment information. Please try again.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, []);

  // Get params with fallback
  const params = (route.params as PaymentRouteParams) || { orderId: '', amount: 0, email: '' };
  const { orderId, amount, email } = params;

  // Don't render form if params are invalid
  if (!route.params || !params.orderId || !params.amount) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid payment information</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardFocused, setCardFocused] = useState<'number' | 'expiry' | 'cvc' | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const webViewRef = useRef<WebView>(null);

  // Detect card type from first digit
  const getCardType = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    return 'generic';
  };

  const cardType = getCardType(cardNumber);

  // Format card number for display (masked)
  const getDisplayCardNumber = (): string => {
    if (!cardNumber) return '•••• •••• •••• ••••';
    const cleaned = cardNumber.replace(/\s/g, '');
    const masked = cleaned.slice(0, -4).replace(/\d/g, '•') + cleaned.slice(-4);
    return masked.match(/.{1,4}/g)?.join(' ') || masked;
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
  };

  const handleExpiryMonthChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) {
      setExpiryMonth(cleaned);
    }
  };

  const handleExpiryYearChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) {
      setExpiryYear(cleaned);
    }
  };

  const handleCvcChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setCvc(cleaned);
    }
  };

  // Luhn algorithm for card number validation
  const luhnCheck = (cardNumber: string): boolean => {
    let sum = 0;
    let isEven = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      if (isNaN(digit)) return false;
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const validateForm = (): boolean => {
    // Card number validation
    const cardNumberCleaned = cardNumber.replace(/\s/g, '');
    if (!cardNumberCleaned || cardNumberCleaned.length < 13 || cardNumberCleaned.length > 19) {
      Alert.alert('Invalid Card', 'Please enter a valid card number (13-19 digits)');
      return false;
    }

    // Luhn algorithm validation (skip for WebView payments - Paystack handles it)
    if (!USE_WEBVIEW_PAYMENT && !luhnCheck(cardNumberCleaned)) {
      Alert.alert('Invalid Card', 'Please enter a valid card number');
      return false;
    }

    // Expiry month validation (01-12)
    const month = parseInt(expiryMonth);
    if (!expiryMonth || expiryMonth.length !== 2 || isNaN(month) || month < 1 || month > 12) {
      Alert.alert('Invalid Expiry', 'Please enter a valid expiry month (01-12)');
      return false;
    }

    // Expiry year validation
    if (!expiryYear || expiryYear.length !== 2) {
      Alert.alert('Invalid Expiry', 'Please enter a valid expiry year (YY)');
      return false;
    }

    // Calculate full year
    const currentYear = new Date().getFullYear();
    const currentYearLast2 = currentYear % 100;
    const currentMonth = new Date().getMonth() + 1;
    const enteredYear = parseInt(expiryYear);
    
    if (isNaN(enteredYear)) {
      Alert.alert('Invalid Expiry', 'Please enter a valid expiry year');
      return false;
    }

    // Calculate full year (handle century rollover)
    let fullYear: number;
    if (enteredYear < currentYearLast2) {
      fullYear = currentYear - currentYearLast2 + enteredYear + 100;
    } else {
      fullYear = currentYear - currentYearLast2 + enteredYear;
    }

    // Validate expiry date is not in the past
    if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
      Alert.alert('Invalid Expiry', 'Card has expired. Please enter a valid expiry date');
      return false;
    }

    // Validate reasonable range (not more than 20 years in future)
    if (fullYear > currentYear + 20) {
      Alert.alert('Invalid Expiry', 'Please enter a valid expiry year');
      return false;
    }

    // CVC validation (3-4 digits)
    if (!cvc || cvc.length < 3 || cvc.length > 4) {
      Alert.alert('Invalid CVC', 'Please enter a valid CVC (3-4 digits)');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    // For WebView payment (Expo Go), skip card validation - Paystack handles it
    if (!USE_WEBVIEW_PAYMENT) {
      // 1. Validate form (only for native SDK)
      if (!validateForm()) {
        return;
      }
    }

    // 2. Validate email is available
    const paymentEmail = email || user?.email;
    if (!paymentEmail) {
      Alert.alert('Email Required', 'Please provide an email address for payment processing.');
      return;
    }

    // 3. Validate user is logged in
    if (!user?.id) {
      Alert.alert('Authentication Required', 'Please log in to complete payment.');
      navigation.goBack();
      return;
    }

    setIsProcessing(true);
    let paymentSucceeded = false;
    let paymentReference = '';

    try {
      // 4. Verify order before payment
      try {
        await dispatch(verifyOrderForPayment(orderId, user.id, amount));
      } catch (verifyError: any) {
        Alert.alert(
          'Order Verification Failed',
          verifyError.message || 'Unable to verify order. Please try again.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
        return;
      }

      // 5. Generate payment reference (include order ID for traceability)
      const reference = generatePaymentReference(orderId);
      paymentReference = reference;
      const cardNumberCleaned = cardNumber.replace(/\s/g, '');

      // 6. Calculate expiry year
      const currentYear = new Date().getFullYear();
      const currentYearLast2 = currentYear % 100;
      const enteredYear = parseInt(expiryYear);
      
      let fullYear: number;
      if (enteredYear < currentYearLast2) {
        fullYear = currentYear - currentYearLast2 + enteredYear + 100;
      } else {
        fullYear = currentYear - currentYearLast2 + enteredYear;
      }

      // 7. Process payment with Paystack
      // For Expo Go, use WebView payment
      if (USE_WEBVIEW_PAYMENT) {
        setPaymentReference(reference);
        setShowWebView(true);
        return; // WebView will handle the rest
      }

      const paymentResponse = await chargeCard({
        cardNumber: cardNumberCleaned,
        expiryMonth: expiryMonth.padStart(2, '0'),
        expiryYear: fullYear.toString(),
        cvc,
        email: paymentEmail,
        amount,
        currency: 'ZAR',
        reference,
      });

      if (paymentResponse.status === 'success' && paymentResponse.data) {
        paymentSucceeded = true;
        paymentReference = paymentResponse.data.reference;
        
        // 8. Create payment record in database
        const cardLast4 = paymentResponse.data.card?.last4 || cardNumberCleaned.slice(-4);
        
        let paymentRecordCreated = false;
        try {
          const paymentRecord = await dispatch(
            createPayment(
              orderId,
              amount,
              paymentResponse.data.reference,
              cardLast4,
              'card',
              'paystack'
            )
          );

          if (!paymentRecord) {
            throw new Error('Failed to create payment record');
          }
          paymentRecordCreated = true;
        } catch (dbError: any) {
          // Payment succeeded but payment record creation failed
          Alert.alert(
            'Payment Processed',
            `Your payment was successful, but there was an issue recording it. Please contact support with your payment reference: ${paymentResponse.data.reference}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate to Orders tab - modal will close automatically
                  (navigation as any).navigate('MainTabs', { screen: 'Orders' });
                },
              },
            ]
          );
          return; // Don't proceed with order update if payment record failed
        }

        // 9. Update order status ONLY if payment record was created successfully
        try {
          await dispatch(updateOrderStatusInDb(orderId, 'completed'));
        } catch (orderError: any) {
          // Payment and payment record succeeded but order update failed
          Alert.alert(
            'Payment Recorded',
            `Your payment was processed and recorded, but there was an issue updating your order status. Please contact support with your payment reference: ${paymentResponse.data.reference}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate to Orders tab - modal will close automatically
                  (navigation as any).navigate('MainTabs', { screen: 'Orders' });
                },
              },
            ]
          );
          return; // Don't clear cart if order update failed
        }

        // 10. Clear cart ONLY after ALL operations succeed
        dispatch(clearCart());

        // 11. Show success message
        Alert.alert(
          'Payment Successful!',
          'Your payment has been processed successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Close payment modal first, then navigate to Orders tab
                navigation.goBack();
                setTimeout(() => {
                  (navigation as any).navigate('MainTabs', { screen: 'Orders' });
                }, 100);
              },
            },
          ]
        );
      } else {
        // Payment failed
        Alert.alert('Payment Failed', paymentResponse.message || 'Payment could not be processed');
      }
    } catch (error: any) {
      // Handle payment errors
      if (paymentSucceeded) {
        // Payment succeeded but something else failed
        Alert.alert(
          'Payment Processed',
          `Your payment was successful, but there was an issue completing your order. Please contact support with your payment reference: ${paymentReference || 'N/A'}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Close payment modal first, then navigate to Orders tab
                navigation.goBack();
                setTimeout(() => {
                  (navigation as any).navigate('MainTabs', { screen: 'Orders' });
                }, 100);
              },
            },
          ]
        );
      } else {
        // Payment failed - don't clear cart
        Alert.alert('Payment Error', error.message || 'An error occurred during payment');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle WebView payment messages
  const handleWebViewMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'success' && message.data) {
        setIsProcessing(true);
        const reference = message.data.reference || paymentReference;
        
        try {
          // Re-verify order before updating (order might have changed)
          if (!user?.id) {
            throw new Error('User not authenticated');
          }

          try {
            await dispatch(verifyOrderForPayment(orderId, user.id, amount));
          } catch (verifyError: any) {
            // Order invalid - payment succeeded but order is invalid
            setShowWebView(false);
            Alert.alert(
              'Payment Processed',
              'Payment was successful, but the order is no longer valid. Please contact support with your payment reference: ' + reference,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigate to Orders tab - modal will close automatically
                  (navigation as any).navigate('MainTabs', { screen: 'Orders' });
                  },
                },
              ]
            );
            return;
          }

          // Create payment record
          let paymentRecordCreated = false;
          try {
            const paymentRecord = await dispatch(
              createPayment(
                orderId,
                amount,
                reference,
                undefined, // Card last4 not available from WebView
                'card',
                'paystack'
              )
            );

            if (!paymentRecord) {
              throw new Error('Failed to create payment record');
            }
            paymentRecordCreated = true;
          } catch (paymentError: any) {
            // Payment succeeded but payment record creation failed
            setShowWebView(false);
            Alert.alert(
              'Payment Processed',
              `Your payment was successful, but there was an issue recording it. Please contact support with your payment reference: ${reference}`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigate to Orders tab - modal will close automatically
                  (navigation as any).navigate('MainTabs', { screen: 'Orders' });
                  },
                },
              ]
            );
            return; // Don't proceed with order update if payment record failed
          }

          // Update order status ONLY if payment record was created successfully
          try {
            await dispatch(updateOrderStatusInDb(orderId, 'completed'));
          } catch (orderError: any) {
            // Payment and payment record succeeded but order update failed
            setShowWebView(false);
            Alert.alert(
              'Payment Recorded',
              `Your payment was processed and recorded, but there was an issue updating your order status. Please contact support with your payment reference: ${reference}`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigate to Orders tab - modal will close automatically
                  (navigation as any).navigate('MainTabs', { screen: 'Orders' });
                  },
                },
              ]
            );
            return; // Don't clear cart if order update failed
          }

          // Clear cart ONLY after ALL operations succeed
          dispatch(clearCart());

          // Hide WebView and show success
          setShowWebView(false);
          Alert.alert(
            'Payment Successful!',
            'Your payment has been processed successfully.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Close payment modal and navigate to Orders tab
                  navigation.goBack();
                  // Use setTimeout to ensure modal is closed before navigating
                  setTimeout(() => {
                    // Navigate to Orders tab - modal will close automatically
                  (navigation as any).navigate('MainTabs', { screen: 'Orders' });
                  }, 100);
                },
              },
            ]
          );
        } catch (error: any) {
          setShowWebView(false);
          Alert.alert(
            'Payment Processed',
            `Your payment was successful, but there was an issue updating your order. Please contact support with your payment reference: ${reference}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate to Orders tab - modal will close automatically
                  (navigation as any).navigate('MainTabs', { screen: 'Orders' });
                },
              },
            ]
          );
        } finally {
          setIsProcessing(false);
        }
      } else if (message.type === 'cancelled') {
        setShowWebView(false);
        setIsProcessing(false);
        Alert.alert('Payment Cancelled', 'Payment was cancelled. You can try again.');
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
      setShowWebView(false);
      setIsProcessing(false);
      Alert.alert('Error', 'An error occurred processing the payment response.');
    }
  };

  // If WebView payment is active, show WebView
  if (showWebView) {
    const paymentEmail = email || user?.email || '';
    const htmlContent = createPaystackInlineHTML({
      email: paymentEmail,
      amount,
      currency: 'ZAR',
      reference: paymentReference,
      metadata: {
        orderId,
        userId: user?.id,
      },
    });

    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Cancel Payment?',
                'Are you sure you want to cancel this payment?',
                [
                  { text: 'No', style: 'cancel' },
                  {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: () => setShowWebView(false),
                  },
                ]
              );
            }}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>Complete Payment</Text>
          <View style={styles.closeButton} />
        </View>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          onMessage={handleWebViewMessage}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.webViewLoadingText}>Loading payment form...</Text>
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Payment</Text>
            <Text style={styles.subtitle}>Secure payment powered by Paystack</Text>
          </View>

          {/* Amount Card */}
          <View style={styles.amountCard}>
            <View style={styles.amountRow}>
              <View>
                <Text style={styles.amountLabel}>Total Amount</Text>
                <Text style={styles.amountValue}>{formatPrice(amount)}</Text>
              </View>
              <View style={styles.secureBadge}>
                <Ionicons name="lock-closed" size={16} color={colors.primary} />
                <Text style={styles.secureText}>Secure</Text>
              </View>
            </View>
          </View>

          {/* Card Preview */}
          <View style={styles.cardPreviewContainer}>
            <View style={[styles.cardPreview, cardFocused === 'number' && styles.cardPreviewFocused]}>
              <View style={styles.cardPreviewHeader}>
                <View style={styles.cardChip} />
                {cardType !== 'generic' && (
                  <View style={styles.cardTypeIcon}>
                    <Ionicons 
                      name={cardType === 'visa' ? 'card' : cardType === 'mastercard' ? 'card' : 'card'} 
                      size={24} 
                      color={colors.textPrimary} 
                    />
                  </View>
                )}
              </View>
              <View style={styles.cardPreviewNumber}>
                <Text style={styles.cardPreviewNumberText}>
                  {cardFocused === 'number' ? cardNumber.padEnd(19, '•') : getDisplayCardNumber()}
                </Text>
              </View>
              <View style={styles.cardPreviewFooter}>
                <View>
                  <Text style={styles.cardPreviewLabel}>Cardholder Name</Text>
                  <Text style={styles.cardPreviewValue}>{user?.name || 'YOUR NAME'}</Text>
                </View>
                <View>
                  <Text style={styles.cardPreviewLabel}>Expires</Text>
                  <Text style={styles.cardPreviewValue}>
                    {expiryMonth && expiryYear 
                      ? `${expiryMonth.padStart(2, '0')}/${expiryYear}` 
                      : 'MM/YY'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <View style={styles.label}>
                <Ionicons name="card-outline" size={16} color={colors.textPrimary} />
                <Text style={styles.labelText}>Card Number</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  cardFocused === 'number' && styles.inputFocused,
                  cardNumber && cardNumber.replace(/\s/g, '').length >= 13 && styles.inputValid
                ]}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                onFocus={() => setCardFocused('number')}
                onBlur={() => setCardFocused(null)}
                keyboardType="numeric"
                maxLength={19}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <View style={styles.label}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textPrimary} />
                  <Text style={styles.labelText}>Expiry Date</Text>
                </View>
                <View style={styles.expiryRow}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.expiryInput,
                      cardFocused === 'expiry' && styles.inputFocused,
                      expiryMonth && expiryYear && styles.inputValid
                    ]}
                    placeholder="MM"
                    value={expiryMonth}
                    onChangeText={handleExpiryMonthChange}
                    onFocus={() => setCardFocused('expiry')}
                    onBlur={() => setCardFocused(null)}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text style={styles.expirySeparator}>/</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.expiryInput,
                      cardFocused === 'expiry' && styles.inputFocused,
                      expiryMonth && expiryYear && styles.inputValid
                    ]}
                    placeholder="YY"
                    value={expiryYear}
                    onChangeText={handleExpiryYearChange}
                    onFocus={() => setCardFocused('expiry')}
                    onBlur={() => setCardFocused(null)}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <View style={styles.label}>
                  <Ionicons name="lock-closed-outline" size={16} color={colors.textPrimary} />
                  <Text style={styles.labelText}>CVC</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    cardFocused === 'cvc' && styles.inputFocused,
                    cvc && cvc.length >= 3 && styles.inputValid
                  ]}
                  placeholder="123"
                  value={cvc}
                  onChangeText={handleCvcChange}
                  onFocus={() => setCardFocused('cvc')}
                  onBlur={() => setCardFocused(null)}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </View>

          {/* Security Info */}
          <View style={styles.securitySection}>
            <View style={styles.securityRow}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <Text style={styles.securityText}>Your payment information is encrypted and secure</Text>
            </View>
          </View>

          {/* Expo Go / WebView Notice */}
          {USE_WEBVIEW_PAYMENT && (
            <View style={styles.webViewNotice}>
              <View style={styles.webViewNoticeHeader}>
                <Ionicons name="globe-outline" size={18} color={colors.primary} />
                <Text style={styles.webViewNoticeTitle}>Web Payment</Text>
              </View>
              <Text style={styles.webViewNoticeText}>
                You're using Expo Go. Payment will be processed securely through Paystack's web payment form.
              </Text>
            </View>
          )}

          {/* Test Card Info */}
          <View style={styles.testCardSection}>
            <View style={styles.testCardHeader}>
              <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.testCardTitle}>Test Mode</Text>
            </View>
            <Text style={styles.testCardText}>
              {USE_WEBVIEW_PAYMENT 
                ? 'Click "Pay Now" to open Paystack payment form. Use test card: 4084084084084081'
                : `Use test card: ${'4084084084084081'}\nExpiry: Any future date | CVC: Any 3 digits`}
            </Text>
          </View>

          {/* Pay Button */}
          <CustomButton
            title={isProcessing ? 'Processing Payment...' : `Pay ${formatPrice(amount)}`}
            onPress={handlePayment}
            variant="primary"
            style={styles.payButton}
            disabled={isProcessing}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    fontSize: 28,
    marginBottom: 6,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
  amountCard: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  amountValue: {
    ...typography.heading,
    color: colors.primary,
    fontSize: 36,
    fontWeight: '700',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  secureText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  cardPreviewContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  cardPreview: {
    width: '100%',
    maxWidth: 340,
    height: 200,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardPreviewFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
  },
  cardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  cardTypeIcon: {
    opacity: 0.8,
  },
  cardPreviewNumber: {
    marginVertical: 20,
  },
  cardPreviewNumberText: {
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardPreviewLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardPreviewValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1,
  },
  formSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  labelText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  inputValid: {
    borderColor: '#4CAF50',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expiryInput: {
    flex: 1,
  },
  expirySeparator: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  securitySection: {
    backgroundColor: `${colors.primary}10`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  securityText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 13,
    flex: 1,
  },
  testCardSection: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  testCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  testCardTitle: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  testCardText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  testCardHighlight: {
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  payButton: {
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  webViewTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webViewLoadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 12,
  },
  webViewNotice: {
    backgroundColor: `${colors.primary}10`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  webViewNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  webViewNoticeTitle: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  webViewNoticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
