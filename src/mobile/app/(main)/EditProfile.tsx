import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import { useToast } from 'react-native-toast-notifications';
import { useAppDispatch, useAppSelector } from '../../store/index';
import { updateProfile } from '../../store/slices/authSlice';
import { Input } from '../../components/Input';
import { CustomButton } from '../../components/Button';
import { ErrorDisplay } from '../../components/auth/ErrorDisplay';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { updateProfileSchema } from '../../utils/validationSchemas';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <CustomButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const initialValues = {
    name: user.name || '',
    surname: user.surname || '',
    contact_number: user.contact_number || '',
    address: user.address || '',
  };

  const handleUpdateProfile = async (values: typeof initialValues) => {
    try {
      await dispatch(updateProfile({
        name: values.name.trim(),
        surname: values.surname.trim(),
        contact_number: values.contact_number.trim(),
        address: values.address?.trim() || undefined,
      }));

      toast.show('Profile updated successfully!', {
        type: 'success',
        duration: 3000,
      });

      navigation.goBack();
    } catch (error: any) {
      // Error is already set in Redux state, ErrorDisplay will show it
      console.error('Profile update error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <View style={styles.errorContainer}>
              <ErrorDisplay error={error} />
            </View>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={updateProfileSchema}
            onSubmit={handleUpdateProfile}
            enableReinitialize
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                {/* Name Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>First Name</Text>
                  <Input
                    placeholder="Enter your first name"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    autoCapitalize="words"
                  />
                  {errors.name && touched.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                {/* Surname Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Last Name</Text>
                  <Input
                    placeholder="Enter your last name"
                    value={values.surname}
                    onChangeText={handleChange('surname')}
                    onBlur={handleBlur('surname')}
                    autoCapitalize="words"
                  />
                  {errors.surname && touched.surname && (
                    <Text style={styles.errorText}>{errors.surname}</Text>
                  )}
                </View>

                {/* Contact Number Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Contact Number</Text>
                  <Input
                    placeholder="Enter your contact number"
                    value={values.contact_number}
                    onChangeText={handleChange('contact_number')}
                    onBlur={handleBlur('contact_number')}
                    keyboardType="phone-pad"
                  />
                  {errors.contact_number && touched.contact_number && (
                    <Text style={styles.errorText}>{errors.contact_number}</Text>
                  )}
                </View>

                {/* Address Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Address (Optional)</Text>
                  <Input
                    placeholder="Enter your delivery address"
                    value={values.address}
                    onChangeText={handleChange('address')}
                    onBlur={handleBlur('address')}
                    autoCapitalize="words"
                  />
                  {errors.address && touched.address && (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  )}
                </View>

                {/* Email Display (Read-only) */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.readOnlyContainer}>
                    <Text style={styles.readOnlyText}>{user.email}</Text>
                    <Ionicons name="lock-closed-outline" size={16} color={colors.textSecondary} />
                  </View>
                  <Text style={styles.helperText}>
                    Email cannot be changed. Contact support if you need to update your email.
                  </Text>
                </View>

                {/* Submit Button */}
                <View style={styles.buttonContainer}>
                  <CustomButton
                    title={isLoading ? 'Updating...' : 'Save Changes'}
                    onPress={handleSubmit}
                    variant="primary"
                    disabled={isLoading}
                  />
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    fontSize: 24,
  },
  content: {
    padding: 20,
    paddingTop: 8,
  },
  errorContainer: {
    marginBottom: 16,
  },
  form: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  errorText: {
    ...typography.caption,
    color: '#D32F2F',
    marginTop: 4,
    fontSize: 12,
  },
  readOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.appBackground,
  },
  readOnlyText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 16,
    flex: 1,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
});
