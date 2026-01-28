import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../Card';
import { BrandLogo } from '../BrandLogo';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface AuthScreenLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  backButton?: React.ReactNode;
}

export const AuthScreenLayout: React.FC<AuthScreenLayoutProps> = ({
  title,
  description,
  children,
  backButton,
}) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandContainer}>
            <BrandLogo variant="large" />
          </View>
          <Card style={styles.card}>
            <View style={styles.headerContainer}>
              <View style={styles.backButtonSide}>
                {backButton || <View />}
              </View>
              <Text style={styles.title}>
                {title}
              </Text>
              <View style={styles.backButtonSide} />
            </View>
            <Text style={styles.description}>{description}</Text>
            {children}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    width: '100%',
  },
  backButtonSide: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 13,
  },
});
