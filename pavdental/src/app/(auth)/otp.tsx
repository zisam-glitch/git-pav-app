import React, { useState, useRef } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText, Input, Button, IconButton } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authApi } from "@/features/auth/auth-api";

export default function OtpScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hiddenInputRef = useRef<TextInput>(null);

  const handleSendCode = async () => {
    if (!phone.trim()) {
      setError("Please enter your UK mobile number.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authApi.requestPhoneOtp(phone.trim());
      setStep("code");
    } catch (err: any) {
      setError(err?.message || "Failed to send code. Please check your number.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length < 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authApi.verifyPhoneOtp(phone.trim(), code.trim());
      // On success, redirect is handled by auth layout listener
    } catch (err: any) {
      setError(err?.message || "Invalid or expired code. Please try again.");
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
          {/* Top Bar with circular back button */}
          <View style={styles.topNav}>
            <IconButton
              icon="arrowLeft"
              label="Go back"
              variant="soft"
              size={22}
              onPress={() => {
                if (step === "code") {
                  setStep("phone");
                } else {
                  router.back();
                }
              }}
            />
          </View>

          <View style={styles.header}>
            <ThemedText variant="largeTitle" style={styles.title}>
              {step === "phone" ? "Phone Sign In" : "Verification"}
            </ThemedText>
            <ThemedText variant="subhead" style={styles.subtitle}>
              {step === "phone"
                ? "We'll text you a one-time 6-digit security code."
                : `Enter the 6-digit code sent to ${phone}`}
            </ThemedText>
          </View>

          {error ? (
            <View style={styles.errorBox} accessibilityRole="alert">
              <ThemedText variant="caption" style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.form}>
            {step === "phone" ? (
              <Input
                label="UK mobile phone"
                placeholder="+44 7123 456789"
                keyboardType="phone-pad"
                autoComplete="tel"
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  if (error) setError(null);
                }}
              />
            ) : (
              <View style={styles.otpSection}>
                <ThemedText variant="subhead" style={styles.otpLabel}>
                  Security code
                </ThemedText>

                {/* Neo Financial 6-box OTP digits */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Tap to enter 6 digit verification code"
                  onPress={() => hiddenInputRef.current?.focus()}
                  style={styles.otpBoxesRow}
                >
                  {[0, 1, 2, 3, 4, 5].map((index) => {
                    const digit = code[index] || "";
                    const isCurrent = code.length === index;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.otpBox,
                          isCurrent && styles.otpBoxActive,
                          digit ? styles.otpBoxFilled : null,
                        ]}
                      >
                        <ThemedText variant="title" style={styles.otpDigit}>
                          {digit}
                        </ThemedText>
                      </View>
                    );
                  })}
                </Pressable>

                {/* Hidden input to capture numeric pad */}
                <TextInput
                  ref={hiddenInputRef}
                  value={code}
                  onChangeText={(val) => {
                    const cleaned = val.replace(/[^0-9]/g, "").slice(0, 6);
                    setCode(cleaned);
                    if (error) setError(null);
                  }}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  maxLength={6}
                  style={styles.hiddenInput}
                  accessibilityLabel="6-Digit Verification Code"
                />

                <View style={styles.otpLinksRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Resend code"
                    onPress={handleSendCode}
                  >
                    <ThemedText variant="caption" style={styles.resendText}>
                      Resend code
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Change phone number"
                    onPress={() => setStep("phone")}
                    style={styles.changePhonePressable}
                  >
                    <ThemedText variant="caption" style={styles.changePhoneText}>
                      Change number
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <Button
              title={step === "phone" ? "Send code" : "Verify & continue"}
              size="lg"
              arrow
              loading={loading}
              onPress={step === "phone" ? handleSendCode : handleVerifyCode}
            />

            <Button
              title="Back to email sign in"
              variant="ghost"
              size="md"
              onPress={() => router.push("/(auth)/sign-in")}
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
  },
  topNav: {
    marginBottom: spacing.md,
  },
  otpSection: {
    gap: spacing.sm,
  },
  otpLabel: {
    color: colors.label,
    fontWeight: "500",
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.xs,
  },
  // Wise code entry: white boxes with a grey border, forest when active
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.tertiaryBackground,
    borderWidth: 1,
    borderColor: colors.inputUnderline,
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxActive: {
    borderColor: colors.ink,
    borderWidth: 2,
    backgroundColor: colors.tertiaryBackground,
  },
  otpBoxFilled: {
    backgroundColor: colors.inkSubtle,
    borderColor: colors.separator,
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  hiddenInput: {
    height: 0,
    width: 0,
    opacity: 0,
    position: "absolute",
  },
  otpLinksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  resendText: {
    color: colors.info,
    fontWeight: "600",
  },
  changePhonePressable: {
    paddingVertical: spacing.xxs,
  },
  changePhoneText: {
    color: colors.secondaryLabel,
    fontWeight: "500",
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
  form: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
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

