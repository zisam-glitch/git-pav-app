import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { ThemedText, Input, Button, IconButton } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authApi } from "@/features/auth/auth-api";
import { useAuthStore } from "@/features/auth/auth-store";
import { getMobilePortalPath } from "@/features/auth/auth-routing";

export default function WelcomeScreen() {
  // Light status bar on the forest-green launch screen, only while it's in
  // front: this screen stays mounted under sign-in and sign-up. Deferred a
  // tick: on a cold start the root layout's dark StatusBar mounts after this
  // screen and would otherwise win.
  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => setStatusBarStyle("light"), 0);
      return () => {
        clearTimeout(t);
        setStatusBarStyle("dark");
      };
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

      {/* With the email sheet open it runs to the bottom of the screen, so only the top inset is kept. */}
      <SafeAreaView style={styles.safe} edges={showEmailSheet ? ["top"] : ["top", "bottom"]}>
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

        {/* One scrolling column, so on a small screen or with the keyboard up
            nothing is cut off: the form scrolls instead of being clipped. */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.screenScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* The Pav Dental monogram, the same mark as the launch screen */}
            <View style={styles.brandGroup} accessibilityRole="header" accessibilityLabel="Pav Dental">
              <Image
                source={require("../../../assets/splash-icon.png")}
                style={styles.logo}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
              <ThemedText variant="largeTitle" style={styles.brandName}>
                Pav Dental
              </ThemedText>
            </View>

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
              <View style={[styles.sheetContainer, { paddingBottom: Math.max(spacing.gutter, insets.bottom + spacing.md) }]}>
                <ThemedText variant="largeTitle">Welcome back</ThemedText>
                <ThemedText variant="subhead" style={styles.sheetSub}>
                  Enter your email to sign in or create an account.
                </ThemedText>

                {error ? (
                  <View style={styles.errorBox} accessibilityRole="alert">
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
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 200,
  },
  flex: {
    flex: 1,
  },
  logo: {
    height: 150,
    width: 150,
  },
  screenScroll: {
    flexGrow: 1,
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
    gap: spacing.sm,
    padding: spacing.gutter,
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
