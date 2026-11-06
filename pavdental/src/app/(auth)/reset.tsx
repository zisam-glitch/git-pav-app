import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText, Input, Button, IconButton, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authApi } from "@/features/auth/auth-api";
import { passwordLengthProblem, PASSWORD_HINT } from "@/features/auth/password-rules";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleReset = async () => {
    if (!token || !token.trim()) {
      setError("Invalid or missing password reset token. Please request a new reset link.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const lengthProblem = passwordLengthProblem(password);
    if (lengthProblem) {
      setError(lengthProblem);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authApi.resetPassword(token.trim(), password);
      setCompleted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password. Link may have expired.");
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
        <View style={styles.topNav}>
          <IconButton
            icon="arrowLeft"
            label="Go back"
            variant="soft"
            size={22}
            onPress={() => router.back()}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText variant="largeTitle" style={styles.title}>
              {completed ? "Password updated" : "New password"}
            </ThemedText>
            <ThemedText variant="subhead" style={styles.subtitle}>
              {completed
                ? "Your password has been changed securely. You can now sign in with your new credentials."
                : PASSWORD_HINT}
            </ThemedText>
          </View>

          {error ? (
            <View style={styles.errorBox} accessibilityRole="alert">
              <AppIcon name="alert" size={16} color={colors.danger} />
              <ThemedText variant="caption" style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          ) : null}

          {!completed ? (
            <View style={styles.form}>
              <Input
                label="New password"
                placeholder="At least 8 characters"
                secureTextEntry
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (error) setError(null);
                }}
              />

              <Input
                label="Confirm new password"
                placeholder="Re-enter password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  if (error) setError(null);
                }}
              />
            </View>
          ) : (
            <View style={styles.successCard}>
              <View style={styles.successIconBox}>
                <AppIcon name="check" size={20} color={colors.success} />
              </View>
              <View style={styles.successTextCol}>
                <ThemedText variant="headline" style={styles.successTitle}>
                  Ready to sign in
                </ThemedText>
                <ThemedText variant="subhead" style={styles.successBody}>
                  Your password meets our requirements.
                </ThemedText>
              </View>
            </View>
          )}

          <View style={styles.actions}>
            {!completed ? (
              <Button
                title="Update password"
                size="lg"
                arrow={true}
                loading={loading}
                onPress={handleReset}
              />
            ) : (
              <Button
                title="Proceed to sign in"
                size="lg"
                arrow={true}
                onPress={() => router.replace("/(auth)/sign-in")}
              />
            )}
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
    paddingTop: spacing.sm,
  },
  errorBox: {
    alignItems: "center",
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  errorText: {
    color: colors.danger,
    flex: 1,
    fontWeight: "600",
  },
  flex: {
    flex: 1,
  },
  form: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
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
    fontSize: 15,
    lineHeight: 22,
  },
  successBody: {
    color: colors.secondaryLabel,
    fontSize: 13,
    lineHeight: 18,
  },
  successCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md + 2,
    alignItems: "flex-start",
  },
  successIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.successSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  successTextCol: {
    flex: 1,
    gap: 2,
  },
  successTitle: {
    color: colors.label,
    fontWeight: "700",
  },
  title: {
    color: colors.label,
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  topNav: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
});
