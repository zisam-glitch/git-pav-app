import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, Card, Button, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";

// ─── Van coverage not available ────────────────────────────────────────────────
// Clear, non-apologetic explanation with the three alternative channels as
// equal options. Reached from service-area when the postcode is out of range.

export default function VanNotCoveredScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const alternatives = [
    {
      icon: "plus" as const,
      title: "Visit a practice",
      desc: "Book a visit at one of our clinics.",
      route: "/(patient)/booking/service-catalog" as const,
    },
    {
      icon: "video" as const,
      title: "Video consult",
      desc: "Book a video appointment: a dentist can assess, prescribe and refer.",
      route: "/(patient)/booking/service-catalog?channel=video" as const,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.markTile}>
            <AppIcon name="truck" size={28} color={colors.secondaryLabel} />
          </View>
          <ThemedText variant="largeTitle" style={styles.title}>
            The van doesn't reach you — yet
          </ThemedText>
          <ThemedText variant="subhead" style={styles.subtitle}>
            Our dental vans only visit the areas they currently serve, and this
            address isn't in one of them.
          </ThemedText>
        </View>

        <ThemedText variant="overline">In the meantime</ThemedText>
        <View style={styles.optionList}>
          {alternatives.map((opt) => (
            <Pressable
              key={opt.title}
              accessibilityRole="button"
              accessibilityLabel={opt.title}
              onPress={() => router.push(opt.route as never)}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <Card style={styles.optionCard}>
                <View style={styles.optionIcon}>
                  <AppIcon name={opt.icon} size={20} color={colors.ink} />
                </View>
                <View style={styles.optionInfo}>
                  <ThemedText variant="headline" style={styles.optionTitle}>
                    {opt.title}
                  </ThemedText>
                  <ThemedText variant="caption" style={styles.optionDesc}>
                    {opt.desc}
                  </ThemedText>
                </View>
                <AppIcon name="chevronRight" size={16} color={colors.tertiaryLabel} />
              </Card>
            </Pressable>
          ))}
        </View>

        <Card elevation="flat" style={styles.routeNote}>
          <AppIcon name="mapPin" size={15} color={colors.secondaryLabel} />
          <ThemedText variant="caption" style={styles.routeNoteText}>
            We add van areas over time, so it's worth checking your postcode again later.
          </ThemedText>
        </Card>
      </ScrollView>

      <View style={[styles.footerBar, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <Button title="Back to care options" variant="secondary" size="lg" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  footerBar: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  hero: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  markTile: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.xl,
    height: 64,
    justifyContent: "center",
    marginBottom: spacing.xxs,
    width: 64,
  },
  optionCard: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  optionDesc: {
    color: colors.secondaryLabel,
  },
  optionIcon: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  optionList: {
    gap: spacing.sm,
  },
  optionTitle: {
    color: colors.label,
  },
  routeNote: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
    padding: spacing.sm,
  },
  routeNoteText: {
    color: colors.secondaryLabel,
    flex: 1,
    lineHeight: 16,
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
