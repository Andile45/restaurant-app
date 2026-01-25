import React, { useState } from 'react';
import { TextInput, StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface InputProps {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: (e: any) => void;
  style?: ViewStyle;
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const Input = ({
  placeholder,
  value,
  onChangeText,
  onBlur,
  style,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const showPasswordToggle = secureTextEntry;

  return (
    <View style={[styles.container, style]}>
      {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
      <TextInput
        style={[
          styles.input,
          leftIcon ? styles.inputWithLeftIcon : null,
          (rightIcon || showPasswordToggle) ? styles.inputWithRightIcon : null,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {showPasswordToggle && (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Ionicons 
            name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'} 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      )}
      {rightIcon && !showPasswordToggle && (
        <View style={styles.rightIconContainer}>{rightIcon}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 4,
  },
  input: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  inputWithLeftIcon: {
    paddingLeft: 48,
  },
  inputWithRightIcon: {
    paddingRight: 48,
  },
  leftIconContainer: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  rightIconContainer: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
});
