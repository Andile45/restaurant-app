import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store/index';
import { logoutUser } from '../../store/slices/authSlice';
import { CustomButton } from '../../components/Button';
import { BrandLogo } from '../../components/BrandLogo';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type RootStackParamList = {
  EditProfile: undefined;
};

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logoutUser()),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <BrandLogo variant="small" />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {user && (
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
                {user.surname.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.name}>
              {user.name} {user.surname}
            </Text>
            <Text style={styles.email}>{user.email}</Text>
            {user.contact_number && (
              <Text style={styles.contact}>{user.contact_number}</Text>
            )}
            {user.address && (
              <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.address}>{user.address}</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.section}>
          <CustomButton
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
            variant="primary"
            style={styles.editButton}
          />
        </View>

        <View style={styles.section}>
          <CustomButton
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
          />
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
  header: {
    padding: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  content: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    ...typography.heading,
    color: colors.textInverse,
    fontSize: 32,
  },
  name: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  contact: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    maxWidth: '90%',
  },
  address: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  editButton: {
    marginBottom: 0,
  },
});
