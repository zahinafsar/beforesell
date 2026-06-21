import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ComponentProps } from 'react';
import { useColorScheme } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { CallOverlay } from '@/components/call-overlay';
import { useMessageNotifications } from '@/hooks/use-message-notifications';
import { useRegisterPresence } from '@/hooks/use-presence';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { CallProvider } from '@/lib/call-context';
import { syncProfile } from '@/lib/profile';
import { getPendingChat, setPendingChat } from '@/lib/push';

const queryClient = new QueryClient();

function RootNavigator() {
  const { user, loading } = useAuth();

  // Broadcast this user's online/offline presence while signed in.
  useRegisterPresence(user?.id);
  // Foreground new-message heads-up + notification taps.
  useMessageNotifications();

  // Mirror our profile (name/avatar) to Firestore for others' conversation lists.
  useEffect(() => {
    if (user) syncProfile(user);
  }, [user]);

  // If launched from a message notification, open that chat once signed in.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const chat = await getPendingChat();
      if (!chat) return;
      await setPendingChat(null);
      router.push({ pathname: '/chat/[id]', params: { id: chat.peerId, name: chat.peerName } });
    })();
  }, [user]);

  // While restoring the session, keep the splash overlay up and render nothing.
  if (loading) return null;

  const isAuthed = !!user;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthed}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthed}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // RN 0.85 ColorValue typings drift from @react-navigation's Theme; assert the prop type.
  const navTheme = (colorScheme === 'dark' ? DarkTheme : DefaultTheme) as ComponentProps<
    typeof ThemeProvider
  >['value'];

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider value={navTheme}>
              <CallProvider>
                {/* Adapts status-bar icon colour to the theme (dark icons in light mode). */}
                <StatusBar style="auto" />
                <AnimatedSplashOverlay />
                <RootNavigator />
                <CallOverlay />
              </CallProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
