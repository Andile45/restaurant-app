import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector } from 'react-redux';
import { store, useAppDispatch, type RootState } from './store/index';
import { checkAuthSession } from './store/slices/authSlice';
import { Loader } from './components/Loader';
import LoginScreen from './app/(auth)/login';
import RegisterScreen from './app/(auth)/register';
import ForgotPasswordScreen from './app/(auth)/forgotPassword';
import BottomTabNavigator from './navigation/BottomTabNavigator';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuthSession());
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
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <AppNavigator />
    </Provider>
  );
}
