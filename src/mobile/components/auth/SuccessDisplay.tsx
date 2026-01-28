import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface SuccessDisplayProps {
  message: string;
  description?: string;
}

export const SuccessDisplay: React.FC<SuccessDisplayProps> = ({ message, description }) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.message}>{message}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#2E7D32',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#4A4A4A',
    lineHeight: 18,
  },
});
