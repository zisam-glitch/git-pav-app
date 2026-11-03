import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, Card, Badge, Button, EmptyState, ErrorState, Skeleton, ChipPill, ConfirmSheet, Toast, AppIcon } from "@/components";
import { appointmentClinician, appointmentLocation } from "@/features/booking/appointment-labels";
import { colors, spacing, radius } from "@/theme";
import { useMyAppointments, useCancelAppointmentMutation } from "@/features/hooks/use-dental-api";
import { toLabel } from "@/lib/text";

// ─── Bookings — upcoming/past grouping with clear status per card ─────────────

interface Booking {
  id: string;
  status: string;
  channel: string;
  startTimeUtc: string;
  service?: { name?: string };
  clinician?: { fullName?: string };
  clinic?: { name?: string };
  van?: { name?: string };
  dependant?: { firstName: string; lastName: string } | null;
}

function BookingCard({
  booking,
  past,
  onCancel,
}: {
  booking: Booking;
  past: boolean;
  onCancel: (id: string) => void;
}) {
  const router = useRouter();
  const start = new Date(booking.startTimeUtc);
  const weekday = start.toLocaleDateString("en-GB", { weekday: "short" });
  const day = start.getDate();
  const month = start.toLocaleDateString("en-GB", { month: "short" });
  const time = start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const locationName = appointmentLocation(booking);
  const clinicianName = appointmentClinician(booking);
  const cancelled = booking.status === "cancelled";

  return (
    <Card
      elevation={past ? "flat" : "raised"}
      style={styles.card}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open details for ${booking.service?.name || "appointment"} on ${day} ${month}`}
        onPress={() => router.push({ pathname: "/(patient)/appointments/[id]" as never, params: { id: booking.id } })}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
      <View style={styles.cardBody}>
        {/* Date block */}
        <View style={styles.dateBlock}>
          <ThemedText variant="caption" style={styles.dateWeekday}>
            {weekday}
          </ThemedText>
          <ThemedText variant="title" style={styles.dateDay}>
            {day}
          </ThemedText>
          <ThemedText variant="caption" style={styles.dateMonth}>
            {month}
          </ThemedText>
        </View>

        <View style={styles.cardMain}>
          <View style={styles.cardTop}>
            <ThemedText variant="headline" numberOfLines={1} style={styles.serviceTitle}>
              {booking.service?.name || "Dental Treatment"}
            </ThemedText>
            {!past && !cancelled ? (
              <Badge label={toLabel(booking.status)} variant={booking.status === "confirmed" ? "success" : "default"} />
            ) : null}
          </View>

          <ChipPill label={`${time} · ${toLabel(booking.channel)}`} tone={past || cancelled ? "neutral" : "info"} />

          {booking.dependant ? (
            <ThemedText variant="caption" style={styles.metaText} numberOfLines={1}>
              For {booking.dependant.firstName} {booking.dependant.lastName}
            </ThemedText>
          ) : null}

          <View style={styles.metaRow}>
            <AppIcon name="profile" size={13} color={colors.secondaryLabel} />
            <ThemedText variant="caption" style={styles.metaText} numberOfLines={1}>
              {clinicianName}
            </ThemedText>
          </View>
          <View style={styles.metaRow}>
            <AppIcon name="mapPin" size={13} color={colors.secondaryLabel} />
            <ThemedText variant="caption" style={styles.metaText} numberOfLines={1}>
              {locationName}
            </ThemedText>
          </View>

          {cancelled ? <Badge label="Cancelled" variant="danger" /> : null}
        </View>
      </View>
      </Pressable>
      {cancelled ? null : !past ? (
        <Button
          title="Cancel booking"
          variant="ghost"
          size="sm"
          accessibilityLabel={`Cancel ${booking.service?.name || "appointment"} on ${day} ${month}`}
          onPress={() => onCancel(booking.id)}
          style={styles.cancelBtn}
        />
      ) : null}
    </Card>
  );
}

export default function PatientAppointmentsScreen() {
  const router = useRouter();
  const { data: apiAppointments, isLoading, isError, refetch } = useMyAppointments();
  const cancelMutation = useCancelAppointmentMutation();
  const [pendingCancel, setPendingCancel] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const bookings: Booking[] = (apiAppointments ?? []) as Booking[];
    const upcoming = bookings
      .filter((b) => b.status !== "cancelled" && new Date(b.startTimeUtc).getTime() >= now)
      .sort((a, b) => +new Date(a.startTimeUtc) - +new Date(b.startTimeUtc));
    const past = bookings
      .filter((b) => !upcoming.includes(b))
      .sort((a, b) => +new Date(b.startTimeUtc) - +new Date(a.startTimeUtc));
    return { upcoming, past };
  }, [apiAppointments]);

  const confirmCancel = () => {
    if (!pendingCancel) return;
    const id = pendingCancel;
    setPendingCancel(null);
    cancelMutation.mutate(id, {
      onSuccess: () => setToast({ message: "Appointment cancelled", tone: "success" }),
      onError: (err: Error) =>
        setToast({ message: err.message || "Could not cancel the appointment", tone: "error" }),
    });
  };

  return (
    <View style={styles.container}>
      {toast ? (
        <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} />
      ) : null}

      <ScrollView contentContainerStyle={styles.list}>
        {isLoading ? (
          <View style={styles.stack}>
            <Skeleton height={110} borderRadius={16} />
            <Skeleton height={110} borderRadius={16} />
            <Skeleton height={110} borderRadius={16} />
          </View>
        ) : isError ? (
          <ErrorState
            message="Could not load your appointments. Please try again."
            onRetry={() => refetch()}
          />
        ) : upcoming.length === 0 && past.length === 0 ? (
          <EmptyState
            heading="No appointments yet"
            body="Book a clinic visit, video consult, or mobile van in a few taps."
            actionLabel="Book an appointment"
            onAction={() => router.push("/(patient)/booking/service-catalog" as never)}
            icon="calendar"
          />
        ) : (
          <>
            {upcoming.length > 0 ? (
              <View style={styles.group}>
                <ThemedText variant="overline">Upcoming</ThemedText>
                <View style={styles.stack}>
                  {upcoming.map((b) => (
                    <BookingCard key={b.id} booking={b} past={false} onCancel={setPendingCancel} />
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.group}>
                <ThemedText variant="overline">Upcoming</ThemedText>
                <Card style={styles.emptyUpcomingCard}>
                  <ThemedText variant="headline">No upcoming visits</ThemedText>
                  <ThemedText variant="subhead" style={styles.emptyUpcomingBody}>
                    You have no upcoming appointments booked. Choose a treatment below to book your next check-up or cleaning.
                  </ThemedText>
                </Card>
              </View>
            )}

            {past.length > 0 ? (
              <View style={styles.group}>
                <ThemedText variant="overline">Past</ThemedText>
                <View style={styles.stack}>
                  {past.map((b) => (
                    <BookingCard key={b.id} booking={b} past={true} onCancel={setPendingCancel} />
                  ))}
                </View>
              </View>
            ) : null}

            <Button
              title="Book another appointment"
              size="lg"
              onPress={() => router.push("/(patient)/booking/service-catalog" as never)}
              style={styles.bookAgain}
            />
          </>
        )}
      </ScrollView>

      {pendingCancel ? (
        <ConfirmSheet
          title="Cancel this appointment?"
          message="Your slot will be released immediately. Any deposit hold will be refunded by your bank within 5 working days."
          confirmLabel="Cancel Appointment"
          cancelLabel="Keep Booking"
          variant="destructive"
          onConfirm={confirmCancel}
          onCancel={() => setPendingCancel(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cancelBtn: {
    alignSelf: "flex-start",
    marginTop: spacing.xxs,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderColor: colors.separator,
  },
  cardBody: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cardMain: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  emptyUpcomingBody: {
    color: colors.secondaryLabel,
  },
  emptyUpcomingCard: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  dateBlock: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.lg,
    gap: 1,
    minWidth: 56,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    alignSelf: "flex-start",
  },
  dateDay: {
    color: colors.ink,
    lineHeight: 26,
  },
  dateMonth: {
    color: colors.secondaryLabel,
  },
  dateWeekday: {
    color: colors.secondaryLabel,
  },
  group: {
    gap: spacing.xs,
  },
  list: {
    gap: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  metaText: {
    color: colors.secondaryLabel,
    flex: 1,
  },
  serviceTitle: {
    flex: 1,
  },
  stack: {
    gap: spacing.sm,
  },
  bookAgain: {
    marginTop: spacing.xs,
  },
});
