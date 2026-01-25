import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../../store/index';
import { Formik } from 'formik';
import { AuthScreenLayout } from '../../components/auth/AuthScreenLayout';
import { ErrorDisplay } from '../../components/auth/ErrorDisplay';
import { Input } from '../../components/Input';
import { CustomButton } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { colors } from '../../theme/colors';
import { resetUserPassword, setError } from '../../store/slices/authSlice';
import type { RootState } from '../../store/index';
import { forgotPasswordSchema } from '../../utils/validationSchemas';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { error } = useSelector((state: RootState) => state.auth);
  const [emailSent, setEmailSent] = React.useState(false);

  // Clear error when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      dispatch(setError(null));
    }, [dispatch])
  );

  const handleResetPassword = async (values: { email: string }) => {
    try {
      await dispatch(resetUserPassword(values.email));
      setEmailSent(true);
      Alert.alert(
        'Email Sent',
        'Please check your email for password reset instructions.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login' as never),
          },
        ]
      );
    } catch (err) {
      // Error is handled by Redux state
    }
  };

  return (
    <AuthScreenLayout
      title="Forgot Password"
      description="Enter your email address to receive a reset link and regain access to your account."
      backButton={
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      }
    >
      <ErrorDisplay error={error} />

      {emailSent ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            Password reset email has been sent! Please check your inbox.
          </Text>
        </View>
      ) : (
        <Formik
          initialValues={{ email: '' }}
          validationSchema={forgotPasswordSchema}
          onSubmit={handleResetPassword}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View>
              <Input
                placeholder="Email address"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Icon name="envelope" />}
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <CustomButton
                title="Continue"
                onPress={handleSubmit}
                variant="primary"
                style={styles.continueButton}
              />
            </View>
          )}
        </Formik>
      )}
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: -4,
    marginBottom: 8,
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#2E7D32',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  continueButton: {
    marginTop: 16,
  },
});
