import { useState, useEffect, createContext, useContext } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '../utils/supabase';
import COLORS from '../constants/colors';

// Auth context for managing authentication state
interface AuthContextProps {
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  isLoading: true,
  signOut: async () => { }
});

// Hook to access auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth provider component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const segments = useSegments();
  const router = useRouter();

  // Sign out function that can be accessed throughout the app
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (error: any) {
      Alert.alert('Error signing out', error.message || 'An unexpected error occurred');
    }
  };

  useEffect(() => {
    // Setup Supabase auth state listener
    const initializeAuth = async () => {
      try {
        // Clear session if there's an invalid refresh token to prevent loops
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          // If there's an error like "Invalid Refresh Token", sign out to reset the state
          console.error('Auth error:', error.message);

          if (error.message.includes('Refresh Token')) {
            // Clear the invalid session
            await signOut();
          }
        }

        setSession(currentSession);
      } catch (e) {
        console.error('Failed to initialize auth:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);

      // Handle specific auth events
      if (event === 'SIGNED_OUT') {
        setSession(null);
      } else if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        setSession(newSession);
      } else if (event === 'INITIAL_SESSION') {
        setSession(newSession);
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Route protection based on auth state
  useEffect(() => {
    if (isLoading) return;

    const isOnLoginScreen = segments[0] === "login";

    if (!session && !isOnLoginScreen) {
      // Redirect to login if not authenticated
      router.replace("/login");
    } else if (session && isOnLoginScreen) {
      // Redirect to main app if authenticated and on login page
      router.replace("/");
    }
  }, [session, segments, isLoading]);

  return (
    <AuthContext.Provider value={{ session, isLoading, signOut }}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="+not-found" options={{ headerShown: true }} />
      </Stack>
    </AuthProvider>
  );
}
