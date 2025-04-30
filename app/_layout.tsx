import { useState, useEffect, createContext, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '../utils/supabase';
import COLORS from '../constants/colors';

// Auth context for managing authentication state
interface AuthContextProps {
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps>({ session: null, isLoading: true });

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

  useEffect(() => {
    // Setup Supabase auth state listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

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
    <AuthContext.Provider value={{ session, isLoading }}>
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