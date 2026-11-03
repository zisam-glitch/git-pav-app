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
  ChipPill,
  ConfirmSheet,
  Toast,
  EmptyState,
  IconButton,
} from "@/components";
import { appointmentClinician, appointmentLocation } from "@/features/booking/appointment-labels";
import { colors, spacing, radius } from "@/theme";
import { useMyAppointments, useCancelAppointmentMutation } from "@/features/hooks/use-dental-api";
import { toLabel } from "@/lib/text";

// ─── Appointment detail — full context + lifecycle actions ────────────────────
// Reference pattern: Mobbin Zocdoc appointment detail (map, reschedule, cancel)
// plus MyChart pre-visit check-in entry and post-visit rating.

interface Booking {
  id: string;
  status: string;
  channel: string;
  startTimeUtc: string;
  service?: { name?: string; pricePence?: number; depositPence?: number };
  clinician?: { fullName?: string };
  clinic?: { name?: string; addressLine1?: string };
  van?: { name?: string };
}

function Row({ icon, label, value }: { icon: "calendar" | "clock" | "mapPin" | "profile" | "creditCard"; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconBox}>
        <AppIcon name={icon} size={16} color={colors.ink} />
      </View>
      <ThemedText variant="caption" style={styles.detailLabel}>
        {label}
      </ThemedText>
      <ThemedText variant="subhead" style={styles.detailValue} numberOfLines={2}>
        {value}
      </ThemedText>
    </View>
  );
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
  const dateLine = start.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeLine = start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const locationName = appointmentLocation(booking);
  const clinicianName = appointmentClinician(booking);

  const isPast = start.getTime() < Date.now();
  const isCancelled = booking.status === "cancelled";
  const within24h = !isPast && start.getTime() - Date.now() < 24 * 60 * 60 * 1000;
  // A booked video consult is joined from here until its slot ends: answer the
  // triage questions, then wait for the clinician to let the patient in.
  const end = new Date((booking as { endTimeUtc?: string }).endTimeUtc ?? booking.startTimeUtc);
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
            <Badge
              label={isCancelled ? "Cancelled" : isPast ? "Completed" : toLabel(booking.status)}
              variant={isCancelled ? "danger" : isPast ? "default" : "success"}
            />
          </View>
          <View style={styles.chipRow}>
            <ChipPill label={`${toLabel(booking.channel)} · ${timeLine}`} tone={isPast || isCancelled ? "neutral" : "info"} />
          </View>
        </Card>

        {/* Details receipt card */}
        <Card elevation="flat" style={styles.card}>
          <ThemedText variant="overline" style={styles.cardOverline}>Visit summary</ThemedText>
          <Row icon="calendar" label="Date" value={dateLine} />
          <View style={styles.divider} />
          <Row icon="clock" label="Time" value={timeLine} />
          <View style={styles.divider} />
          <Row icon="profile" label="Clinician" value={clinicianName} />
          <View style={styles.divider} />
          <Row icon="mapPin" label="Location" value={booking.clinic?.addressLine1 ? `${locationName}, ${booking.clinic.addressLine1}` : locationName} />
          <View style={styles.divider} />
          <Row
            icon="creditCard"
            label="Deposit paid"
            value={booking.service?.depositPence ? `£${(booking.service.depositPence / 100).toFixed(2)}` : "—"}
          />
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
            onPress={() => router.push("/(patient)/booking/service-catalog" as never)}
          />
        ) : isPast ? (
          <Button
            title="Rebook treatment"
            size="lg"
            arrow={true}
            onPress={() => router.push("/(patient)/booking/service-catalog" as never)}
          />
        ) : (
          <>
            <Button
              title="Reschedule"
              variant="secondary"
              size="lg"
              style={styles.footerBtn}
              onPress={() =>
                router.push({ pathname: "/(patient)/booking/slot-picker" as never, params: { rescheduleOf: booking.id } })
              }
            />
            <Button
              title="Cancel"
              variant="destructive"
              size="lg"
              style={styles.footerBtn}
              onPress={() => setConfirmCancel(true)}
            />
          </>
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
    letterSpacing: 0.8,
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
  chipRow: {
    alignSelf: "flex-start",
    marginTop: spacing.xxs,
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
  detailIconBox: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.full,
    height: 32,
    justifyContent: "center",
    width: 32,
    borderColor: colors.separator,
    borderWidth: 1,
  },
  detailLabel: {
    color: colors.secondaryLabel,
    width: 84,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingVertical: 4,
  },
  detailValue: {
    color: colors.label,
    flex: 1,
    fontWeight: "600",
    textAlign: "right",
  },
  divider: {
    backgroundColor: colors.separator,
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
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
