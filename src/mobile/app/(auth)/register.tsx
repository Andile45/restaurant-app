import React, { useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useToast } from 'react-native-toast-notifications';
import { useAppDispatch } from '../../store/index';
import { Formik } from 'formik';
import { AuthScreenLayout } from '../../components/auth/AuthScreenLayout';
import { ErrorDisplay } from '../../components/auth/ErrorDisplay';
import { SuccessDisplay } from '../../components/auth/SuccessDisplay';
import { Divider } from '../../components/auth/Divider';
import { AuthFooter } from '../../components/auth/AuthFooter';
import { SocialLoginIcons } from '../../components/auth/SocialLoginIcons';
import { CustomButton } from '../../components/Button';
import { RegisterFormFields } from '../../components/auth/RegisterFormFields';
import { colors } from '../../theme/colors';
import { registerUser, loginWithGoogle, setError, clearRegistrationSuccess } from '../../store/slices/authSlice';
import type { RootState } from '../../store/index';
import { registerSchema } from '../../utils/validationSchemas';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { error, registrationSuccess, registrationEmail } = useSelector((state: RootState) => state.auth);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(setError(null));
      dispatch(clearRegistrationSuccess());
    }, [dispatch])
  );

  useEffect(() => {
    if (registrationSuccess && registrationEmail) {
      toast.show(
        `Account created successfully!\nPlease check your email (${registrationEmail}) and click the confirmation link to activate your account.`,
        {
          type: 'success',
          duration: 6000,
        }
      );
      setTimeout(() => {
        dispatch(clearRegistrationSuccess());
      }, 100);
    }
  }, [registrationSuccess, registrationEmail, toast, dispatch]);

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
        {registrationSuccess && registrationEmail && (
          <SuccessDisplay
            message="Account created successfully!"
            description={`Please check your email (${registrationEmail}) and click the confirmation link to activate your account. Once confirmed, you can sign in.`}
          />
        )}

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
              <RegisterFormFields
                values={values}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />

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
  registerButton: {
    marginTop: 8,
  },
});
