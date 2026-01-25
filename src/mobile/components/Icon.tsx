import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface IconProps {
  name: 'envelope' | 'lock' | 'person' | 'google' | 'call';
  size?: number;
  color?: string;
}

const iconMap = {
  envelope: 'mail-outline' as const,
  lock: 'lock-closed-outline' as const,
  person: 'person-outline' as const,
  google: 'logo-google' as const,
  call: 'call-outline' as const,
};

export const Icon = ({ name, size = 20, color = colors.textSecondary }: IconProps) => {
  if (name === 'google') {
    return (
      <Ionicons 
        name={iconMap[name]} 
        size={size} 
        color={color} 
      />
    );
  }

  return (
    <Ionicons 
      name={iconMap[name]} 
      size={size} 
      color={color} 
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
