import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Icon } from '../Icon';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface GoogleButtonProps {
  onPress: () => void;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="google" size={18} color={colors.textPrimary} />
        </View>
        <Text style={styles.text}>Continue with Google</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 25,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  text: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
