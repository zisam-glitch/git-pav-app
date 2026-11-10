import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText, Card, Button, AppIcon, Badge } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authFetch } from "@/features/auth/auth-api";
import { PRACTICE_CONFIG } from "@/config/practice";
import { isRunningLate, waitingTrouble, type WaitingTrouble } from "@/features/video/waiting-state";

export default function WaitingRoomScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [statusLabel, setStatusLabel] = useState("Waiting");
  const [trouble, setTrouble] = useState<WaitingTrouble>(null);
  const [startTimeUtc, setStartTimeUtc] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const failures = useRef(0);

  useEffect(() => {
    let active = true;
    async function pollRoomStatus() {
      if (!appointmentId) return;
      try {
        const res = await authFetch(`/api/video/status/${appointmentId}`);
        if (!active) return;
        if (!res.ok) {
          // A 404 or 403 will not fix itself; anything else may be a passing blip.
          failures.current += res.status === 404 || res.status === 403 ? 3 : 1;
          setTrouble(waitingTrouble({ failures: failures.current }));
          return;
        }
        failures.current = 0;
        const data = await res.json();
        if (typeof data?.startTimeUtc === "string") setStartTimeUtc(data.startTimeUtc);
        const closed = waitingTrouble({ failures: 0, status: data?.status });
        setTrouble(closed);
        if (closed) return;
        if (data?.admitted || data?.status === "in_progress" || data?.status === "IN_PROGRESS") {
          setStatusLabel("Clinician Admitted You");
          router.replace({
            pathname: "/(patient)/video/call" as any,
            params: { appointmentId },
          });
        }
      } catch {
        if (!active) return;
        failures.current += 1;
        setTrouble(waitingTrouble({ failures: failures.current }));
      }
    }
    pollRoomStatus();
    const interval = setInterval(() => {
      setNow(Date.now());
      pollRoomStatus();
    }, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [appointmentId, router]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.center}>
          <View style={styles.spinnerCircle}>
            <ActivityIndicator size="large" color={colors.ink} />
          </View>

          <ThemedText variant="largeTitle" style={styles.title}>
            Waiting room
          </ThemedText>

          <ThemedText variant="subhead" style={styles.subtitle}>
            Your clinician will connect with you shortly. Please keep this screen open.
          </ThemedText>

          {/* Consultation Pre-flight Checklist */}
          <Card style={styles.queueCard}>
            <View style={styles.queueHeaderRow}>
              <ThemedText variant="headline" style={styles.queueCardTitle}>
                Consultation ready
              </ThemedText>
              <Badge label={statusLabel} />
            </View>

            <View style={styles.checklist}>
              <View style={styles.checkItem}>
                <View style={styles.checkTextGroup}>
                  <ThemedText variant="subhead" style={styles.checkTitle}>
                    Clinician connection
                  </ThemedText>
                  <ThemedText variant="caption" style={styles.muted}>
                    Waiting for your clinician to join
                  </ThemedText>
                </View>
              </View>
            </View>
          </Card>

          {trouble === "connection" ? (
            <ThemedText variant="caption" style={styles.subtitle}>
              We can't reach the practice. Check your connection; we'll keep trying.
            </ThemedText>
          ) : trouble === "closed" ? (
            <ThemedText variant="caption" style={styles.subtitle}>
              This consultation is no longer open. Go back to your bookings to see what happened.
            </ThemedText>
          ) : isRunningLate(startTimeUtc, now) ? (
            <ThemedText variant="caption" style={styles.subtitle}>
              Your clinician is running a little late. Please stay here, or call us on {PRACTICE_CONFIG.phone}.
            </ThemedText>
          ) : null}

          <View style={styles.reassuranceBox}>
            <AppIcon name="lock" size={14} color={colors.secondaryLabel} />
            <ThemedText variant="caption" style={styles.reassuranceText}>
              Private room: only you and your clinician can join this call
            </ThemedText>
          </View>
        </View>

        <View style={styles.actions}>
          {isRunningLate(startTimeUtc, now) || trouble ? (
            <Button
              title="Message the practice"
              variant="secondary"
              size="md"
              onPress={() => router.push("/(patient)/(tabs)/messages" as never)}
            />
          ) : null}
          <Button
            title="Leave waiting room"
            variant="ghost"
            size="md"
            onPress={() => router.replace("/(patient)/(tabs)/home")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.xs,
  },
  center: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
  },
  checkItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  checkTextGroup: {
    flex: 1,
    gap: 1,
  },
  checkTitle: {
    color: colors.label,
    fontWeight: "600",
  },
  checklist: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  muted: {
    color: colors.secondaryLabel,
  },
  queueCard: {
    borderCurve: "continuous",
    borderColor: colors.separator,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    width: "100%",
  },
  queueCardTitle: {
    color: colors.label,
  },
  queueHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reassuranceBox: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
  reassuranceText: {
    color: colors.secondaryLabel,
    lineHeight: 16,
    textAlign: "center",
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  spinnerCircle: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.xl,
    height: 72,
    justifyContent: "center",
    marginBottom: spacing.xxs,
    width: 72,
  },
  subtitle: {
    color: colors.secondaryLabel,
    lineHeight: 20,
    paddingHorizontal: spacing.gutter,
    textAlign: "center",
  },
  title: {
    color: colors.label,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
  },
});

