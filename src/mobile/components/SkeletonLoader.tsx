import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius } from '../theme/colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  variant?: 'text' | 'card' | 'circle' | 'custom';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius: customBorderRadius,
  style,
  variant = 'custom',
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getBorderRadius = () => {
    if (customBorderRadius !== undefined) return customBorderRadius;
    switch (variant) {
      case 'circle':
        return 9999;
      case 'card':
        return borderRadius.md;
      case 'text':
        return borderRadius.sm;
      default:
        return borderRadius.sm;
    }
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: getBorderRadius(),
          opacity,
        },
        style,
      ]}
    />
  );
};

// Predefined skeleton variants
export const SkeletonText = ({ lines = 1, style }: { lines?: number; style?: any }) => (
  <View style={style}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLoader
        key={index}
        variant="text"
        height={16}
        width={index === lines - 1 ? '80%' : '100%'}
        style={{ marginBottom: index < lines - 1 ? spacing.sm : 0 }}
      />
    ))}
  </View>
);

export const SkeletonCard = ({ style }: { style?: any }) => (
  <View style={[styles.cardSkeleton, style]}>
    <SkeletonLoader variant="card" height={120} width="100%" style={{ marginBottom: spacing.md }} />
    <SkeletonText lines={2} style={{ marginBottom: spacing.sm }} />
    <View style={styles.cardFooter}>
      <SkeletonLoader variant="text" height={20} width={80} />
      <SkeletonLoader variant="circle" height={32} width={32} />
    </View>
  </View>
);

export const SkeletonFoodItem = () => (
  <View style={styles.foodItemSkeleton}>
    <SkeletonLoader variant="card" height={120} width="100%" />
    <View style={styles.foodItemContent}>
      <SkeletonLoader variant="text" height={18} width="90%" style={{ marginBottom: spacing.xs }} />
      <SkeletonLoader variant="text" height={14} width="70%" style={{ marginBottom: spacing.sm }} />
      <View style={styles.foodItemFooter}>
        <SkeletonLoader variant="text" height={18} width={60} />
        <SkeletonLoader variant="circle" height={32} width={32} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
  },
  cardSkeleton: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodItemSkeleton: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  foodItemContent: {
    padding: spacing.md,
  },
  foodItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
