import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, Button, ConfirmSheet, EmptyState, IconButton, QueryState, Toast } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useAppointment, useRescheduleAppointmentMutation, useSlots } from "@/features/hooks/use-dental-api";
import { TimeSlot } from "@/features/booking/booking-types";
import {
  RESCHEDULE_DAYS,
  TOO_LATE_MESSAGE,
  offerableSlots,
  rescheduleQuestion,
  rescheduleState,
} from "@/features/booking/reschedule";
import { ukDateLabel, ukDayLabel, ukTime, upcomingUkDates } from "@/features/booking/uk-time";

// ─── Choose a new time for a booking ─────────────────────────────────────────
// Free with 48 hours' notice or more, and the deposit stays with the booking, so
// nothing is paid or refunded here. The service, place and dentist stay the same.

interface Booking {
  id: string;
  status: string;
  channel: string;
  startTimeUtc: string;
  serviceId?: string;
  clinicId?: string | null;
  clinicianId?: string | null;
  service?: { name?: string };
}

export default function RescheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const { data: apiBooking, isLoading: loadingBooking } = useAppointment(appointmentId);
  const moveMutation = useRescheduleAppointmentMutation();

  const booking = (apiBooking ?? undefined) as Booking | undefined;

  const days = useMemo(() => upcomingUkDates(RESCHEDULE_DAYS).map((iso) => ({ iso, label: ukDayLabel(iso) })), []);
  const [dayIso, setDayIso] = useState<string>(days[0].iso);
  const [selected, setSelected] = useState<TimeSlot | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const allowed = booking ? rescheduleState(booking) === "allowed" : false;
  const { data: apiSlots, isLoading, isError, refetch } = useSlots({
    // No request until the booking has loaded and can be moved.
    date: allowed ? dayIso : "",
    channel: booking?.channel,
    clinicId: booking?.clinicId ?? undefined,
    clinicianId: booking?.clinicianId ?? undefined,
    serviceId: booking?.serviceId,
  });
  const slots = offerableSlots((apiSlots ?? []) as TimeSlot[]);

  const back = () => router.back();

  if (loadingBooking) {
    return <View style={styles.container} />;
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <EmptyState
          illustration="notFound"
          heading="Booking not found"
          body="This booking may have been removed or belongs to another account."
          actionLabel="Back"
          onAction={back}
          icon="calendar"
        />
      </View>
    );
  }

  // A link straight to this screen for a booking that can't be moved.
  if (!allowed) {
    const tooLate = rescheduleState(booking) === "too_late";
    return (
      <View style={styles.container}>
        <EmptyState
          illustration="schedule"
          heading="This booking can't be moved"
          body={tooLate ? TOO_LATE_MESSAGE : "Only a confirmed clinic or video booking can be moved."}
          actionLabel="Back to the booking"
          onAction={back}
          icon="calendar"
        />
      </View>
    );
  }

  const current = new Date(booking.startTimeUtc);
  const currentLine = `${ukDateLabel(current, { weekday: "short", day: "numeric", month: "short" })} at ${ukTime(current)} UK time`;

  const doMove = () => {
    if (!selected?.startTimeUtc) return;
    setConfirming(false);
    moveMutation.mutate(
      { appointmentId: booking.id, startTimeUtc: selected.startTimeUtc },
      {
        onSuccess: () => router.replace({ pathname: "/(patient)/appointments/[id]" as never, params: { id: booking.id } }),
        onError: (err: Error) => {
          // The time may have just gone: refresh the list and let them pick again.
          setSelected(null);
          void refetch();
          setToast({ message: err.message || "Could not move the booking", tone: "error" });
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      {toast ? <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} /> : null}

      <View style={[styles.topNav, { paddingTop: Math.max(spacing.xs, insets.top) }]}>
        <IconButton icon="arrowLeft" label="Go back" variant="soft" size={22} onPress={back} />
        <ThemedText variant="headline" style={styles.navTitle}>
          Choose a new time
        </ThemedText>
        <View style={styles.navSpacer} />
      </View>

      <View style={styles.intro}>
        <ThemedText variant="body" style={styles.introText}>
          {booking.service?.name ?? "Your visit"} is booked for {currentLine}.
        </ThemedText>
        <ThemedText variant="caption" style={styles.muted}>
          Moving it is free, and your deposit stays with the booking.
        </ThemedText>
      </View>

      <View style={styles.dateBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={styles.dateScroll}>
          {days.map((d) => {
            const active = dayIso === d.iso;
            return (
              <Pressable
                key={d.iso}
                accessibilityRole="button"
                accessibilityLabel={d.label}
                accessibilityState={{ selected: active }}
                onPress={() => {
                  setDayIso(d.iso);
                  setSelected(null);
                }}
                style={({ pressed }) => [styles.datePill, active && styles.datePillActive, pressed && { opacity: 0.8 }]}
              >
                <ThemedText variant="caption" style={[styles.dateText, active && styles.dateTextActive]}>
                  {d.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText variant="headline" style={styles.sectionHeader}>
          Free times on {ukDayLabel(dayIso)}
        </ThemedText>
        <QueryState
          isLoading={isLoading}
          isError={isError}
          data={apiSlots === undefined ? undefined : slots}
          onRetry={() => refetch()}
          errorMessage="We couldn't load times for this day. Check your connection and try again."
          emptyIllustration="schedule"
          emptyHeading="No free times"
          emptyBody="There are no free times on this day. Try another day."
          emptyIcon="calendar"
          skeletonType="box"
          skeletonCount={1}
          skeletonHeight={120}
        >
          {(list) => (
            <View style={styles.slotGrid}>
              {list.map((slot) => {
                const isSelected = selected?.id === slot.id;
                return (
                  <Pressable
                    key={slot.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`Move to ${slot.displayTime}`}
                    onPress={() => setSelected(slot)}
                    style={({ pressed }) => [styles.slotItem, isSelected && styles.slotItemSelected, pressed && { opacity: 0.85 }]}
                  >
                    <ThemedText variant="headline" style={[styles.slotTime, isSelected && styles.slotTimeSelected]}>
                      {slot.displayTime}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </QueryState>
      </ScrollView>

      <View style={[styles.footerBar, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <Button
          title={selected ? `Move to ${selected.displayTime}` : "Choose a new time"}
          size="lg"
          arrow
          disabled={!selected || moveMutation.isPending}
          onPress={() => setConfirming(true)}
        />
      </View>

      {confirming && selected?.startTimeUtc ? (
        <ConfirmSheet
          illustration="schedule"
          title="Move this booking?"
          message={rescheduleQuestion(selected.startTimeUtc)}
          confirmLabel="Move my booking"
          cancelLabel="Keep the current time"
          onConfirm={doMove}
          onCancel={() => setConfirming(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.md, paddingHorizontal: spacing.gutter, paddingVertical: spacing.md, paddingBottom: spacing.xxxl },
  dateBar: {
    backgroundColor: colors.systemBackground,
    borderBottomColor: colors.separator,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  datePill: { backgroundColor: colors.systemBackground, borderRadius: radius.full, paddingHorizontal: spacing.gutter, paddingVertical: 10 },
  datePillActive: { backgroundColor: colors.accent },
  dateScroll: { alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.gutter, paddingVertical: spacing.sm },
  dateText: { color: colors.label, fontWeight: "600" },
  dateTextActive: { color: colors.onAccent },
  footerBar: { backgroundColor: colors.background, paddingHorizontal: spacing.gutter, paddingVertical: spacing.sm },
  hScroll: { flexGrow: 0 },
  intro: { gap: spacing.xxs, paddingHorizontal: spacing.gutter, paddingBottom: spacing.sm },
  introText: { color: colors.label },
  muted: { color: colors.secondaryLabel },
  navSpacer: { width: 44 },
  navTitle: { color: colors.label, fontWeight: "700" },
  sectionHeader: { color: colors.label, fontWeight: "700" },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  slotItem: { alignItems: "center", backgroundColor: colors.systemBackground, borderRadius: radius.lg, justifyContent: "center", paddingVertical: spacing.md, width: "31%" },
  slotItemSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  slotTime: { color: colors.label, fontWeight: "600" },
  slotTimeSelected: { color: colors.onAccent, fontWeight: "700" },
  topNav: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.gutter, paddingTop: spacing.xs, paddingBottom: spacing.xs },
});
