import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import COLORS from '../../constants/colors';
import { useAuth } from '../_layout';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: session?.user?.email || 'user@example.com',
    bio: 'Basketball and tennis enthusiast looking for pickup games in the area.',
    location: 'San Francisco, CA',
    joinDate: 'April 2025'
  });

  // Function to handle logout
  async function handleLogout() {
    setLoading(true);
    try {
      await signOut();
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  // Fetch user profile data from Supabase (placeholder for now)
  useEffect(() => {
    // Future implementation: Get user profile data from Supabase
    // For now we're using the placeholder data in userData state

    // Update email from session whenever session changes
    if (session?.user?.email) {
      setUserData(prev => ({
        ...prev,
        email: session.user.email || 'user@example.com'
      }));
    }

    // Try to get user metadata (name) if available
    if (session?.user?.user_metadata) {
      const metadata = session.user.user_metadata;
      if (metadata.full_name || (metadata.first_name && metadata.last_name)) {
        const displayName = metadata.full_name ||
          `${metadata.first_name} ${metadata.last_name}`;

        setUserData(prev => ({
          ...prev,
          name: displayName
        }));
      }
    }
  }, [session]);

  // Confirm logout dialog
  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image
              source={require('../../assets/images/default-avatar.jpg')}
              style={styles.profileImage}
              defaultSource={require('../../assets/images/default-avatar.jpg')}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
        </View>

        {/* Profile Bio */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={22} color={COLORS.text} />
            <Text style={styles.infoTitle}>About Me</Text>
          </View>
          <Text style={styles.infoBio}>{userData.bio}</Text>
        </View>

        {/* User Details */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="person-outline" size={22} color={COLORS.text} />
            <Text style={styles.infoTitle}>My Details</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.text} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{userData.location}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.text} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Joined</Text>
              <Text style={styles.infoValue}>{userData.joinDate}</Text>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="settings-outline" size={22} color={COLORS.text} />
            <Text style={styles.infoTitle}>Account</Text>
          </View>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color={COLORS.primary} style={styles.actionIcon} />
            <Text style={styles.actionText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} style={styles.actionIcon} />
            <Text style={styles.actionText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="shield-outline" size={20} color={COLORS.primary} style={styles.actionIcon} />
            <Text style={styles.actionText}>Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={confirmLogout}
          disabled={loading}
        >
          <Ionicons name="log-out-outline" size={20} color="white" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>{loading ? 'Logging out...' : 'Logout'}</Text>
        </TouchableOpacity>

        {/* App version */}
        <Text style={styles.versionText}>PickUp v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  infoBio: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
    width: 24,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionIcon: {
    marginRight: 12,
    width: 24,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#9E9E9E',
    fontSize: 12,
    marginBottom: 20,
  },
});
