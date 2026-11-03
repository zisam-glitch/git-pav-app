import { useEffect } from "react";
import { AppState, AppStateStatus, StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "expo-router/react-navigation";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useAuthStore } from "@/features/auth/auth-store";
import { tokenStore } from "@/lib/token-store";
import { authApi } from "@/features/auth/auth-api";
import { useAppLockStore } from "@/features/app-lock/app-lock-store";
import { AppLockScreen } from "@/features/app-lock/app-lock-screen";
import { useNotificationManager } from "@/features/notifications/notification-hooks";
import { initErrorTracking, reportError } from "@/lib/error-tracking";
import { ThemedText, Button, OfflineBanner, navTheme } from "@/components";
import { setupNetworkMonitoring } from "@/lib/network";
// Registers the van shift background-location task (D-21) at start-up.
import "@/features/van/background-location";
import { colors, spacing } from "@/theme";
import { PRACTICE_CONFIG } from "@/config/practice";

initErrorTracking();

const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_STRIPE_PK ?? "";


// ─── Notification registrar ──────────────────────────────────────────────────
// Rendered inside QueryClientProvider: useNotificationManager uses React Query
// hooks, so it must live below the provider (not in RootLayout's own body).
function NotificationSetup() {
  const { setupNotifications } = useNotificationManager();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken || __DEV__) return;
    setupNotifications().catch(() => {});
  }, [accessToken]);

  return null;
}

// ─── Error boundary ───────────────────────────────────────────────────────────
// Expo Router renders this when a screen throws. The error is reported
// (scrubbed, see lib/error-tracking) and the person can try again.
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => Promise<void> }) {
  useEffect(() => {
    reportError(error, "error-boundary");
  }, [error]);

  return (
    <View style={errorStyles.container}>
      <ThemedText variant="headline">Something went wrong</ThemedText>
      <ThemedText variant="body" style={errorStyles.body}>
        Please try again. If it keeps happening, call us on {PRACTICE_CONFIG.phone}.
      </ThemedText>
      <Button title="Try again" onPress={() => retry()} />
    </View>
  );
}

const errorStyles = StyleSheet.create({
  body: { color: colors.secondaryLabel, textAlign: "center" },
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.lg,
  },
});

// ─── Root layout ──────────────────────────────────────────────────────────────
// Hydrates auth state from SecureStore before rendering any route.
// Shows nothing (splash continues) until hydration is complete.
export default function RootLayout() {
  const { isHydrating, setHydrating } = useAuthStore();
  const { setBackgrounded, setForegrounded, isLocked } = useAppLockStore();

  // ── Network offline monitoring (MA-4) ──────────────────────────────────
  useEffect(() => {
    const unsubscribe = setupNetworkMonitoring();
    return () => {
      unsubscribe();
    };
  }, []);

  // ── Hydrate auth on cold start ──────────────────────────────────────────
  // Attempt a silent refresh using the stored refresh token.
  // If it fails, user is considered logged out — no flash of wrong screen.
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        // MA-3: Hydrate biometric lock preference on cold start
        await useAppLockStore.getState().hydrateBiometricPreference();

        const refreshToken = await tokenStore.getRefreshToken();
        if (refreshToken) {
          // Attempt silent refresh using stored refresh token
          await authApi.refresh();
        }
      } catch {
        // Refresh failed — stay logged out
      } finally {
        if (!cancelled) setHydrating(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [setHydrating]);

  // ── App state monitoring for app lock ───────────────────────────────────
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setBackgrounded();
      } else if (nextAppState === 'active') {
        setForegrounded();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [setBackgrounded, setForegrounded]);

  // ── Gate on hydration — splash continues while this is true ─────────────
  if (isHydrating) return null;

  // ── Show app lock screen if locked ───────────────────────────────────────
  if (isLocked) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} merchantIdentifier="merchant.com.pavdental.app">
          <QueryClientProvider client={queryClient}>
            <ThemeProvider value={navTheme}>
              <StatusBar style="dark" />
              <NotificationSetup />
              <AppLockScreen />
            </ThemeProvider>
          </QueryClientProvider>
        </StripeProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} merchantIdentifier="merchant.com.pavdental.app">
          <QueryClientProvider client={queryClient}>
            <ThemeProvider value={navTheme}>
              <StatusBar style="dark" />
              <NotificationSetup />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(patient)" />
                <Stack.Screen name="(clinician)" />
                <Stack.Screen name="(operator)" />
                <Stack.Screen name="+not-found" />
              </Stack>
              <OfflineBanner />
            </ThemeProvider>
          </QueryClientProvider>
        </StripeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

