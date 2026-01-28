import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatPrice } from '../../utils/formatPrice';
import type { Order } from '../../../common/types/order';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
}

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

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const statusColor = getStatusColor(order.status);
  const statusIcon = getStatusIcon(order.status);
  const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Ionicons name="receipt-outline" size={20} color={colors.primary} />
        <Text style={[styles.orderId, { marginLeft: 8 }]}>Order #{order.id.substring(0, 8)}</Text>
      </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Ionicons name={statusIcon} size={14} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor, marginLeft: 4 }]}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Items:</Text>
          <Text style={styles.value}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
        </View>

        {order.address && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value} numberOfLines={1}>
              {order.address}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{formatDate(order.created_at)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>{formatPrice(order.total)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 12,
  },
  content: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.heading,
    fontSize: 16,
    color: colors.textPrimary,
  },
  totalAmount: {
    ...typography.heading,
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
});
