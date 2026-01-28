import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { FormikProps } from 'formik';
import { Input } from '../Input';
import { Icon } from '../Icon';

interface RegisterFormValues {
  name: string;
  surname: string;
  email: string;
  contact_number: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormFieldsProps {
  values: RegisterFormValues;
  errors: Partial<Record<keyof RegisterFormValues, string>>;
  touched: Partial<Record<keyof RegisterFormValues, boolean>>;
  handleChange: FormikProps<RegisterFormValues>['handleChange'] | ((field: string) => (text: string) => void);
  handleBlur: FormikProps<RegisterFormValues>['handleBlur'] | ((field: string) => () => void);
}

export const RegisterFormFields: React.FC<RegisterFormFieldsProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
}) => {
  return (
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
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: -2,
    marginBottom: 4,
  },
});
