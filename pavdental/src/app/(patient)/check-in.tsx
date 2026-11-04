import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText, Button, AppIcon, Toast, EmptyState } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useMyAppointments } from "@/features/hooks/use-dental-api";
import { ukDateLabel, ukTime } from "@/features/booking/uk-time";
import { completeAppointmentCheckIn } from "@/features/records/records-api";
import type { AppIconName } from "@/components";

// ─── Digital check-in / pre-visit tasks (Mobbin Zocdoc checklist pattern) ─────
// Things to check before arrival so the visit starts on time. Consent to
// treatment is taken in person (decisions log D-06).

const PRE_ARRIVAL_TASKS: Array<{
  id: string;
  title: string;
  description: string;
  kind: "form" | "consent" | "insurance" | "balance";
  /** Display only; `kind` is what the server records. */
  icon: AppIconName;
}> = [
  {
    id: "task_medical_history",
    title: "Confirm medical history",
    description: "Verify any changes to your medications or allergies.",
    kind: "form",
    icon: "clipboard",
  },
  {
    id: "task_covid",
    title: "Pre-arrival health declaration",
    description: "Confirm you are free of acute respiratory symptoms.",
    kind: "balance",
    icon: "activity",
  },
];

export default function CheckInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const { data: apiAppointments } = useMyAppointments();

  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const source = (apiAppointments ?? []) as any[];
  const booking = (appointmentId ? source.find((b) => b.id === appointmentId) : source[0]) ?? null;
  const start = booking ? new Date(booking.startTimeUtc) : null;
  const whenLine =
    start &&
    `${ukDateLabel(start, { weekday: "long", day: "numeric", month: "short" })} at ${ukTime(start)} UK time`;

  if (!booking) {
    return (
      <View style={styles.container}>
        <EmptyState
          heading="Nothing to check in for"
          body="Check-in opens 24 hours before your appointment."
          actionLabel="Back to bookings"
          onAction={() => router.replace("/(patient)/(tabs)/appointments" as never)}
          icon="clipboard"
        />
      </View>
    );
  }

  const doneCount = PRE_ARRIVAL_TASKS.filter((t) => doneIds.has(t.id)).length;
  const allDone = doneCount === PRE_ARRIVAL_TASKS.length;

  const complete = async () => {
    try {
      await completeAppointmentCheckIn(booking.id, {
        completedTasks: PRE_ARRIVAL_TASKS.filter((t) => doneIds.has(t.id)).map((t) => t.kind),
      });
      setToast({ message: "Checked in — see you soon!", tone: "success" });
      router.replace({ pathname: "/(patient)/appointments/[id]" as never, params: { id: booking.id } });
    } catch (err: any) {
      setToast({
        message: err?.message || "Could not complete check-in. Please try again.",
        tone: "error",
      });
    }
  };

  return (
    <View style={styles.container}>
      {toast ? <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} /> : null}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="overline">Pre-visit check-in</ThemedText>
          <ThemedText variant="largeTitle" style={styles.title}>
            You're nearly there
          </ThemedText>
          <ThemedText variant="subhead" style={styles.subtitle}>
            {booking.service?.name || "Appointment"} · {whenLine}
          </ThemedText>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(doneCount / PRE_ARRIVAL_TASKS.length) * 100}%` }]} />
          </View>
          <ThemedText variant="caption" style={styles.progressLabel}>
            {doneCount} of {PRE_ARRIVAL_TASKS.length} done
          </ThemedText>
        </View>

        {/* Task checklist */}
        <View style={styles.taskList}>
          {PRE_ARRIVAL_TASKS.map((task) => {
            const done = doneIds.has(task.id);
            return (
              <Pressable
                key={task.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                accessibilityLabel={`${task.title}, ${task.description}`}
                onPress={() =>
                  setDoneIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(task.id)) next.delete(task.id);
                    else next.add(task.id);
                    return next;
                  })
                }
                style={({ pressed }) => [
                  styles.taskCard,
                  done && styles.taskCardDone,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={styles.taskIconTile}>
                  <AppIcon name={task.icon} size={18} color={done ? colors.success : colors.ink} />
                </View>
                <View style={styles.taskInfo}>
                  <ThemedText variant="subhead" style={done ? styles.taskTitleDone : styles.taskTitle}>
                    {task.title}
                  </ThemedText>
                  <ThemedText variant="caption" style={styles.taskDesc}>
                    {task.description}
                  </ThemedText>
                </View>
                <AppIcon
                  name={done ? "checkCircle" : "chevronRight"}
                  size={18}
                  color={done ? colors.success : colors.tertiaryLabel}
                />
              </Pressable>
            );
          })}
        </View>

        <ThemedText variant="caption" style={styles.hint}>
          Complete each task before you arrive — reception won't need a single paper form.
        </ThemedText>
      </ScrollView>

      <View style={[styles.footerBar, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <Button
          title={allDone ? "Check in" : "Check in (finish tasks first)"}
          size="lg"
          disabled={!allDone}
          onPress={complete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  hint: {
    color: colors.secondaryLabel,
    lineHeight: 16,
  },
  progressFill: {
    backgroundColor: colors.ink,
    borderRadius: radius.xs,
    height: "100%",
  },
  progressLabel: {
    color: colors.secondaryLabel,
    minWidth: 70,
    textAlign: "right",
  },
  progressRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  progressTrack: {
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    flex: 1,
    height: 6,
    overflow: "hidden",
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  taskCard: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  taskCardDone: {
    backgroundColor: colors.systemBackground,
    borderColor: colors.separator,
  },
  taskDesc: {
    color: colors.secondaryLabel,
    lineHeight: 16,
  },
  taskIconTile: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  taskInfo: {
    flex: 1,
    gap: 2,
  },
  taskList: {
    gap: spacing.sm,
  },
  taskTitle: {
    color: colors.label,
    fontWeight: "700",
  },
  taskTitleDone: {
    color: colors.secondaryLabel,
  },
  title: {
    color: colors.label,
  },
});
