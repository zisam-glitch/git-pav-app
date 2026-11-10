import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText, Card, Button, AppIcon, Badge } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authFetch } from "@/features/auth/auth-api";
import { PRACTICE_CONFIG } from "@/config/practice";
import { isRunningLate, waitingTrouble, waitingStatusLine, type WaitingTrouble } from "@/features/video/waiting-state";

export default function WaitingRoomScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [trouble, setTrouble] = useState<WaitingTrouble>(null);
  const [startTimeUtc, setStartTimeUtc] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [opensAt, setOpensAt] = useState<string | null>(null);
  const [admitted, setAdmitted] = useState(false);
  const failures = useRef(0);

  useEffect(() => {
    let active = true;
    async function pollRoomStatus() {
      if (!appointmentId) return;
      try {
        // Reporting in tells the dentist the patient is here (V10).
        const res = await authFetch(`/api/video/waiting/${appointmentId}`, { method: "POST" });
        if (!active) return;
        if (res.status === 409) {
          const early = await res.json().catch(() => ({}));
          // Not open yet is not a failure: say when it opens, and keep checking.
          if (early?.code === "not_open_yet") {
            setOpensAt(early.opensAt ?? null);
            setTrouble(null);
            return;
          }
          setTrouble("closed");
          return;
        }
        setOpensAt(null);
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
          setAdmitted(true);
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
    // Check on an interval only while the app is in front, and check at once
    // when it comes back (V13).
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (interval) return;
      pollRoomStatus();
      interval = setInterval(() => {
        setNow(Date.now());
        pollRoomStatus();
      }, 5000);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };
    if (AppState.currentState === "active") start();
    const sub = AppState.addEventListener("change", (state) => (state === "active" ? start() : stop()));
    return () => {
      active = false;
      stop();
      sub.remove();
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
            {opensAt
              ? `The waiting room opens at ${new Date(opensAt).toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" })}.`
              : "Your dentist will let you in soon. Please keep this screen open."}
          </ThemedText>

          {/* Consultation Pre-flight Checklist */}
          <Card style={styles.queueCard}>
            <View style={styles.queueHeaderRow}>
              <ThemedText variant="headline" style={styles.queueCardTitle}>
                Your video visit
              </ThemedText>
              <Badge label={waitingStatusLine({ admitted, late: isRunningLate(startTimeUtc, now), opensAt })} />
            </View>

            <View style={styles.checklist}>
              <View style={styles.checkItem}>
                <View style={styles.checkTextGroup}>
                  <ThemedText variant="subhead" style={styles.checkTitle}>
                    Your dentist
                  </ThemedText>
                  <ThemedText variant="caption" style={styles.muted}>
                    Waiting for your dentist to let you in
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
              title="Message your dentist"
              variant="secondary"
              size="md"
              onPress={() => router.push({ pathname: "/(patient)/video/message" as never, params: { appointmentId: appointmentId || "" } })}
            />
          ) : null}
          <Button
            title="Leave waiting room"
            variant="ghost"
            size="md"
            onPress={() => {
              // Tell the practice the patient has gone, then leave.
              if (appointmentId) authFetch(`/api/video/waiting/${appointmentId}/leave`, { method: "POST" }).catch(() => {});
              router.replace("/(patient)/(tabs)/home");
            }}
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

