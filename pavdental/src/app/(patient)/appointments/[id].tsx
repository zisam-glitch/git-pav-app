import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
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
import { PRACTICE_CONFIG } from "@/config/practice";
import { appointmentClinician, appointmentLocation } from "@/features/booking/appointment-labels";
import { colors, spacing, radius } from "@/theme";
import { useAppointment, useCancelAppointmentMutation } from "@/features/hooks/use-dental-api";
import {
  balanceLabel,
  canCheckIn,
  clinicAddressLine,
  directionsUrl,
  priceLabel,
  visitFor,
} from "@/features/booking/appointment-detail";
import { toLabel } from "@/lib/text";
import { appointmentBadge, depositPaidLabel } from "@/features/booking/appointment-status";
import { CANCELLATION_SHEET_MESSAGE } from "@/features/booking/cancellation-policy";
import { TOO_LATE_MESSAGE, rescheduleState } from "@/features/booking/reschedule";
import { ukDateLabel, ukTime } from "@/features/booking/uk-time";
import { WAITING_ROOM_OPENS_MINUTES, waitingRoomOpen } from "@/features/video/waiting-room-window";

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
  totalPricePence?: number;
  dependant?: { firstName?: string; lastName?: string } | null;
  service?: { name?: string };
  clinician?: { fullName?: string };
  clinic?: { name?: string; address?: string; postcode?: string };
  van?: { name?: string };
  accessDetails?: { checkedIn?: boolean } | null;
}

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: apiBooking, isLoading, isError, refetch } = useAppointment(id);
  const cancelMutation = useCancelAppointmentMutation();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const booking = (apiBooking ?? undefined) as Booking | undefined;
  // Once the answers are in, the button stops asking for them again (V36).
  const triageAnswered = Boolean(
    (booking as { triageData?: { submittedAt?: string } | null } | undefined)?.triageData?.submittedAt
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={{ padding: spacing.md, minHeight: 180, backgroundColor: colors.inkSubtle, borderRadius: radius.lg }} />
        </View>
      </View>
    );
  }

  if (isError && !booking) {
    return (
      <View style={styles.container}>
        <EmptyState
          illustration="notFound"
          heading="We couldn't load this appointment"
          body="Check your connection and try again. Your booking has not changed."
          actionLabel="Try again"
          onAction={() => refetch()}
          icon="calendar"
        />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <EmptyState
          illustration="notFound"
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
  // A booked video consult is joined from here until its slot ends: answer the
  // triage questions, then wait for the clinician to let the patient in.
  const end = new Date(booking.endTimeUtc ?? booking.startTimeUtc);
  const badge = appointmentBadge(booking);
  // Moving a booking is offered only when it can work: a paid clinic or video
  // visit with 48 hours' notice or more. The server checks again.
  const rescheduleOffer = rescheduleState(booking);
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
          <DetailRow label="For" value={visitFor(booking)} />
          <DetailRow label="Location" value={clinicAddressLine(booking.clinic) ?? locationName} />
          {priceLabel(booking.totalPricePence) ? (
            <DetailRow label="Price" value={priceLabel(booking.totalPricePence) as string} />
          ) : null}
          {booking.accessDetails?.checkedIn ? <DetailRow label="Check-in" value="You're checked in" /> : null}
          <DetailRow label="Deposit paid" value={depositPaidLabel(booking.depositPaidPence)} />
          {balanceLabel(booking) ? (
            <DetailRow label="Balance to pay at your visit" value={balanceLabel(booking) as string} />
          ) : null}
        </Card>

        {!isCancelled && !isPast ? (
          <View style={styles.contactActions}>
            {directionsUrl(booking.clinic) ? (
              <Button
                title="Get directions"
                variant="secondary"
                size="md"
                style={styles.footerBtn}
                onPress={() => Linking.openURL(directionsUrl(booking.clinic) as string).catch(() => {})}
              />
            ) : null}
            <Button
              title="Call the practice"
              variant="secondary"
              size="md"
              style={styles.footerBtn}
              onPress={() => Linking.openURL(PRACTICE_CONFIG.telUrl).catch(() => {})}
            />
          </View>
        ) : null}

        {canJoinVideo ? (
          <Card elevation="flat" style={styles.videoCard}>
            <ThemedText variant="headline">Your video consult</ThemedText>
            <ThemedText variant="caption" style={styles.muted}>
              {triageAnswered
                ? "Your triage answers have been sent. You can change them until your clinician lets you in."
                : "Answer the triage questions first so your clinician can read them, then wait in the waiting room until they let you in."}
            </ThemedText>
            <View style={styles.videoActions}>
              <Button
                title={triageAnswered ? "Change your triage answers" : "Answer the triage questions"}
                variant={triageAnswered ? "secondary" : "primary"}
                size="md"
                onPress={() =>
                  router.push({ pathname: "/(patient)/video/intake" as never, params: { appointmentId: booking.id } })
                }
              />
              {waitingRoomOpen(booking) ? (
                <Button
                  title="Go to the waiting room"
                  variant="secondary"
                  size="md"
                  onPress={() =>
                    router.push({ pathname: "/(patient)/video/device-check" as never, params: { appointmentId: booking.id } })
                  }
                />
              ) : (
                <ThemedText variant="caption" style={styles.muted}>
                  The waiting room opens {WAITING_ROOM_OPENS_MINUTES} minutes before your visit.
                </ThemedText>
              )}
              <Button
                title="Message your dentist"
                variant="ghost"
                size="md"
                onPress={() =>
                  router.push({ pathname: "/(patient)/video/message" as never, params: { appointmentId: booking.id } })
                }
              />
            </View>
          </Card>
        ) : null}

        {/* Pre-visit check-in (Mobbin checklist entry) */}
        {canCheckIn(booking) ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Check in for your visit"
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
                  Check in for your visit
                </ThemedText>
                <ThemedText variant="caption" style={styles.muted}>
                  Let the practice know you're on your way. It takes one tap.
                </ThemedText>
              </View>
              <AppIcon name="chevronRight" size={16} color={colors.alwaysWhite} />
            </Card>
          </Pressable>
        ) : null}

        {rescheduleOffer === "too_late" ? (
          <ThemedText variant="caption" style={styles.rescheduleNote}>
            {TOO_LATE_MESSAGE}
          </ThemedText>
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
          <>
            {rescheduleOffer === "allowed" ? (
              <Button
                title="Reschedule"
                variant="secondary"
                size="lg"
                style={styles.footerBtn}
                onPress={() =>
                  router.push({ pathname: "/(patient)/appointments/reschedule" as never, params: { appointmentId: booking.id } })
                }
              />
            ) : null}
            <Button
              testID="appointment-cancel"
              title="Cancel"
              variant="destructive"
              size="lg"
              style={styles.footerBtn}
              loading={cancelMutation.isPending}
              onPress={() => setConfirmCancel(true)}
            />
          </>
        )}
      </View>

      {confirmCancel ? (
        <ConfirmSheet
          title="Cancel this appointment?"
          message={CANCELLATION_SHEET_MESSAGE}
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
  contactActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
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
  rescheduleNote: {
    color: colors.secondaryLabel,
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
