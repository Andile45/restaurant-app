import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useAppSelector } from '../../store/index';

export default function HomeScreen() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome back, {user?.name}!</Text>
        <Text style={styles.subtitle}>What would you like to order today?</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Featured items coming soon</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  content: {
    padding: 20,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  placeholder: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
