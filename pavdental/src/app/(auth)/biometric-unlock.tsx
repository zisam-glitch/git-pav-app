import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { safeHaptics } from "@/lib/haptics";
import { reportCaughtError } from "@/lib/caught-errors";
import { ThemedText, Button, AppIcon, Card } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authApi } from "@/features/auth/auth-api";
import { useAuthStore, useCurrentUser } from "@/features/auth/auth-store";
import { useAppLockStore } from "@/features/app-lock/app-lock-store";
import { getMobilePortalPath } from "@/features/auth/auth-routing";

export default function BiometricUnlockScreen() {
  const router = useRouter();
  const { setBiometricUnlocked } = useAuthStore();
  const user = useCurrentUser();
  const [hasHardware, setHasHardware] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSupport() {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setHasHardware(compatible && enrolled);
      authenticate();
    }
    checkSupport();
  }, []);

  const authenticate = async () => {
    try {
      setError(null);
      safeHaptics.impactAsync("light").catch(() => {});
      const success = await useAppLockStore.getState().unlock();

      if (success) {
        safeHaptics.notificationAsync("success").catch(() => {});
        setBiometricUnlocked(true);
        const role = user?.role || "patient";
        router.replace(getMobilePortalPath(role) as never);
      } else {
        safeHaptics.notificationAsync("warning").catch(() => {});
        setError("Authentication was canceled or not recognized.");
      }
    } catch (err) {
      reportCaughtError(err, "biometric-unlock authenticate");
      setError("Biometric authentication encountered an error.");
    }
  };

  const handleSignOut = async () => {
    try {
      await authApi.signOut();
    } catch (err) {
      // Signed out locally either way.
      reportCaughtError(err, "biometric-unlock sign-out");
    }
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.centerBox}>
          <Card variant="outline" style={styles.cardWrapper}>
            <View style={styles.iconCircle}>
              <AppIcon name="lock" size={32} color={colors.ink} />
            </View>
            <ThemedText variant="title" style={styles.title}>
              App locked
            </ThemedText>
            <ThemedText variant="subhead" style={styles.subtitle}>
              Authenticate with Face ID or biometrics to protect your confidential dental charts and health history.
            </ThemedText>

            {error ? (
              <View style={styles.errorBox}>
                <ThemedText variant="caption" style={styles.errorText}>
                  {error}
                </ThemedText>
              </View>
            ) : null}
          </Card>
        </View>

        <View style={styles.actions}>
          {hasHardware ? (
            <Button
              title="Unlock with biometrics"
              size="lg"
              icon={<AppIcon name="shieldCheck" size={20} color={colors.onInk} />}
              onPress={authenticate}
            />
          ) : (
            <Button
              title="Unlock account"
              size="lg"
              onPress={authenticate}
            />
          )}

          <Button
            title="Sign out"
            variant="ghost"
            size="md"
            onPress={handleSignOut}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  cardWrapper: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: "100%",
  },
  centerBox: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  container: {
    flex: 1,
  },
  errorBox: {
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xs,
  },
  errorText: {
    color: colors.danger,
    textAlign: "center",
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 72,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 72,
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  subtitle: {
    color: colors.secondaryLabel,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  title: {
    color: colors.label,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
});
