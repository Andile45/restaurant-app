import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatPrice } from '../../utils/formatPrice';

interface RecentFavoriteCardProps {
  name: string;
  price: number;
  imageUrl?: string;
  onPress?: () => void;
}

export const RecentFavoriteCard: React.FC<RecentFavoriteCardProps> = ({
  name,
  price,
  imageUrl,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${formatPrice(price)}`}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="restaurant-outline" size={32} color={colors.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.price}>{formatPrice(price)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: 12,
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: colors.secondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.secondary,
  },
  content: {
    padding: 12,
  },
  name: {
    ...typography.button,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});
