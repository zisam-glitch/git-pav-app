import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { ThemedText, Input, Button, AppIcon, IconButton } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authApi } from "@/features/auth/auth-api";
import { useAuthStore } from "@/features/auth/auth-store";
import { getMobilePortalPath } from "@/features/auth/auth-routing";

export default function WelcomeScreen() {
  // Light status bar on the forest-green launch screen, only while it's in
  // front: this screen stays mounted under sign-in and sign-up.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, [])
  );

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showEmailSheet, setShowEmailSheet] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    const { user, accessToken } = useAuthStore.getState();
    if (user && accessToken) {
      router.push(getMobilePortalPath(user.role) as any);
      return;
    }
    setShowEmailSheet(true);
  };

  const handleContinueWithEmail = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await authApi.checkEmail(trimmedEmail);

      if (result.exists) {
        router.push({
          pathname: "/(auth)/sign-in",
          params: { email: trimmedEmail },
        });
      } else {
        router.push({
          pathname: "/(auth)/sign-up",
          params: { email: trimmedEmail },
        });
      }
    } catch (err: any) {
      setError(err?.message || "Could not verify email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe}>
        {/* Close control only while the email sheet is open */}
        <View style={styles.topHeader}>
          {showEmailSheet ? (
            <IconButton
              icon="close"
              label="Close email sign in"
              color={colors.alwaysWhite}
              onPress={() => setShowEmailSheet(false)}
            />
          ) : null}
        </View>

        {/* Centred wordmark, as on the reference splash */}
        <View style={styles.brandGroup} accessibilityRole="header" accessibilityLabel="Pav Dental">
          <View style={styles.brandIconBox}>
            <AppIcon name="tooth" size={28} color={colors.ink} />
          </View>
          <ThemedText variant="largeTitle" style={styles.brandName}>
            Pav Dental
          </ThemedText>
        </View>

        {/* Bottom Container: Either the Hero Swipe to Start, or the Email Sheet */}
        {!showEmailSheet ? (
          <View style={[styles.bottomContent, { paddingBottom: Math.max(spacing.lg, insets.bottom) }]}>
            <Button title="Log in" variant="primary" onPress={handleStart} />
            <Button
              title="Create an account"
              variant="inverse"
              onPress={() => router.push("/(auth)/sign-up" as never)}
            />
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.sheetContainer}
          >
            <ScrollView
              contentContainerStyle={styles.sheetScroll}
              keyboardShouldPersistTaps="handled"
            >
              <ThemedText variant="largeTitle">
                Welcome back
              </ThemedText>
              <ThemedText variant="subhead" style={styles.sheetSub}>
                Enter your email to sign in or create an account.
              </ThemedText>

              {error ? (
                <View style={styles.errorBox}>
                  <ThemedText variant="caption" style={styles.errorText}>
                    {error}
                  </ThemedText>
                </View>
              ) : null}

              {/* Dev Quick Fillers */}
              {__DEV__ ? (
                <View style={styles.demoPills}>
                  {[
                    { label: "Patient", email: "patient@pavdental.com" },
                    { label: "New User", email: `user_${Date.now().toString().slice(-4)}@pavdental.com` },
                  ].map((demo) => (
                    <Pressable
                      key={demo.label}
                      accessibilityRole="button"
                      accessibilityLabel={`Fill ${demo.label} demo account`}
                      onPress={() => {
                        setEmail(demo.email);
                        if (error) setError(null);
                      }}
                      style={styles.demoPill}
                    >
                      <ThemedText variant="caption" style={styles.demoPillText}>
                        {demo.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              <Input
                label="Email address"
                placeholder="name@example.co.uk"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError(null);
                }}
              />

              <Button
                title="Continue"
                size="lg"
                arrow
                loading={loading}
                onPress={handleContinueWithEmail}
                style={styles.continueBtn}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
  brandGroup: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
  },
  brandIconBox: {
    alignItems: "center",
    backgroundColor: colors.alwaysWhite,
    borderRadius: radius.lg,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  brandName: {
    color: colors.alwaysWhite,
    fontSize: 40,
    lineHeight: 46,
  },
  // Wise launch screen: forest green
  container: {
    backgroundColor: colors.ink,
    flex: 1,
  },
  continueBtn: {
    marginTop: spacing.md,
  },
  demoPill: {
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  demoPillText: {
    color: colors.label,
    fontWeight: "600",
  },
  demoPills: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  errorBox: {
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  errorText: {
    color: colors.danger,
  },
  safe: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: colors.systemBackground,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.gutter,
  },
  sheetScroll: {
    gap: spacing.sm,
  },
  sheetSub: {
    marginBottom: spacing.xs,
  },
  topHeader: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
  },
});
