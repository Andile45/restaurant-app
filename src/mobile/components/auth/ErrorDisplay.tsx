import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorDisplayProps {
  error: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{error}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    marginTop: 32,
  },
  text: {
    color: '#D32F2F',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});
