import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store/index';
import { updateQuantity, removeFromCart, clearCart } from '../../store/slices/cartSlice';
import { createOrder } from '../../store/slices/orderSlice';
import { CustomButton } from '../../components/Button';
import { CartItemCard } from '../../components/cart/CartItemCard';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatPrice } from '../../utils/formatPrice';

type RootStackParamList = {
  Payment: {
    orderId: string;
    amount: number;
    email: string;
  };
  MainTabs: {
    screen?: string;
  };
};

export default function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading } = useAppSelector((state) => state.order);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleUpdateQuantity = (cartItemId: string, quantity: number) => {
    dispatch(updateQuantity({ cartItemId, quantity }));
  };

  const handleRemoveItem = (cartItemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(removeFromCart(cartItemId)),
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to checkout');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderItems = items.map((item) => ({
        food_id: item.id,
        quantity: item.quantity,
        extras: item.extras || {},
        price: item.price,
      }));

      const order = await dispatch(createOrder(user.id, orderItems, total, user.address || undefined));
      
      if (order && order.id) {
        navigation.navigate('Payment', {
          orderId: order.id,
          amount: total,
          email: user.email,
        });
      } else {
        Alert.alert('Error', 'Failed to create order. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create order');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
        {items.length > 0 && (
          <Text style={styles.itemCount}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
        )}
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          message="Add items from the menu to get started"
          actionLabel="Browse Menu"
          onAction={() => {
            (navigation as any).navigate('MainTabs', { screen: 'Menu' });
          }}
          variant="info"
        />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <CartItemCard
                key={item.cartItemId}
                item={item}
                onUpdateQuantity={(quantity) => handleUpdateQuantity(item.cartItemId, quantity)}
                onRemove={() => handleRemoveItem(item.cartItemId)}
              />
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
            </View>
            <CustomButton
              title="Checkout"
              onPress={handleCheckout}
              variant="primary"
              loading={isCheckingOut || isLoading}
              disabled={isCheckingOut || isLoading}
              rightIcon="arrow-forward"
              style={styles.checkoutButton}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  itemCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 20,
    paddingBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    ...typography.heading,
    color: colors.textPrimary,
    fontSize: 20,
  },
  totalAmount: {
    ...typography.heading,
    color: colors.primary,
    fontSize: 24,
  },
  checkoutButton: {
    marginTop: 0,
  },
});
