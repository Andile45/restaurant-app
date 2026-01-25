import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import HomeScreen from '../app/(main)/Home';
import MenuScreen from '../app/(main)/Menu';
import CartScreen from '../app/(main)/Cart';
import OrdersScreen from '../app/(main)/Orders';
import ProfileScreen from '../app/(main)/Profile';
import { useAppSelector } from '../store/index';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) => (
  <Ionicons
    name={name}
    size={24}
    color={focused ? colors.primary : colors.textSecondary}
  />
);

export default function BottomTabNavigator() {
  const cartItemCount = useAppSelector((state) => state.cart.items.length);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          ...typography.caption,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'restaurant' : 'restaurant-outline'} focused={focused} />,
          tabBarLabel: 'Menu',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'cart' : 'cart-outline'} focused={focused} />,
          tabBarLabel: 'Cart',
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'receipt' : 'receipt-outline'} focused={focused} />,
          tabBarLabel: 'Orders',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
