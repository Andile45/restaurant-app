const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  expo: {
    name: "mobile",
    slug: "mobile",
    version: "1.0.0",
    main: "index.ts",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "restaurant-app",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.restaurantapp.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.restaurantapp.mobile",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "restaurant-app"
            }
          ],
          category: [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-font"
    ],
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      paystackPublicKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY,
    }
  }
};
