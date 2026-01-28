import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { CustomButton } from '../Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatPrice } from '../../utils/formatPrice';
import type { FoodItem } from '../../../common/types/foodItem';

interface FoodItemCardProps {
  foodItem: FoodItem;
  onAddToCart: () => void;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({ foodItem, onAddToCart }) => {
  return (
    <Card style={styles.card}>
      {foodItem.image_url ? (
        <Image source={{ uri: foodItem.image_url }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="restaurant-outline" size={40} color={colors.textSecondary} />
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {foodItem.name}
        </Text>
        
        {foodItem.description && (
          <Text style={styles.description} numberOfLines={2}>
            {foodItem.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(foodItem.price)}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddToCart}
            disabled={!foodItem.is_available}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        {!foodItem.is_available && (
          <Text style={styles.unavailable}>Unavailable</Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  name: {
    ...typography.button,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    ...typography.button,
    color: colors.primary,
    fontSize: 16,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.textInverse,
    fontSize: 20,
    fontWeight: 'bold',
  },
  unavailable: {
    ...typography.captionSmall,
    color: colors.error,
    marginTop: 4,
  },
});
