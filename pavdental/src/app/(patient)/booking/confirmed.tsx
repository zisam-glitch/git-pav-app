import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText, Card, Button, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useBookingStore } from "@/features/booking/booking-store";
import { fetchMyAppointments } from "@/features/booking/booking-api";

export default function BookingConfirmedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ appointmentId?: string }>();
  const { service, clinic, slot, resetDraft, channel } = useBookingStore();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const appointmentId = params.appointmentId;

  // Poll for appointment confirmation status
  useEffect(() => {
    const checkConfirmation = async () => {
      try {
        const appointments = await fetchMyAppointments();
        
        // If we have a specific appointmentId, check that one specifically
        if (appointmentId) {
          const targetAppointment = appointments.find((apt: any) => apt.id === appointmentId);
          if (targetAppointment && targetAppointment.status === "confirmed") {
            setIsConfirmed(true);
            setIsChecking(false);
          }
        } else {
          // Fallback: check if the most recent appointment is confirmed
          const recentAppointment = appointments[0];
          if (recentAppointment && recentAppointment.status === "confirmed") {
            setIsConfirmed(true);
            setIsChecking(false);
          }
        }
      } catch (error) {
        console.error("Error checking appointment status:", error);
      }
    };

    // Check immediately, then poll every 2 seconds for up to 45 seconds
    checkConfirmation();
    const interval = setInterval(checkConfirmation, 2000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsChecking(false);
    }, 45000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [appointmentId]);

  const handleFinish = () => {
    resetDraft();
    router.replace("/(patient)/(tabs)/appointments");
  };

  // A video consult starts with the triage questions, which the clinician
  // reads before letting the patient in.
  const isVideo = channel === "video";
  const startConsult = () => {
    if (!appointmentId) return;
    resetDraft();
    router.replace({ pathname: "/(patient)/video/intake" as never, params: { appointmentId } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.centerBox}>
          <View style={[styles.checkCircle, isConfirmed ? styles.confirmedCircle : styles.pendingCircle]}>
            <AppIcon
              name={isChecking ? "clock" : isConfirmed ? "check" : "alert"}
              size={36}
              color={isChecking ? colors.warning : isConfirmed ? colors.success : colors.danger}
            />
          </View>

          <ThemedText variant="largeTitle" style={styles.title}>
            {isChecking ? "Verifying payment..." : isConfirmed ? "Booking confirmed!" : "Payment verification timeout"}
          </ThemedText>
          <ThemedText variant="subhead" style={styles.subtitle}>
            {isChecking 
              ? "Your booking is held while payment is verified. This usually takes a few seconds."
              : isConfirmed
              ? isVideo
                ? "Your video consult is booked. Answer the triage questions now so your clinician can read them first. We'll remind you before it starts."
                : "Your appointment is confirmed. We'll remind you before your visit."
              : "Payment verification is taking longer than expected. Your appointment may still be confirmed. Please check your appointments list."
            }
          </ThemedText>

          {isChecking && (
            <ActivityIndicator size="large" color={colors.ink} style={styles.spinner} />
          )}

          <Card elevation="flat" style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <ThemedText variant="headline" style={styles.treatmentName}>
                {service?.name ?? "Your appointment"}
              </ThemedText>
              <View style={styles.statusPill}>
                <ThemedText variant="caption" style={styles.statusText}>
                  {isConfirmed ? "Confirmed" : "Processing"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.iconBox}>
                <AppIcon name="calendar" size={16} color={colors.ink} />
              </View>
              <View style={styles.detailCol}>
                <ThemedText variant="caption" style={styles.detailLabel}>Date & Time</ThemedText>
                <ThemedText variant="body" style={styles.timing}>
                  {slot ? `${slot.dateFormatted} at ${slot.displayTime}` : "See your appointments"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconBox}>
                <AppIcon name="mapPin" size={16} color={colors.ink} />
              </View>
              <View style={styles.detailCol}>
                <ThemedText variant="caption" style={styles.detailLabel}>Location</ThemedText>
                <ThemedText variant="body" style={styles.location}>
                  {isVideo ? "Video consultation" : clinic?.name ?? "—"}
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.actions}>
          {isConfirmed && isVideo && appointmentId ? (
            <Button title="Answer the triage questions" size="lg" arrow={true} onPress={startConsult} />
          ) : null}
          <Button
            title="View my appointments"
            size="lg"
            variant={isConfirmed && isVideo && appointmentId ? "secondary" : undefined}
            arrow={!(isConfirmed && isVideo)}
            onPress={handleFinish}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
  },
  centerBox: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
  },
  checkCircle: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 72,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 72,
  },
  confirmedCircle: {
    backgroundColor: colors.successSubtle,
  },
  pendingCircle: {
    backgroundColor: colors.warningSubtle,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  spinner: {
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.secondaryLabel,
    lineHeight: 22,
    paddingHorizontal: spacing.gutter,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    width: "100%",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  treatmentName: {
    color: colors.label,
    fontWeight: "700",
    fontSize: 17,
    flex: 1,
  },
  statusPill: {
    backgroundColor: colors.successSubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  statusText: {
    color: colors.success,
    fontWeight: "700",
    fontSize: 11,
  },
  divider: {
    backgroundColor: colors.separator,
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconBox: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderColor: colors.separator,
    borderWidth: 1,
  },
  detailCol: {
    flex: 1,
    gap: 1,
  },
  detailLabel: {
    color: colors.secondaryLabel,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  location: {
    color: colors.label,
    fontWeight: "500",
  },
  timing: {
    color: colors.ink,
    fontWeight: "600",
  },
  title: {
    color: colors.label,
    textAlign: "center",
    fontWeight: "700",
  },
});
