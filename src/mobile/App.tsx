import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector } from 'react-redux';
import { ToastProvider } from 'react-native-toast-notifications';
import { store, useAppDispatch, type RootState } from './store/index';
import { checkAuthSession } from './store/slices/authSlice';
import { supabase } from './api/supabaseClient';
import { Loader } from './components/Loader';
import { colors } from './theme/colors';
import LoginScreen from './app/(auth)/login';
import RegisterScreen from './app/(auth)/register';
import ForgotPasswordScreen from './app/(auth)/forgotPassword';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import PaymentScreen from './app/(main)/Payment';
import OrderDetailsScreen from './app/(main)/OrderDetails';
import EditProfileScreen from './app/(main)/EditProfile';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuthSession());

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch(checkAuthSession());
      } else {
        dispatch(checkAuthSession());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  if (isLoading) {
    return <Loader fullscreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen 
              name="Payment" 
              component={PaymentScreen}
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Payment',
              }}
            />
            <Stack.Screen 
              name="OrderDetails" 
              component={OrderDetailsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ToastProvider
        placement="top"
        duration={4000}
        successColor={colors.primary}
        dangerColor="#D32F2F"
        warningColor="#FF9800"
        normalColor={colors.textSecondary}
        textStyle={{
          fontSize: 14,
          fontFamily: 'Inter_400Regular',
        }}
        style={{
          paddingHorizontal: 16,
        }}
      >
        <StatusBar style="auto" />
        <AppNavigator />
      </ToastProvider>
    </Provider>
  );
}
