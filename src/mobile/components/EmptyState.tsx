import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme/colors';
import { typography } from '../theme/typography';
import { CustomButton } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'error' | 'success' | 'info';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  variant = 'default',
}) => {
  const getIconName = () => {
    if (icon) return icon;
    switch (variant) {
      case 'error':
        return 'alert-circle-outline';
      case 'success':
        return 'checkmark-circle-outline';
      case 'info':
        return 'information-circle-outline';
      default:
        return 'document-outline';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'info':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}15` }]}>
        <Ionicons name={getIconName()} size={64} color={getIconColor()} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <View style={styles.actionContainer}>
          <CustomButton
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            size="medium"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxxxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: spacing.md,
  },
});
