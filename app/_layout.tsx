import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect } from 'react';
import { AuthProvider, useAuth } from "../context/AuthContext";
import "../global.css";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

function RootNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const isAuthPath = pathname === '/login' || pathname === '/signup';

    if (!user && !isAuthPath) {
      router.replace('/login');
    }

    if (user && isAuthPath) {
      router.replace('/');
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#09090b' }
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootNavigation />
        <StatusBar style="light" />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
