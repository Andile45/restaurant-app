import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/index';
import { Formik } from 'formik';
import { AuthScreenLayout } from '../../components/auth/AuthScreenLayout';
import { ErrorDisplay } from '../../components/auth/ErrorDisplay';
import { Checkbox } from '../../components/auth/Checkbox';
import { Divider } from '../../components/auth/Divider';
import { AuthFooter } from '../../components/auth/AuthFooter';
import { SocialLoginIcons } from '../../components/auth/SocialLoginIcons';
import { Input } from '../../components/Input';
import { CustomButton } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { colors } from '../../theme/colors';
import { loginUser, loginWithGoogle, setError } from '../../store/slices/authSlice';
import type { RootState } from '../../store/index';
import { loginSchema } from '../../utils/validationSchemas';

export default function LoginScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { error } = useSelector((state: RootState) => state.auth);
  const [rememberMe, setRememberMe] = useState(false);

  // Clear error when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      dispatch(setError(null));
    }, [dispatch])
  );

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await dispatch(loginUser(values.email, values.password));
    } catch (err) {
      // Error is handled by Redux state
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await dispatch(loginWithGoogle());
    } catch (err) {
      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  return (
    <AuthScreenLayout
      title="Log in"
      description="Enter your email and password to securely access your account and manage your services."
      backButton={
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.canGoBack() && navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      }
    >
      <ErrorDisplay error={error} />

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={loginSchema}
        onSubmit={handleLogin}
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

            <Input
              placeholder="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              secureTextEntry
              autoCapitalize="none"
              leftIcon={<Icon name="lock" />}
            />
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <View style={styles.optionsRow}>
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onToggle={() => setRememberMe(!rememberMe)}
              />

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>Forgot Password</Text>
              </TouchableOpacity>
            </View>

            <CustomButton
              title="Login"
              onPress={handleSubmit}
              variant="primary"
              style={styles.loginButton}
            />
          </View>
        )}
      </Formik>

      <AuthFooter
        questionText="Don't have an account?"
        linkText="Sign Up here"
        onLinkPress={() => navigation.navigate('Register' as never)}
      />

      <Divider />

      <SocialLoginIcons
        onGooglePress={handleGoogleLogin}
      />
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  forgotPassword: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: colors.primary,
  },
  loginButton: {
    marginTop: 16,
  },
});
