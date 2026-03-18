const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  expo: {
    name: "Bite X",
    slug: "mobile",
    version: "1.0.0",
    main: "index.ts",
    orientation: "portrait",
    icon: "./assets/images/splash-icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "restaurant-app",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#00B4BF"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.restaurantapp.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/splash-icon.png",
        backgroundColor: "#00B4BF"
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
      favicon: "./assets/images/splash-icon.png"
    },
    plugins: [
      "expo-font"
    ],
    extra: {
      eas: {
        projectId: "dd114de3-f192-4522-b3d9-da23a25aead9"
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      paystackPublicKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY,
      googlePlacesApiKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
    }
  }
};
