import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Badge, Button, Card, Input, ThemedText } from "@/components";
import { accountApi } from "@/features/account/account-api";
import { useAuthStore, useCurrentUser } from "@/features/auth/auth-store";
import { colors, spacing } from "@/theme";

type Step = "idle" | "enable-code" | "disable-code";

/**
 * Patients can turn two-step sign-in on (a code by text, or email if there's
 * no phone, at each sign-in) and off again with their password and a code.
 * Staff always sign in with a code, so the card isn't shown to them.
 */
export function TwoStepCard() {
  const user = useCurrentUser();
  const enabled = Boolean(user?.mfaEnabled ?? user?.isMfaEnabled);
  const [step, setStep] = useState<Step>("idle");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (user?.role !== "patient") return null;
  const sentTo = user.phone ? "by text to your phone" : "to your email";

  const reset = () => {
    setStep("idle");
    setCode("");
    setPassword("");
    setError(null);
  };

  const start = async (next: Step) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await accountApi.requestSecurityCode();
      setStep(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "We couldn't send a security code");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      if (step === "enable-code") {
        await accountApi.enableTwoStep(code.trim());
        useAuthStore.getState().updateUser({ mfaEnabled: true, isMfaEnabled: true });
        setNotice("Two-step sign-in is on. You'll be asked for a code each time you sign in.");
      } else {
        await accountApi.disableTwoStep(password, code.trim());
        useAuthStore.getState().updateUser({ mfaEnabled: false, isMfaEnabled: false });
        setNotice("Two-step sign-in is off.");
      }
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "That didn't work");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <ThemedText variant="headline">Two-step sign-in</ThemedText>
        <Badge variant={enabled ? "success" : "default"} label={enabled ? "On" : "Off"} />
      </View>
      <ThemedText variant="caption" style={styles.muted}>
        When it's on, signing in also needs a code we send {sentTo}.
      </ThemedText>

      {step === "idle" ? (
        <Button
          title={enabled ? "Turn off two-step sign-in" : "Turn on two-step sign-in"}
          variant="secondary"
          size="sm"
          loading={busy}
          onPress={() => start(enabled ? "disable-code" : "enable-code")}
        />
      ) : (
        <View style={styles.form}>
          <ThemedText variant="caption" style={styles.muted}>
            We've sent a code {sentTo}.
          </ThemedText>
          {step === "disable-code" ? (
            <Input label="Your password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
          ) : null}
          <Input
            label="Code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            maxLength={10}
          />
          <Button
            title={step === "enable-code" ? "Turn on" : "Turn off"}
            size="sm"
            loading={busy}
            disabled={code.trim().length < 4 || (step === "disable-code" && !password)}
            onPress={confirm}
          />
          <Button title="Cancel" variant="ghost" size="sm" onPress={reset} />
        </View>
      )}

      {error ? (
        <ThemedText variant="caption" style={styles.error} accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}
      {notice ? (
        <ThemedText variant="caption" style={styles.muted}>
          {notice}
        </ThemedText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  error: {
    color: colors.danger,
  },
  form: {
    gap: spacing.xs,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  muted: {
    color: colors.secondaryLabel,
  },
});
