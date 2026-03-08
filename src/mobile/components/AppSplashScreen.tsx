import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const SPLASH_LOGO = require('../assets/images/splash-icon.png');

export function AppSplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={SPLASH_LOGO}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="App logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
  },
});
