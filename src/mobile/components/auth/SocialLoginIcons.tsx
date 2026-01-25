import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface SocialLoginIconsProps {
  onFacebookPress?: () => void;
  onGooglePress?: () => void;
  onApplePress?: () => void;
}

export const SocialLoginIcons: React.FC<SocialLoginIconsProps> = ({
  onFacebookPress,
  onGooglePress,
  onApplePress,
}) => {
  return (
    <View style={styles.container}>
      {onFacebookPress && (
        <TouchableOpacity style={styles.iconButton} onPress={onFacebookPress}>
          <Ionicons name="logo-facebook" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
      {onGooglePress && (
        <TouchableOpacity style={styles.iconButton} onPress={onGooglePress}>
          <Ionicons name="logo-google" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
      {onApplePress && (
        <TouchableOpacity style={styles.iconButton} onPress={onApplePress}>
          <Ionicons name="logo-apple" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
