import { useState } from 'react';
import { Alert, StyleSheet, View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, Dimensions, Image } from 'react-native';
import { supabase } from '../utils/supabase';
import { Stack } from 'expo-router';
import COLORS from '../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false); // Toggle between login and register, default to Create Account

  async function handleSignUp() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location?.origin ?? undefined,
        }
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to sign up. Please try again.');
      } else if (data?.user) {
        Alert.alert(
          'Success', 
          'Verification email sent! Please check your email to confirm your account.'
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
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: height * 0.05,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 5,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 10,
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    marginBottom: 16,
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
    paddingVertical: 14,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
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
    marginTop: 30,
    alignItems: 'center',
  },
  socialText: {
    color: '#9E9E9E',
    fontSize: 14,
    marginBottom: 16,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    marginTop: 30,
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