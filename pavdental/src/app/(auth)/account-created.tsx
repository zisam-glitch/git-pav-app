import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, Button, AppIcon, Card } from "@/components";
import { colors, spacing, radius } from "@/theme";

// ─── Account created — soft success after late-auth sign-up ───────────────────
// Reference pattern: Zocdoc confirms the account, then invites (never forces)
// profile setup so momentum from booking is preserved.

export default function AccountCreatedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.hero}>
        <View style={styles.markTile}>
          <AppIcon name="check" size={32} color={colors.success} />
        </View>
        <ThemedText variant="largeTitle" style={styles.title}>
          Account created
        </ThemedText>
        <ThemedText variant="subhead" style={styles.subtitle}>
          Welcome to Pav Dental. Set up your profile now so booking takes seconds
          later — or skip and do it any time.
        </ThemedText>

        <Card elevation="flat" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.checkIconBox}>
              <AppIcon name="checkCircle" size={16} color={colors.success} />
            </View>
            <ThemedText variant="subhead" style={styles.summaryText}>
              Your email address is verified
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.checkIconBox}>
              <AppIcon name="checkCircle" size={16} color={colors.success} />
            </View>
            <ThemedText variant="subhead" style={styles.summaryText}>
              Your health details are encrypted
            </ThemedText>
          </View>
        </Card>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <Button
          title="Set up my profile"
          size="lg"
          arrow={true}
          accessibilityLabel="Continue to profile setup"
          onPress={() => router.replace("/onboarding/profile" as never)}
        />
        <Button
          title="I'll do this later"
          variant="ghost"
          size="sm"
          onPress={() => router.replace("/(patient)/(tabs)/home" as never)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  checkIconBox: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  footer: {
    bottom: 0,
    gap: spacing.xs,
    left: 0,
    padding: spacing.md,
    position: "absolute",
    right: 0,
  },
  hero: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.xl,
  },
  markTile: {
    alignItems: "center",
    backgroundColor: colors.successSubtle,
    borderRadius: radius.full,
    height: 72,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 72,
  },
  subtitle: {
    color: colors.secondaryLabel,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md + 2,
    width: "100%",
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  summaryText: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    color: colors.label,
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },
});
