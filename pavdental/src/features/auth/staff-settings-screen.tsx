import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText, Card, Button, ConfirmSheet, DetailRow } from "@/components";
import { colors, spacing } from "@/theme";
import { authApi } from "@/features/auth/auth-api";
import { useCurrentUser } from "@/features/auth/auth-store";
import { toLabel } from "@/lib/text";

/**
 * Settings for clinicians and van operators: who is signed in, and Sign out.
 * On a shared practice phone the next person must not inherit the session.
 */
export function StaffSettingsScreen() {
  const user = useCurrentUser();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setConfirming(false);
    setBusy(true);
    try {
      await authApi.signOut();
    } catch {
      // The session is cleared on this phone whatever the network says.
    }
    setBusy(false);
  };

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <View style={styles.container}>
      <Card elevation="flat" style={styles.card}>
        <ThemedText variant="overline" style={styles.overline}>Signed in as</ThemedText>
        {name ? <DetailRow label="Name" value={name} /> : null}
        {user?.email ? <DetailRow label="Email" value={user.email} /> : null}
        {user?.role ? <DetailRow label="Role" value={toLabel(user.role)} /> : null}
      </Card>

      <Button title="Sign out" variant="destructive" size="lg" loading={busy} onPress={() => setConfirming(true)} />

      {confirming ? (
        <ConfirmSheet
          title="Sign out?"
          message="You will need to sign in again to see your schedule."
          confirmLabel="Sign out"
          cancelLabel="Stay signed in"
          variant="destructive"
          onConfirm={signOut}
          onCancel={() => setConfirming(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.systemBackground,
    gap: spacing.xs,
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    padding: spacing.gutter,
  },
  overline: {
    color: colors.secondaryLabel,
  },
});
