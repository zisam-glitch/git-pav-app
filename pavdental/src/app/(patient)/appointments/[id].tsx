import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedText,
  Card,
  Badge,
  Button,
  AppIcon,
  DetailRow,
  ConfirmSheet,
  Toast,
  EmptyState,
  IconButton,
} from "@/components";
import { appointmentClinician, appointmentLocation } from "@/features/booking/appointment-labels";
import { colors, spacing, radius } from "@/theme";
import { useMyAppointments, useCancelAppointmentMutation } from "@/features/hooks/use-dental-api";
import { toLabel } from "@/lib/text";
import { appointmentBadge, depositPaidLabel } from "@/features/booking/appointment-status";
import { ukDateLabel, ukTime } from "@/features/booking/uk-time";

// ─── Appointment detail — full context + lifecycle actions ────────────────────
// Reference pattern: Mobbin Zocdoc appointment detail (map, cancel)
// plus MyChart pre-visit check-in entry and post-visit rating.

interface Booking {
  id: string;
  status: string;
  channel: string;
  startTimeUtc: string;
  endTimeUtc?: string;
  depositPaidPence?: number;
  service?: { name?: string };
  clinician?: { fullName?: string };
  clinic?: { name?: string; addressLine1?: string };
  van?: { name?: string };
}

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: apiAppointments, isLoading } = useMyAppointments();
  const cancelMutation = useCancelAppointmentMutation();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const source: Booking[] = (apiAppointments ?? []) as Booking[];
  const booking = source.find((b) => b.id === id);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={{ padding: spacing.md, minHeight: 180, backgroundColor: colors.inkSubtle, borderRadius: radius.lg }} />
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <EmptyState
          heading="Appointment not found"
          body="This booking may have been removed or belongs to another account."
          actionLabel="Back to bookings"
          onAction={() => router.back()}
          icon="calendar"
        />
      </View>
    );
  }

  const start = new Date(booking.startTimeUtc);
  const dateLine = ukDateLabel(start, { weekday: "long", day: "numeric", month: "long" });
  const timeLine = `${ukTime(start)} UK time`;
  const locationName = appointmentLocation(booking);
  const clinicianName = appointmentClinician(booking);

  const isPast = start.getTime() < Date.now();
  const isCancelled = booking.status === "cancelled";
  const within24h = !isPast && start.getTime() - Date.now() < 24 * 60 * 60 * 1000;
  // A booked video consult is joined from here until its slot ends: answer the
  // triage questions, then wait for the clinician to let the patient in.
  const end = new Date(booking.endTimeUtc ?? booking.startTimeUtc);
  const badge = appointmentBadge(booking);
  const canJoinVideo =
    booking.channel === "video" &&
    (booking.status === "confirmed" || booking.status === "in_progress") &&
    end.getTime() > Date.now();

  const doCancel = () => {
    setConfirmCancel(false);
    cancelMutation.mutate(booking.id, {
      onSuccess: (result) => {
        setToast({ message: "Appointment cancelled", tone: "success" });
        router.replace({
          pathname: "/(patient)/appointments/cancelled" as never,
          params: {
            appointmentId: booking.id,
            refundAmountPence: String(result.refundAmountPence ?? 0),
            policyNotice: result.policyNotice ?? "",
          },
        });
      },
      onError: (err: Error) =>
        setToast({ message: err.message || "Could not cancel the appointment", tone: "error" }),
    });
  };

  return (
    <View style={styles.container}>
      {toast ? <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} /> : null}

      <View style={[styles.topNav, { paddingTop: Math.max(spacing.xs, insets.top) }]}>
        <IconButton
          icon="arrowLeft"
          label="Go back"
          variant="soft"
          size={22}
          onPress={() => router.back()}
        />
        <ThemedText variant="headline" style={styles.navTitle}>Appointment details</ThemedText>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status hero */}
        <Card elevation="flat" style={styles.heroCard}>
          <View style={styles.heroTop}>
            <ThemedText variant="headline" style={styles.serviceTitle}>
              {booking.service?.name || "Dental Treatment"}
            </ThemedText>
            <Badge label={badge.label} variant={badge.variant} />
          </View>
        </Card>

        {/* Details receipt card */}
        <Card elevation="flat" style={styles.card}>
          <ThemedText variant="overline" style={styles.cardOverline}>Visit summary</ThemedText>
          <DetailRow label="Visit type" value={toLabel(booking.channel)} />
          <DetailRow label="Date" value={dateLine} />
          <DetailRow label="Time" value={timeLine} />
          <DetailRow label="Clinician" value={clinicianName} />
          <DetailRow label="Location" value={booking.clinic?.addressLine1 ? `${locationName}, ${booking.clinic.addressLine1}` : locationName} />
          <DetailRow label="Deposit paid" value={depositPaidLabel(booking.depositPaidPence)} />
        </Card>

        {canJoinVideo ? (
          <Card elevation="flat" style={styles.videoCard}>
            <ThemedText variant="headline">Your video consult</ThemedText>
            <ThemedText variant="caption" style={styles.muted}>
              Answer the triage questions first so your clinician can read them, then wait in the waiting room until they let you in.
            </ThemedText>
            <View style={styles.videoActions}>
              <Button
                title="Answer the triage questions"
                size="md"
                onPress={() =>
                  router.push({ pathname: "/(patient)/video/intake" as never, params: { appointmentId: booking.id } })
                }
              />
              <Button
                title="Go to the waiting room"
                variant="secondary"
                size="md"
                onPress={() =>
                  router.push({ pathname: "/(patient)/video/device-check" as never, params: { appointmentId: booking.id } })
                }
              />
            </View>
          </Card>
        ) : null}

        {/* Pre-visit check-in (Mobbin checklist entry) */}
        {within24h && booking.channel !== "video" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start digital check-in"
            onPress={() =>
              router.push({ pathname: "/(patient)/check-in" as never, params: { appointmentId: booking.id } })
            }
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <Card elevation="flat" style={styles.checkInCard}>
              <View style={styles.checkInIcon}>
                <AppIcon name="clipboard" size={20} color={colors.alwaysWhite} />
              </View>
              <View style={styles.checkInInfo}>
                <ThemedText variant="headline" style={styles.checkInTitle}>
                  You're nearly there
                </ThemedText>
                <ThemedText variant="caption" style={styles.muted}>
                  Check in before your visit — forms, consent and balance, 5 minutes.
                </ThemedText>
              </View>
              <AppIcon name="chevronRight" size={16} color={colors.alwaysWhite} />
            </Card>
          </Pressable>
        ) : null}

      </ScrollView>

      {/* Lifecycle actions */}
      <View style={[styles.footerBar, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        {isCancelled ? (
          <Button
            title="Book this again"
            size="lg"
            arrow={true}
            style={styles.footerBtn}
            onPress={() => router.push("/(patient)/booking/service-catalog" as never)}
          />
        ) : isPast ? (
          <Button
            title="Rebook treatment"
            size="lg"
            arrow={true}
            style={styles.footerBtn}
            onPress={() => router.push("/(patient)/booking/service-catalog" as never)}
          />
        ) : (
          // No Reschedule button: the backend can't move a booking yet, and what
          // happens to the deposit is waiting on the owner (COMPLETION-PLAN decision 9).
          <Button
            title="Cancel"
            variant="destructive"
            size="lg"
            style={styles.footerBtn}
            onPress={() => setConfirmCancel(true)}
          />
        )}
      </View>

      {confirmCancel ? (
        <ConfirmSheet
          title="Cancel this appointment?"
          message="Your slot will be released immediately. Cancelling 48 hours or more ahead refunds your deposit in full, 24 to 48 hours ahead refunds half, and under 24 hours the deposit is kept."
          confirmLabel="Cancel appointment"
          cancelLabel="Keep booking"
          variant="destructive"
          onConfirm={doCancel}
          onCancel={() => setConfirmCancel(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  videoActions: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  videoCard: {
    gap: spacing.xxs,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.xs,
    padding: spacing.md,
  },
  cardOverline: {
    color: colors.secondaryLabel,
    fontSize: 11,
    marginBottom: spacing.xxs,
  },
  checkInCard: {
    alignItems: "center",
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md + 2,
  },
  checkInIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  checkInInfo: {
    flex: 1,
    gap: 2,
  },
  checkInTitle: {
    color: colors.alwaysWhite,
    fontWeight: "700",
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  footerBar: {
    backgroundColor: colors.background,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  footerBtn: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.xs,
    padding: spacing.md,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  muted: {
    color: colors.alwaysWhite,
    opacity: 0.75,
    fontSize: 13,
    lineHeight: 16,
  },
  navSpacer: {
    width: 44,
  },
  navTitle: {
    color: colors.label,
    fontWeight: "700",
  },
  serviceTitle: {
    color: colors.label,
    flex: 1,
    fontWeight: "700",
    fontSize: 17,
  },
  topNav: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
});
