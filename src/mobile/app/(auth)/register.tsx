import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/index';
import { Formik } from 'formik';
import { AuthScreenLayout } from '../../components/auth/AuthScreenLayout';
import { ErrorDisplay } from '../../components/auth/ErrorDisplay';
import { Divider } from '../../components/auth/Divider';
import { AuthFooter } from '../../components/auth/AuthFooter';
import { SocialLoginIcons } from '../../components/auth/SocialLoginIcons';
import { Input } from '../../components/Input';
import { CustomButton } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { colors } from '../../theme/colors';
import { registerUser, loginWithGoogle, setError } from '../../store/slices/authSlice';
import type { RootState } from '../../store/index';
import { registerSchema } from '../../utils/validationSchemas';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { error } = useSelector((state: RootState) => state.auth);

  // Clear error when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      dispatch(setError(null));
    }, [dispatch])
  );

  const handleRegister = async (values: {
    name: string;
    surname: string;
    email: string;
    contact_number: string;
    password: string;
  }) => {
    try {
      await dispatch(
        registerUser(
          values.email,
          values.password,
          values.name.trim(),
          values.surname.trim(),
          values.contact_number.trim()
        )
      );
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

  return (
    <AuthScreenLayout
      title="Create Account"
      description="Create a new account to get started and enjoy seamless access to our features."
      backButton={
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.canGoBack() && navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      }
    >
      <View style={styles.cardContainer}>
        <ErrorDisplay error={error} />

      <Formik
        initialValues={{ 
          name: '', 
          surname: '', 
          email: '', 
          contact_number: '', 
          password: '', 
          confirmPassword: '' 
        }}
        validationSchema={registerSchema}
        onSubmit={(values) => handleRegister(values)}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            <Input
              placeholder="Name"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              autoCapitalize="words"
              leftIcon={<Icon name="person" />}
            />
            {touched.name && errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}

            <Input
              placeholder="Surname"
              value={values.surname}
              onChangeText={handleChange('surname')}
              onBlur={handleBlur('surname')}
              autoCapitalize="words"
              leftIcon={<Icon name="person" />}
            />
            {touched.surname && errors.surname && (
              <Text style={styles.errorText}>{errors.surname}</Text>
            )}

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
              placeholder="Contact number"
              value={values.contact_number}
              onChangeText={handleChange('contact_number')}
              onBlur={handleBlur('contact_number')}
              keyboardType="phone-pad"
              autoCapitalize="none"
              leftIcon={<Icon name="call" />}
            />
            {touched.contact_number && errors.contact_number && (
              <Text style={styles.errorText}>{errors.contact_number}</Text>
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

            <Input
              placeholder="Confirm Password"
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              secureTextEntry
              autoCapitalize="none"
              leftIcon={<Icon name="lock" />}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            <CustomButton
              title="Create Account"
              onPress={handleSubmit}
              variant="primary"
              style={styles.registerButton}
            />
          </View>
        )}
      </Formik>

      <AuthFooter
        questionText="Already have an account?"
        linkText="Sign In here"
        onLinkPress={() => navigation.navigate('Login' as never)}
      />

      <Divider />

      <SocialLoginIcons
        onGooglePress={handleGoogleLogin}
      />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
  },
  backButton: {
    padding: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: -2,
    marginBottom: 4,
  },
  registerButton: {
    marginTop: 8,
  },
});
