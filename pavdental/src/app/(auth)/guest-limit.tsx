import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, Button, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";

// ─── Guest limit reached — the Zocdoc "soft wall" ─────────────────────────────
// Guests can browse and start a booking, but confirming requires an account.
// The tone is benefit-first, never punitive.

export default function GuestLimitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.hero}>
        <View style={styles.markTile}>
          <AppIcon name="userPlus" size={30} color={colors.onInk} />
        </View>
        <ThemedText variant="largeTitle" style={styles.title}>
          One quick step to book
        </ThemedText>
        <ThemedText variant="subhead" style={styles.subtitle}>
          You've used all the browsing a guest account allows. Creating a free
          account keeps your booking history, deposits and dental records in one
          secure place.
        </ThemedText>

        <View style={styles.benefits}>
          {[
            "Track appointments across clinic, van & video",
            "Your treatment plans and prescriptions in one place",
            "Rebook a past treatment from your appointments",
          ].map((line) => (
            <View key={line} style={styles.benefitRow}>
              <AppIcon name="check" size={15} color={colors.ink} />
              <ThemedText variant="body" style={styles.benefitText}>
                {line}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <Button
          title="Create free account"
          size="lg"
          onPress={() => router.push("/(auth)/sign-up" as never)}
        />
        <Button
          title="I already have an account"
          variant="ghost"
          size="sm"
          onPress={() => router.push("/(auth)/sign-in" as never)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  benefitRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  benefitText: {
    color: colors.label,
    flex: 1,
  },
  benefits: {
    alignSelf: "stretch",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.xs,
    marginTop: spacing.xs,
    padding: spacing.md,
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
    backgroundColor: colors.ink,
    borderRadius: radius.full,
    height: 64,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 64,
  },
  subtitle: {
    color: colors.secondaryLabel,
    lineHeight: 22,
    textAlign: "center",
  },
  title: {
    color: colors.label,
    textAlign: "center",
  },
});
