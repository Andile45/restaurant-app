import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface QuantityControlsProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
}

export const QuantityControls: React.FC<QuantityControlsProps> = ({
  quantity,
  onDecrease,
  onIncrease,
  min = 1,
  max = 99,
}) => {
  const canDecrease = quantity > min;
  const canIncrease = quantity < max;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !canDecrease && styles.buttonDisabled]}
        onPress={onDecrease}
        disabled={!canDecrease}
      >
        <Text style={[styles.buttonText, !canDecrease && styles.buttonTextDisabled]}>−</Text>
      </TouchableOpacity>
      
      <Text style={styles.quantity}>{quantity}</Text>
      
      <TouchableOpacity
        style={[styles.button, !canIncrease && styles.buttonDisabled]}
        onPress={onIncrease}
        disabled={!canIncrease}
      >
        <Text style={[styles.buttonText, !canIncrease && styles.buttonTextDisabled]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  buttonTextDisabled: {
    color: colors.textSecondary,
  },
  quantity: {
    ...typography.button,
    color: colors.textPrimary,
    minWidth: 30,
    textAlign: 'center',
  },
});
