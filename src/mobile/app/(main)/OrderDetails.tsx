import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store/index';
import { fetchOrderById, updateOrderStatusInDb } from '../../store/slices/orderSlice';
import { CustomButton } from '../../components/Button';
import { Loader } from '../../components/Loader';
import { ErrorDisplay } from '../../components/auth/ErrorDisplay';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatPrice } from '../../utils/formatPrice';
import type { Order } from '../../../common/types/order';
import type { OrderItem } from '../../../common/types/orderItem';

type RootStackParamList = {
  OrderDetails: {
    orderId: string;
  };
};

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'completed':
      return '#4CAF50';
    case 'pending':
      return '#FF9800';
    case 'cancelled':
      return '#F44336';
    default:
      return colors.textSecondary;
  }
};

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'completed':
      return 'checkmark-circle';
    case 'pending':
      return 'time';
    case 'cancelled':
      return 'close-circle';
    default:
      return 'help-circle';
  }
};

export default function OrderDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentOrder, isLoading, error } = useAppSelector((state) => state.order);
  const [isCancelling, setIsCancelling] = useState(false);

  const params = route.params as { orderId: string };
  const orderId = params?.orderId;

  useEffect(() => {
    if (orderId && user?.id) {
      dispatch(fetchOrderById(orderId, user.id));
    }
  }, [orderId, user?.id, dispatch]);

  const handleCancelOrder = () => {
    if (!orderId) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              await dispatch(updateOrderStatusInDb(orderId, 'cancelled'));
              Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel order');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && !currentOrder) {
    return <Loader fullscreen />;
  }

  if (error && !currentOrder) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <ErrorDisplay error={error} />
          <CustomButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <CustomButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(currentOrder.status);
  const statusIcon = getStatusIcon(currentOrder.status);
  const orderItems = currentOrder.order_items || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Order Details</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Order ID and Status */}
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderIdLabel}>Order ID</Text>
              <Text style={styles.orderId}>#{currentOrder.id.substring(0, 8)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Ionicons name={statusIcon} size={16} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Date */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Order Date</Text>
          </View>
          <Text style={styles.sectionValue}>{formatDate(currentOrder.created_at)}</Text>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Order Items</Text>
          </View>
          {orderItems.length === 0 ? (
            <Text style={styles.emptyText}>No items in this order</Text>
          ) : (
            orderItems.map((item: any) => {
              const foodItem = item.food_item;
              const itemTotal = (item.price_at_purchase || foodItem?.price || 0) * item.quantity;

              return (
                <View key={item.id} style={styles.orderItemCard}>
                  <View style={styles.orderItemHeader}>
                    <View style={styles.orderItemInfo}>
                      <Text style={styles.orderItemName}>
                        {foodItem?.name || 'Unknown Item'}
                      </Text>
                      <Text style={styles.orderItemQuantity}>Quantity: {item.quantity}</Text>
                    </View>
                    <Text style={styles.orderItemPrice}>{formatPrice(itemTotal)}</Text>
                  </View>

                  {foodItem?.description && (
                    <Text style={styles.orderItemDescription} numberOfLines={2}>
                      {foodItem.description}
                    </Text>
                  )}

                  {/* Extras */}
                  {item.extras && Object.keys(item.extras).length > 0 && (
                    <View style={styles.extrasContainer}>
                      {item.extras.add_ons && item.extras.add_ons.length > 0 && (
                        <View style={styles.extrasRow}>
                          <Text style={styles.extrasLabel}>Add-ons:</Text>
                          <Text style={styles.extrasValue}>{item.extras.add_ons.join(', ')}</Text>
                        </View>
                      )}
                      {item.extras.sides && item.extras.sides.length > 0 && (
                        <View style={styles.extrasRow}>
                          <Text style={styles.extrasLabel}>Sides:</Text>
                          <Text style={styles.extrasValue}>{item.extras.sides.join(', ')}</Text>
                        </View>
                      )}
                      {item.extras.drinks && item.extras.drinks.length > 0 && (
                        <View style={styles.extrasRow}>
                          <Text style={styles.extrasLabel}>Drinks:</Text>
                          <Text style={styles.extrasValue}>{item.extras.drinks.join(', ')}</Text>
                        </View>
                      )}
                      {item.extras.remove && item.extras.remove.length > 0 && (
                        <View style={styles.extrasRow}>
                          <Text style={styles.extrasLabel}>Removed:</Text>
                          <Text style={styles.extrasValue}>{item.extras.remove.join(', ')}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.orderItemPriceRow}>
                    <Text style={styles.orderItemUnitPrice}>
                      {formatPrice(item.price_at_purchase || foodItem?.price || 0)} each
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Delivery Address */}
        {currentOrder.address && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>
            <Text style={styles.sectionValue}>{currentOrder.address}</Text>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({orderItems.length})</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(
                orderItems.reduce(
                  (sum: number, item: any) =>
                    sum + (item.price_at_purchase || item.food_item?.price || 0) * item.quantity,
                  0
                )
              )}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>{formatPrice(currentOrder.total)}</Text>
          </View>
        </View>

        {/* Cancel Order Button */}
        {currentOrder.status === 'pending' && (
          <View style={styles.actionSection}>
            <CustomButton
              title={isCancelling ? 'Cancelling...' : 'Cancel Order'}
              onPress={handleCancelOrder}
              variant="secondary"
              disabled={isCancelling}
              style={styles.cancelButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    fontSize: 24,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  orderId: {
    ...typography.heading,
    color: colors.textPrimary,
    fontSize: 18,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    ...typography.body,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    fontSize: 16,
  },
  sectionValue: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  orderItemCard: {
    backgroundColor: colors.appBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderItemName: {
    ...typography.heading,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 4,
  },
  orderItemQuantity: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  orderItemPrice: {
    ...typography.heading,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  orderItemDescription: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  extrasContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  extrasRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  extrasLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginRight: 8,
  },
  extrasValue: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  orderItemPriceRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  orderItemUnitPrice: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  summaryTotalLabel: {
    ...typography.heading,
    color: colors.textPrimary,
    fontSize: 18,
  },
  summaryTotalValue: {
    ...typography.heading,
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  actionSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
});
