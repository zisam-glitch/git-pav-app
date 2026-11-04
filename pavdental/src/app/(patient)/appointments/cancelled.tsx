import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, Card, Button, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useMyAppointments } from "@/features/hooks/use-dental-api";

// ─── Cancelled confirmation (Mobbin Zocdoc "Cancelled Details") ───────────────
// Confirms what happened, when the refund lands, and offers one-tap rebook.

export default function CancelledAppointmentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { appointmentId, refundAmountPence, policyNotice } = useLocalSearchParams<{
    appointmentId?: string;
    refundAmountPence?: string;
    policyNotice?: string;
  }>();
  const { data: appointments } = useMyAppointments();

  const booking = (appointments as any[] | undefined)?.find((b) => b.id === appointmentId);
  const serviceName = booking?.service?.name || "Your appointment";
  // What the server actually refunded, not the service's list deposit.
  const refundPence = Number(refundAmountPence) || 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.markTile}>
            <AppIcon name="close" size={28} color={colors.danger} />
          </View>
          <ThemedText variant="largeTitle" style={styles.title}>
            Appointment cancelled
          </ThemedText>
          <ThemedText variant="subhead" style={styles.subtitle}>
            {serviceName} has been cancelled and the slot released.
          </ThemedText>
        </View>

        {refundPence > 0 ? (
          <Card style={styles.refundCard}>
            <View style={styles.refundRow}>
              <AppIcon name="creditCard" size={16} color={colors.ink} />
              <ThemedText variant="subhead" style={styles.refundTitle}>
                Refund on its way
              </ThemedText>
            </View>
            <ThemedText variant="caption" style={styles.muted}>
              £{(refundPence / 100).toFixed(2)} is being refunded to your card. Banks usually
              take 5 to 10 working days to show it.
            </ThemedText>
          </Card>
        ) : policyNotice ? (
          <Card style={styles.refundCard}>
            <ThemedText variant="caption" style={styles.muted}>
              {policyNotice}
            </ThemedText>
          </Card>
        ) : null}

        <View style={styles.nextSection}>
          <ThemedText variant="overline">What next?</ThemedText>
          <Button
            title="Book this again"
            size="lg"
            onPress={() => router.push("/(patient)/booking/service-catalog" as never)}
          />
          <Button
            title="Find another time"
            variant="secondary"
            size="lg"
            onPress={() => router.push("/(patient)/booking/clinic-picker" as never)}
          />
          <Button
            title="Back to my bookings"
            variant="ghost"
            size="sm"
            onPress={() => router.replace("/(patient)/(tabs)/appointments" as never)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  markTile: {
    alignItems: "center",
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.full,
    height: 64,
    justifyContent: "center",
    marginBottom: spacing.xxs,
    width: 64,
  },
  muted: {
    color: colors.secondaryLabel,
    lineHeight: 18,
  },
  nextSection: {
    gap: spacing.xs,
  },
  refundCard: {
    backgroundColor: colors.systemBackground,
    gap: spacing.xxs,
    padding: spacing.md,
  },
  refundRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  refundTitle: {
    color: colors.label,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.secondaryLabel,
    textAlign: "center",
  },
  title: {
    color: colors.label,
    textAlign: "center",
  },
});
