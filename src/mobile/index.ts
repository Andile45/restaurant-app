/**
 * Mobile app entry point.
 * Keeps the native splash visible until App.tsx hides it after fonts/ready, then registers the root component.
 */
import * as SplashScreen from 'expo-splash-screen';
import { registerRootComponent } from 'expo';

import App from './App';

// Prevent Expo from auto-hiding the splash; App.tsx hides it when fonts are loaded and min time has passed
SplashScreen.preventAutoHideAsync();

// Registers this component as the root for both Expo Go and native builds
registerRootComponent(App);
