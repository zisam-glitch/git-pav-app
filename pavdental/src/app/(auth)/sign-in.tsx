import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText, Input, Button, IconButton, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authApi } from "@/features/auth/auth-api";

export default function SignInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (codeSent && mfaCode.trim().length < 6) {
      setError("Enter the 6-digit security code we sent you.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await authApi.signIn(email.trim(), password, codeSent ? mfaCode.trim() : undefined);
      if (result?.mfaRequired) setCodeSent(true);
      // Otherwise route protection in (auth)/_layout redirects on auth state change
    } catch (err: any) {
      setError(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar with Neo Financial circular back button */}
          <View style={styles.topNav}>
            <IconButton
              icon="arrowLeft"
              label="Go back"
              variant="soft"
              size={22}
              onPress={() => router.back()}
            />
          </View>

          <View style={styles.header}>
            <ThemedText variant="largeTitle" style={styles.title}>
              Welcome back
            </ThemedText>
            <ThemedText variant="subhead" style={styles.subtitle}>
              Enter your password to sign in as{" "}
              <ThemedText variant="subhead" style={styles.emailHighlight}>
                {email || "your account"}
              </ThemedText>
              .
            </ThemedText>
          </View>

          {error ? (
            <View style={styles.errorBox} accessibilityRole="alert">
              <ThemedText variant="caption" style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          ) : null}

          {/* Quick Demo Role Fillers — development only */}
          {__DEV__ ? (
            <View style={styles.demoRow}>
              <ThemedText variant="caption" style={styles.demoLabel}>Demo 1-tap fill:</ThemedText>
              <View style={styles.demoPills}>
                {[
                  { label: "Patient", email: "patient@pavdental.com" },
                  { label: "Clinician", email: "doctor@pavdental.com" },
                  { label: "Van Operator", email: "van@pavdental.com" },
                ].map((role) => (
                  <Pressable
                    key={role.label}
                    accessibilityRole="button"
                    accessibilityLabel={`Fill demo credentials for ${role.label}`}
                    onPress={() => {
                      setEmail(role.email);
                      setPassword("Password123!");
                      if (error) setError(null);
                    }}
                    style={styles.demoPill}
                  >
                    <ThemedText variant="caption" style={styles.demoPillText}>{role.label}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.form}>
            <Input
              label="Email address"
              placeholder="name@example.co.uk"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setCodeSent(false);
                if (error) setError(null);
              }}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError(null);
              }}
              rightSlot={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={8}
                >
                  <AppIcon
                    name={showPassword ? "eyeOff" : "eye"}
                    size={18}
                    color={colors.tertiaryLabel}
                  />
                </Pressable>
              }
            />

            {codeSent ? (
              <Input
                label="Security code"
                placeholder="6-digit code"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={6}
                value={mfaCode}
                onChangeText={(text) => {
                  setMfaCode(text);
                  if (error) setError(null);
                }}
                hint="We've sent a code to your phone or email."
              />
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Forgot your password?"
              onPress={() => router.push("/(auth)/forgot")}
              style={styles.forgotPassPressable}
            >
              <ThemedText variant="subhead" style={styles.forgotText}>
                Forgot your password?
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Button
              title={codeSent ? "Verify and sign in" : "Sign in"}
              size="lg"
              arrow
              loading={loading}
              onPress={handleSignIn}
            />

            <Button
              title="Sign in with a text code"
              variant="secondary"
              size="md"
              onPress={() => router.push("/(auth)/otp")}
            />

            <View style={styles.footerRow}>
              <ThemedText variant="subhead" style={styles.footerLabel}>
                Don't have an account?{" "}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Register for an account"
                onPress={() => router.push("/(auth)/sign-up")}
              >
                <ThemedText variant="subhead" style={styles.footerLink}>
                  Register
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: "auto",
    gap: spacing.sm,
  },
  emailHighlight: {
    color: colors.label,
    fontWeight: "600",
  },
  demoLabel: {
    color: colors.secondaryLabel,
    fontWeight: "600",
  },
  demoPill: {
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  demoPillText: {
    fontWeight: "700",
  },
  demoPills: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  demoRow: {
    gap: spacing.xxs,
    marginBottom: spacing.md,
  },
  errorBox: {
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  errorText: {
    color: colors.danger,
  },
  flex: {
    flex: 1,
  },
  footerLabel: {
    color: colors.secondaryLabel,
  },
  footerLink: {
    color: colors.info,
    fontWeight: "600",
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  forgotPassPressable: {
    alignSelf: "flex-end",
    paddingVertical: spacing.xxs,
  },
  forgotText: {
    color: colors.info,
    fontWeight: "600",
  },
  form: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  topNav: {
    marginBottom: spacing.md,
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  title: {
    color: colors.label,
  },
});

