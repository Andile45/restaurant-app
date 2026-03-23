import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store/index';
import { fetchUserOrders } from '../../store/slices/orderSlice';
import { OrderCard } from '../../components/orders/OrderCard';
import { SearchBar } from '../../components/home/SearchBar';
import { Loader } from '../../components/Loader';
import { ErrorDisplay } from '../../components/auth/ErrorDisplay';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import type { Order } from '../../../common/types/order';

type RootStackParamList = {
  OrderDetails: {
    orderId: string;
  };
};

type OrderStatus = Order['status'] | 'all';
type SortOption = 'newest' | 'oldest' | 'amount-high' | 'amount-low';

export default function OrdersScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAppSelector((state) => state.auth);
  const { orders, isLoading, error } = useAppSelector((state) => state.order);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserOrders(user.id));
    }
  }, [dispatch, user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await dispatch(fetchUserOrders(user.id));
    }
    setRefreshing(false);
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'amount-high':
          return b.total - a.total;
        case 'amount-low':
          return a.total - b.total;
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, statusFilter, sortOption, searchQuery]);

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'newest':
        return 'Newest First';
      case 'oldest':
        return 'Oldest First';
      case 'amount-high':
        return 'Amount: High to Low';
      case 'amount-low':
        return 'Amount: Low to High';
      default:
        return 'Newest First';
    }
  };

  if (isLoading && orders.length === 0) {
    return <Loader fullscreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Orders</Text>
          {orders.length > 0 && (
            <Text style={styles.subtitle}>
              {filteredAndSortedOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <ErrorDisplay error={error} />
        </View>
      )}

      {orders.length > 0 && (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchBar
              placeholder="Search by order ID..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
            style={styles.filterScrollView}
          >
            {(
              [
                'all',
                'pending',
                'payment_failed',
                'new',
                'preparing',
                'ready',
                'completed',
                'cancelled',
              ] as OrderStatus[]
            ).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  statusFilter === status && styles.filterChipActive,
                ]}
                onPress={() => setStatusFilter(status)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    statusFilter === status && styles.filterChipTextActive,
                  ]}
                >
                  {status === 'all'
                    ? 'All'
                    : status === 'pending'
                      ? 'Pending payment'
                      : status === 'payment_failed'
                        ? 'Payment failed'
                        : status === 'new'
                          ? 'Pending preparation'
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sort Button */}
          <View style={styles.sortContainer}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortModal(true)}
            >
              <Ionicons name="swap-vertical-outline" size={18} color={colors.textPrimary} />
              <Text style={styles.sortButtonText}>{getSortLabel(sortOption)}</Text>
              <Ionicons name="chevron-down-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </>
      )}

      {orders.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No orders yet"
          message="Your order history will appear here once you place an order"
          variant="info"
        />
      ) : filteredAndSortedOrders.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No orders found"
          message="Try adjusting your filters or search query"
          variant="info"
        />
      ) : (
        <FlatList
          data={filteredAndSortedOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => {
                navigation.navigate('OrderDetails', { orderId: item.id });
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Orders</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close-outline" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            {(['newest', 'oldest', 'amount-high', 'amount-low'] as SortOption[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOption,
                  sortOption === option && styles.sortOptionActive,
                ]}
                onPress={() => {
                  setSortOption(option);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortOption === option && styles.sortOptionTextActive,
                  ]}
                >
                  {getSortLabel(option)}
                </Text>
                {sortOption === option && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  errorContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  filterScrollView: {
    maxHeight: 60,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  sortContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    fontSize: 20,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.appBackground,
  },
  sortOptionActive: {
    backgroundColor: `${colors.primary}15`,
  },
  sortOptionText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
  },
  sortOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
