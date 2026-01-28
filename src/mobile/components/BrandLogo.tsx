import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface BrandLogoProps {
  variant?: 'default' | 'large' | 'small' | 'compact';
  showIcon?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'default',
  showIcon = false,
  style,
  textStyle,
  color = colors.primary,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'large':
        return {
          fontSize: 32,
          fontWeight: 'bold' as const,
          letterSpacing: 1,
        };
      case 'small':
        return {
          fontSize: 16,
          fontWeight: 'bold' as const,
          letterSpacing: 0.5,
        };
      case 'compact':
        return {
          fontSize: 14,
          fontWeight: 'bold' as const,
          letterSpacing: 0.3,
        };
      default:
        return {
          fontSize: 24,
          fontWeight: 'bold' as const,
          letterSpacing: 0.8,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <View style={[styles.icon, { backgroundColor: color }]} />
      )}
      <Text
        style={[
          styles.text,
          variantStyles,
          { color },
          textStyle,
        ]}
      >
        BiteX
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  text: {
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
});
