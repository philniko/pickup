import { useState } from 'react';
import { Alert, StyleSheet, View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, Dimensions, Image, ScrollView } from 'react-native';
import { supabase } from '../utils/supabase';
import { Stack } from 'expo-router';
import COLORS from '../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register, default to Create Account

  async function handleSignUp() {
    // Validate all required fields for signup
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!firstName || !lastName) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Only use window.location on web platforms
          emailRedirectTo: Platform.OS === 'web' ? window.location?.origin : undefined,
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`
          }
        }
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to sign up. Please try again.');
      } else if (data?.user) {
        // Show success message and then switch to login view
        Alert.alert(
          'Success',
          'Verification email sent! Please check your email to confirm your account.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Switch to login view
                setIsLogin(true);
                // Optionally pre-fill the email for convenience
                // (password field will be empty for security reasons)
              }
            }
          ]
        );
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to sign in. Please try again.');
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Logo and Header - clean design without wave */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.appName}>PickUp</Text>
            </View>

            {/* Auth Form */}
            <View style={styles.formContainer}>
              <Text style={styles.header}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>

              {/* First Name Input - Only visible when registering */}
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={COLORS.text} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    placeholderTextColor="#9E9E9E"
                  />
                </View>
              )}

              {/* Last Name Input - Only visible when registering */}
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={COLORS.text} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    placeholderTextColor="#9E9E9E"
                  />
                </View>
              )}

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={COLORS.text} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#9E9E9E"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.text} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  placeholderTextColor="#9E9E9E"
                />
              </View>

              {/* Main Action Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={isLogin ? handleSignIn : handleSignUp}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>

              {/* Social Login Section */}
              <View style={styles.socialContainer}>
                <Text style={styles.socialText}>Or continue with</Text>

                <View style={styles.socialButtonsRow}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-google" size={22} color="#DB4437" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-apple" size={22} color="#000000" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-facebook" size={22} color="#4267B2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Toggle Login/Register */}
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setIsLogin(!isLogin)}
              >
                <Text style={styles.toggleTextPrefix}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </Text>
                <Text style={styles.toggleTextAction}>
                  {isLogin ? "Sign Up" : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50, // Add extra padding at the bottom
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.05, // Reduced to use less vertical space
    marginBottom: height * 0.03, // Reduced to use less vertical space
  },
  logo: {
    width: 100, // Slightly smaller logo
    height: 100, // Slightly smaller logo
    marginBottom: 5,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 5, // Reduced margin
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  header: {
    fontSize: 22, // Slightly smaller header
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20, // Reduced margin
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    marginBottom: 12, // Slightly reduced spacing
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12, // Slightly smaller input height
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15, // Slightly smaller button
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  socialContainer: {
    marginTop: 24, // Reduced margin
    alignItems: 'center',
  },
  socialText: {
    color: '#9E9E9E',
    fontSize: 14,
    marginBottom: 12, // Reduced margin
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 45, // Slightly smaller social buttons
    height: 45, // Slightly smaller social buttons
    borderRadius: 23,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  toggleButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10, // Add bottom margin
  },
  toggleTextPrefix: {
    color: '#9E9E9E',
    fontSize: 14,
  },
  toggleTextAction: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
