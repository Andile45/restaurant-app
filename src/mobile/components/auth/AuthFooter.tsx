import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface AuthFooterProps {
  questionText: string;
  linkText: string;
  onLinkPress: () => void;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  questionText,
  linkText,
  onLinkPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{questionText} </Text>
      <TouchableOpacity onPress={onLinkPress}>
        <Text style={styles.link}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
  },
  link: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
