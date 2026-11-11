import { buildAppointmentRows } from "@/features/booking/appointment-rows";
import React, { useMemo, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { usePullToRefresh } from "@/lib/pull-to-refresh";
import { useRouter } from "expo-router";
import { ThemedText, Card, Badge, Button, EmptyState, ErrorState, Skeleton, ConfirmSheet, Toast, ListRow, IconTile, type AppIconName } from "@/components";
import { appointmentClinician, appointmentLocation } from "@/features/booking/appointment-labels";
import { colors, spacing } from "@/theme";
import { useMyAppointments, useCancelAppointmentMutation } from "@/features/hooks/use-dental-api";
import { toLabel } from "@/lib/text";
import { appointmentBadge, isUpcomingBooking } from "@/features/booking/appointment-status";
import { cancellationSheetMessage } from "@/features/booking/policies";
import { ukDateLabel, ukTime } from "@/features/booking/uk-time";

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

const CHANNEL_ICON: Record<string, AppIconName> = { video: "video", van: "truck", clinic: "mapPin" };

/**
 * One visit as a Wise activity row: channel icon, treatment, "when · how",
 * where and who, status on the right. Upcoming visits keep "Cancel booking".
 */
function BookingRow({
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
  const date = ukDateLabel(start, { weekday: "short", day: "numeric", month: "short" });
  const time = ukTime(start);
  const cancelled = booking.status === "cancelled";
  const who = booking.dependant
    ? `For ${booking.dependant.firstName} ${booking.dependant.lastName}`
    : appointmentClinician(booking);
  const status = cancelled ? (
    <Badge label="Cancelled" variant="danger" />
  ) : (
    // "Completed", "Missed" or "Past" for a visit that is over; "Confirmed" for one to come.
    <Badge {...appointmentBadge(booking)} />
  );

  return (
    <View>
      <ListRow
        inset="flush"
        title={booking.service?.name || "Dental treatment"}
        subtitle={`${date} · ${time} · ${toLabel(booking.channel)}\n${appointmentLocation(booking)} · ${who}`}
        left={<IconTile icon={CHANNEL_ICON[booking.channel] ?? "calendar"} />}
        right={status}
        accessibilityLabel={`${booking.service?.name || "Appointment"}, ${date} at ${time}${cancelled ? ", cancelled" : ""}. Open details`}
        onPress={() => router.push({ pathname: "/(patient)/appointments/[id]" as never, params: { id: booking.id } })}
      />
      {cancelled || past ? null : (
        <Button
          title="Cancel booking"
          variant="ghost"
          size="sm"
          accessibilityLabel={`Cancel ${booking.service?.name || "appointment"} on ${date}`}
          onPress={() => onCancel(booking.id)}
          style={styles.cancelBtn}
        />
      )}
    </View>
  );
}

export default function PatientAppointmentsScreen() {
  const router = useRouter();
  const { data: apiAppointments, isLoading, isError, refetch } = useMyAppointments();
  const cancelMutation = useCancelAppointmentMutation();
  const refresh = usePullToRefresh();
  const [pendingCancel, setPendingCancel] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const bookings: Booking[] = (apiAppointments ?? []) as Booking[];
    // Only a visit still to happen is "Upcoming" (and can be cancelled here).
    // Completed, missed and cancelled ones are history whatever their date, and
    // an unpaid hold is not a booking yet, so it is not listed at all.
    const upcoming = bookings
      .filter((b) => isUpcomingBooking(b, now))
      .sort((a, b) => +new Date(a.startTimeUtc) - +new Date(b.startTimeUtc));
    const past = bookings
      .filter((b) => b.status !== "draft_hold" && !upcoming.includes(b))
      .sort((a, b) => +new Date(b.startTimeUtc) - +new Date(a.startTimeUtc));
    return { upcoming, past };
  }, [apiAppointments]);

  // A flat list of rows, so only those on screen are drawn.
  const showRows = !isLoading && !isError && (upcoming.length > 0 || past.length > 0);
  const rows = useMemo(() => buildAppointmentRows(upcoming, past), [upcoming, past]);

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

      <FlatList
        data={showRows ? rows : []}
        keyExtractor={(row) => row.key}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refresh.refreshing} onRefresh={refresh.onRefresh} />}
        renderItem={({ item }) => {
          if (item.kind === "heading") {
            return (
              <ThemedText variant="title" style={item.key === "heading-past" ? styles.pastHeading : undefined}>
                {item.title}
              </ThemedText>
            );
          }
          if (item.kind === "no-upcoming") {
            return (
              <Card style={styles.emptyUpcomingCard}>
                <ThemedText variant="headline">No upcoming visits</ThemedText>
                <ThemedText variant="subhead" style={styles.emptyUpcomingBody}>
                  You have no upcoming appointments booked. Choose a treatment below to book your next check-up or cleaning.
                </ThemedText>
              </Card>
            );
          }
          return (
            <BookingRow booking={item.booking} past={item.past} onCancel={setPendingCancel} />
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.stack}>
              <Skeleton height={110} borderRadius={16} />
              <Skeleton height={110} borderRadius={16} />
              <Skeleton height={110} borderRadius={16} />
            </View>
          ) : isError ? (
            <ErrorState message="Could not load your appointments. Please try again." onRetry={() => refetch()} />
          ) : (
            <EmptyState
              illustration="appointments"
              heading="No appointments yet"
              body="Book a clinic visit, video consult, or mobile van in a few taps."
              actionLabel="Book an appointment"
              onAction={() => router.push("/(patient)/booking/service-catalog" as never)}
              icon="calendar"
            />
          )
        }
        ListFooterComponent={
          showRows ? (
            <Button
              title="Book another appointment"
              size="lg"
              onPress={() => router.push("/(patient)/booking/service-catalog" as never)}
              style={styles.bookAgain}
            />
          ) : null
        }
      />

      {pendingCancel ? (
        <ConfirmSheet
          title="Cancel this appointment?"
          message={cancellationSheetMessage()}
          confirmLabel="Cancel appointment"
          cancelLabel="Keep booking"
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
    marginLeft: 64,
    marginTop: -spacing.xs,
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
  list: {
    gap: spacing.xxs,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  pastHeading: {
    marginTop: spacing.lg,
  },
  stack: {
    gap: spacing.xxs,
  },
  bookAgain: {
    marginTop: spacing.xs,
  },
});
