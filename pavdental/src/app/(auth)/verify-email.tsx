import React, { useState, useEffect } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText, Input, Button, IconButton, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authApi } from "@/features/auth/auth-api";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email, token } = useLocalSearchParams<{ email?: string; token?: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Auto-verify if opened from email deep link containing token
  useEffect(() => {
    let mounted = true;
    if (token && typeof token === "string" && token.trim().length > 0) {
      const cleanToken = token.trim();
      (async () => {
        try {
          setLoading(true);
          setError(null);
          await authApi.confirmEmailVerification(cleanToken);
          if (mounted) {
            router.replace("/(auth)/account-created");
          }
        } catch (err: any) {
          if (mounted) {
            setError(err?.message || "Verification failed. Please check the link or enter the code manually.");
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      })();
    }
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleVerify = async () => {
    const digits = code.replace(/[\s-]/g, "");
    if (!digits) {
      setError("Please enter the 6-digit code sent to your email.");
      return;
    }
    // The email carries a six-digit code. Anything longer is an old-style link token.
    const isShortCode = /^\d{6}$/.test(digits);
    if (!isShortCode && digits.length < 20) {
      setError("The code is 6 digits. Check the email and try again.");
      return;
    }
    if (isShortCode && !email) {
      setError("Email address is missing. Please go back and sign in again.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setInfoMessage(null);

      // Attempt verification against API
      if (isShortCode) {
        await authApi.confirmEmailCode(String(email), digits);
      } else {
        await authApi.confirmEmailVerification(digits);
      }

      // Once verified, invite profile setup (skippable) — then patient home
      router.replace("/(auth)/account-created");
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please check the code.");
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email address is missing. Please return to sign-in.");
      return;
    }
    try {
      setResending(true);
      setError(null);
      setInfoMessage(null);
      await authApi.resendEmailVerification(email);
      setInfoMessage("Verification code resent to your email.");
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
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
              Verify your email
            </ThemedText>
            <ThemedText variant="subhead" style={styles.subtitle}>
              We sent a confirmation code to{" "}
              <ThemedText variant="subhead" style={styles.emailHighlight}>
                {email || "your email address"}
              </ThemedText>
              . Enter it below to activate your account.
            </ThemedText>
          </View>

          {infoMessage ? (
            <View style={styles.infoBox}>
              <AppIcon name="checkCircle" size={16} color={colors.ink} />
              <ThemedText variant="caption" style={styles.infoText}>
                {infoMessage}
              </ThemedText>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBox} accessibilityRole="alert">
              <AppIcon name="alert" size={16} color={colors.danger} />
              <ThemedText variant="caption" style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.form}>
            <Input
              label="Verification code"
              placeholder="6-digit code"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={7}
              value={code}
              onChangeText={(val) => {
                setCode(val);
                if (error) setError(null);
              }}
            />
          </View>

          <View style={styles.actions}>
            <Button
              title="Verify & continue"
              size="lg"
              arrow={true}
              loading={loading}
              onPress={handleVerify}
            />

            <Button
              title={resending ? "Resending..." : "Resend code"}
              variant="ghost"
              size="md"
              loading={resending}
              onPress={handleResend}
            />
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
  emailHighlight: {
    color: colors.label,
    fontWeight: "700",
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
  infoBox: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  infoText: {
    color: colors.ink,
    flex: 1,
    fontWeight: "600",
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
