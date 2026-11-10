import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { ThemedText, Button, Toast, EmptyState } from "@/components";
import { colors, spacing } from "@/theme";
import { useAppointment } from "@/features/hooks/use-dental-api";
import { ukDateLabel, ukTime } from "@/features/booking/uk-time";
import { CHECK_IN_OPENS_HOURS } from "@/features/booking/appointment-detail";
import { completeAppointmentCheckIn } from "@/features/records/records-api";

// ─── Check-in ─────────────────────────────────────────────────────────────────
// One action: tell the practice you're coming. No forms here. Consent to
// treatment is taken in person (decisions log D-06), so nothing is recorded as
// done unless it was.

export default function CheckInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const { data: apiBooking } = useAppointment(appointmentId);

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  // Only the booking we were sent for; never "the first one in the list".
  const booking = (appointmentId ? apiBooking ?? null : null) as { id: string; startTimeUtc: string; service?: { name?: string } } | null;
  const start = booking ? new Date(booking.startTimeUtc) : null;
  const whenLine =
    start &&
    `${ukDateLabel(start, { weekday: "long", day: "numeric", month: "short" })} at ${ukTime(start)} UK time`;

  if (!booking) {
    return (
      <View style={styles.container}>
        <EmptyState
          illustration="appointments"
          heading="Nothing to check in for"
          body={`Check-in opens ${CHECK_IN_OPENS_HOURS} hours before your appointment. Open the booking from your bookings to check in.`}
          actionLabel="Back to bookings"
          onAction={() => router.replace("/(patient)/(tabs)/appointments" as never)}
          icon="clipboard"
        />
      </View>
    );
  }

  const complete = async () => {
    setBusy(true);
    try {
      await completeAppointmentCheckIn(booking.id, { completedTasks: [] });
      await queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      router.replace({ pathname: "/(patient)/appointments/[id]" as never, params: { id: booking.id } });
    } catch (err: any) {
      setToast({
        message: err?.message || "Could not check in. Please try again.",
        tone: "error",
      });
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      {toast ? <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} /> : null}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="overline">Check in</ThemedText>
          <ThemedText variant="largeTitle" style={styles.title}>
            Let us know you're coming
          </ThemedText>
          <ThemedText variant="subhead" style={styles.subtitle}>
            {booking.service?.name || "Appointment"} · {whenLine}
          </ThemedText>
        </View>

        <ThemedText variant="body" style={styles.body}>
          Checking in tells the practice you're on your way. There are no forms to fill in: your dentist will go through
          your medical history and ask for your consent to treatment at your visit.
        </ThemedText>
      </ScrollView>

      <View style={[styles.footerBar, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <Button testID="check-in-submit" title="Check in" size="lg" loading={busy} onPress={complete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.label,
    lineHeight: 22,
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
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  header: {
    gap: 2,
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  title: {
    color: colors.label,
  },
});
