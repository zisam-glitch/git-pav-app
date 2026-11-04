import React, { useState, useMemo } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText, Input, Button, IconButton, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authApi } from "@/features/auth/auth-api";
import { LEGAL_URLS } from "@/config/legal";

export default function SignUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(params.email || "");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) return { level: 0, label: "", color: colors.separator };
    const hasLength = password.length >= 8;
    const hasMix = /[A-Z]/.test(password) && /[a-z]/.test(password);
    const hasNumOrSym = /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password);

    if (hasLength && hasMix && hasNumOrSym) {
      return { level: 3, label: "Strong", color: colors.success };
    }
    if ((hasLength && hasMix) || (hasLength && hasNumOrSym) || (hasMix && hasNumOrSym)) {
      return { level: 2, label: "Medium", color: colors.warning };
    }
    return { level: 1, label: "Weak", color: colors.danger };
  }, [password]);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Please fill out all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call backend API to create account
      await authApi.register(
        email.trim(),
        password,
        firstName.trim(),
        lastName.trim(),
        phone.trim() || undefined,
        referralCode.trim() || undefined
      );

      // Navigate to email verification screen
      router.push({
        pathname: "/(auth)/verify-email",
        params: { email: email.trim() },
      });
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
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
              onPress={() => router.back()}
            />
          </View>

          <View style={styles.header}>
            <ThemedText variant="largeTitle" style={styles.title}>
              Create account
            </ThemedText>
            <ThemedText variant="subhead" style={styles.subtitle}>
              Complete registration details for{" "}
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

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Input
                  label="First name"
                  placeholder="Jane"
                  value={firstName}
                  onChangeText={(val) => {
                    setFirstName(val);
                    if (error) setError(null);
                  }}
                />
              </View>
              <View style={styles.flex}>
                <Input
                  label="Last name"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={(val) => {
                    setLastName(val);
                    if (error) setError(null);
                  }}
                />
              </View>
            </View>

            <Input
              label="Email address"
              placeholder="jane.doe@example.co.uk"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (error) setError(null);
              }}
            />

            <Input
              label="UK mobile number (optional)"
              placeholder="+44 7123 456789"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(val) => {
                setPhone(val);
                if (error) setError(null);
              }}
            />

            <Input
              label="Referral code (optional)"
              placeholder="From a friend who uses Pav Dental"
              autoCapitalize="characters"
              autoCorrect={false}
              value={referralCode}
              onChangeText={(val) => {
                setReferralCode(val);
                if (error) setError(null);
              }}
            />

            <Input
              label="Password"
              placeholder="At least 8 characters"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
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

            {/* Neo Financial 3-segment password strength indicator */}
            {password.length > 0 ? (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3].map((bar) => (
                    <View
                      key={bar}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            bar <= passwordStrength.level
                              ? passwordStrength.color
                              : colors.separator,
                        },
                      ]}
                    />
                  ))}
                </View>
                <ThemedText
                  variant="caption"
                  style={[styles.strengthLabel, { color: passwordStrength.color }]}
                >
                  {passwordStrength.label}
                </ThemedText>
              </View>
            ) : null}
          </View>

          <View style={styles.actions}>
            <View style={styles.legalNotice}>
              <ThemedText variant="caption" style={styles.legalText}>
                By creating an account, you agree to our{" "}
                <ThemedText
                  variant="caption"
                  style={styles.legalLink}
                  accessibilityRole="link"
                  onPress={() => Linking.openURL(LEGAL_URLS.terms).catch(() => {})}
                >
                  Terms of service
                </ThemedText>{" "}
                and acknowledge our{" "}
                <ThemedText
                  variant="caption"
                  style={styles.legalLink}
                  accessibilityRole="link"
                  onPress={() => Linking.openURL(LEGAL_URLS.privacy).catch(() => {})}
                >
                  Privacy notice
                </ThemedText>.
              </ThemedText>
            </View>

            <Button
              title="Create account"
              size="lg"
              arrow
              loading={loading}
              onPress={handleRegister}
            />

            <View style={styles.footerRow}>
              <ThemedText variant="subhead" style={styles.footerLabel}>
                Already registered?{" "}
              </ThemedText>
              <Pressable accessibilityRole="link" accessibilityLabel="Sign in" onPress={() => router.push("/(auth)/sign-in")}>
                <ThemedText variant="subhead" style={styles.footerLink}>
                  Sign in
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
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -4,
  },
  strengthBars: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    marginRight: spacing.md,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
  },
  strengthLabel: {
    fontWeight: "600",
    minWidth: 50,
    textAlign: "right",
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
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
  legalNotice: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  legalText: {
    color: colors.secondaryLabel,
    textAlign: "center",
    lineHeight: 18,
  },
  legalLink: {
    color: colors.info,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

