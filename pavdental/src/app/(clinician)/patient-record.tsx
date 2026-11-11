import { formatGbp } from "@/lib/money";
import React, { useState, useCallback, useRef } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { visitOutcomeCopy, recordVisitOutcome, failedPartsMessage, type VisitOutcome } from "@/features/clinician/visit-outcome";
import { ThemedText, Card, Badge, Button, EmptyState, IconButton, AppIcon, ListRow, IconTile } from "@/components";
import { colors, spacing, radius } from "@/theme";
import {
  fetchPatientProfile,
  fetchOdontogram,
  fetchTreatmentPlans,
  fetchAppointmentNotes,
  completeAppointment,
  markAppointmentNoShow,
} from "@/features/records/records-api";
import { toLabel } from "@/lib/text";
import { fdiText } from "@/features/records/tooth-number";

export default function ClinicianPatientRecordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    appointmentId?: string;
    patientId?: string;
    patientName?: string;
    chiefComplaint?: string;
    channel?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setProfile] = useState<any>(null);
  const [teeth, setTeeth] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [notes, setNotes] = useState<any>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  // Parts of the record that did not load: shown as a warning, never as "empty".
  const [failed, setFailed] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<VisitOutcome | null>(null);
  const queryClient = useQueryClient();
  const loadedOnce = useRef(false);

  const patientId = params.patientId || "";
  const appointmentId = params.appointmentId || "";
  const patientName = params.patientName || "Patient Record";

  async function loadRecord() {
    if (!patientId) {
      setLoading(false);
      return;
    }
    // Coming back from an editor refreshes quietly; only the first load shows a spinner.
    if (!loadedOnce.current) setLoading(true);
    setError(null);
    const missed: string[] = [];
    const soft = <T,>(part: string, p: Promise<T>, fallback: T) =>
      p.catch(() => {
        missed.push(part);
        return fallback;
      });
    try {
      const [profData, odontData, planData, noteData] = await Promise.all([
        // A refused or failed profile load is shown as an error, not as an empty record.
        fetchPatientProfile(patientId),
        soft("dental chart", fetchOdontogram(patientId), [] as any[]),
        soft("treatment plans", fetchTreatmentPlans(patientId), [] as any[]),
        appointmentId ? soft("examination notes", fetchAppointmentNotes(appointmentId), null) : null,
      ]);
      setProfile(profData);
      setTeeth(odontData || []);
      setPlans(planData || []);
      setNotes(noteData);
      setFailed(missed);
      loadedOnce.current = true;
    } catch (err: any) {
      setError(err?.message || "Failed to load clinical record");
    } finally {
      setLoading(false);
    }
  }

  // On opening, and again each time the screen comes back into view, so notes,
  // chart and plans edited on the next screen show here straight away.
  useFocusEffect(
    useCallback(() => {
      loadRecord();
    }, [patientId, appointmentId]),
  );

  function confirmOutcome(kind: VisitOutcome) {
    if (!appointmentId || actionInProgress) return;
    const copy = visitOutcomeCopy(kind, params.patientName);
    Alert.alert(copy.title, copy.message, [
      { text: "Cancel", style: "cancel" },
      {
        text: copy.confirmLabel,
        style: kind === "no_show" ? "destructive" : "default",
        onPress: async () => {
          setActionInProgress(true);
          const result = await recordVisitOutcome(
            { complete: completeAppointment, noShow: markAppointmentNoShow },
            kind,
            appointmentId,
          );
          setActionInProgress(false);
          if (result.ok) {
            setOutcome(kind);
            setError(null);
            setStatusMessage(copy.doneMessage);
            // Today's schedule and the appointment lists show the new status.
            queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
          } else {
            Alert.alert("Not saved", result.message);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Navigation & Header */}
        <View style={styles.navRow}>
          <IconButton icon="arrowLeft" label="Back to daily schedule" variant="soft" onPress={() => router.back()} />
          {params.channel ? (
            <Badge
              label={toLabel(params.channel)}
              variant={params.channel === "video" ? "info" : "default"}
            />
          ) : null}
        </View>

        <View style={styles.titleBlock}>
          <ThemedText variant="title" style={styles.title}>
            {patientName}
          </ThemedText>
          {params.chiefComplaint ? (
            <ThemedText variant="caption" style={styles.subtitle}>
              Reason for visit: {params.chiefComplaint}
            </ThemedText>
          ) : null}
        </View>

        {statusMessage ? (
          <Card elevation="flat" style={styles.statusBanner}>
            <AppIcon name="checkCircle" size={18} color={colors.success} />
            <ThemedText variant="body" style={styles.statusText}>
              {statusMessage}
            </ThemedText>
          </Card>
        ) : null}

        {loading ? (
          <Card elevation="flat" style={styles.loadingCard}>
            <ActivityIndicator color={colors.ink} size="small" />
            <ThemedText variant="body" style={styles.loadingText}>
              Loading patient clinical file…
            </ThemedText>
          </Card>
        ) : error ? (
          <Card elevation="flat" style={styles.errorCard}>
            <ThemedText variant="headline" style={styles.errorTitle}>
              Record load error
            </ThemedText>
            <ThemedText variant="caption" style={styles.errorBody}>
              {error}
            </ThemedText>
            <Button title="Retry" size="sm" variant="secondary" onPress={loadRecord} />
          </Card>
        ) : (
          <>
            {failedPartsMessage(failed) ? (
              <Card elevation="flat" style={styles.errorCard}>
                <ThemedText variant="caption" style={styles.errorBody}>
                  {failedPartsMessage(failed)}
                </ThemedText>
                <Button title="Try again" size="sm" variant="secondary" onPress={loadRecord} />
              </Card>
            ) : null}
            {/* Quick Actions */}
            <Card style={styles.actionCard}>
              <ThemedText variant="headline" style={styles.sectionHeading}>
                Consultation actions
              </ThemedText>
              <View>
                <ListRow
                  inset="flush"
                  title="Edit odontogram"
                  left={<IconTile icon="tooth" />}
                  chevron
                  onPress={() =>
                    router.push({
                      pathname: "/(clinician)/odontogram-editor" as any,
                      params: { patientId, appointmentId, patientName },
                    })
                  }
                />
                <ListRow
                  inset="flush"
                  title="Build treatment plan"
                  left={<IconTile icon="clipboard" />}
                  chevron
                  onPress={() =>
                    router.push({
                      pathname: "/(clinician)/treatment-plan-builder" as any,
                      params: { patientId, appointmentId, patientName },
                    })
                  }
                />
                <ListRow
                  inset="flush"
                  title="Examination notes"
                  left={<IconTile icon="notes" />}
                  chevron
                  onPress={() =>
                    router.push({
                      pathname: "/(clinician)/appointment-notes" as any,
                      params: { patientId, appointmentId, patientName },
                    })
                  }
                />
              </View>
              {appointmentId && !outcome ? (
                <View style={styles.statusActionRow}>
                  <Button
                    title="Mark completed"
                    size="sm"
                    variant="primary"
                    disabled={actionInProgress}
                    onPress={() => confirmOutcome("complete")}
                  />
                  <Button
                    title="Mark no-show"
                    size="sm"
                    variant="destructive"
                    disabled={actionInProgress}
                    onPress={() => confirmOutcome("no_show")}
                  />
                </View>
              ) : null}
            </Card>

            {/* Examination Notes Summary */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText variant="headline" style={styles.sectionHeading}>
                  Clinical examination notes
                </ThemedText>
                <Button
                  title="Edit notes"
                  size="sm"
                  variant="ghost"
                  onPress={() =>
                    router.push({
                      pathname: "/(clinician)/appointment-notes" as any,
                      params: { patientId, appointmentId, patientName },
                    })
                  }
                />
              </View>
              {failed.includes("examination notes") ? (
                <ThemedText variant="caption" style={styles.emptyNote}>
                  Notes could not be loaded.
                </ThemedText>
              ) : notes ? (
                <View style={styles.notesBlock}>
                  {notes.diagnosis ? (
                    <View style={styles.diagRow}>
                      <ThemedText variant="caption" style={styles.metaLabel}>
                        Diagnosis
                      </ThemedText>
                      <ThemedText variant="body" style={styles.diagVal}>
                        {notes.diagnosis}
                      </ThemedText>
                    </View>
                  ) : null}
                  <ThemedText variant="body" style={styles.notesContent}>
                    {notes.notes}
                  </ThemedText>
                  {notes.treatmentPlan ? (
                    <View style={styles.diagRow}>
                      <ThemedText variant="caption" style={styles.metaLabel}>
                        PLAN:
                      </ThemedText>
                      <ThemedText variant="body" style={styles.notesContent}>
                        {notes.treatmentPlan}
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
              ) : (
                <EmptyState
                  illustration="writing"
                  heading="No notes recorded yet"
                  body="Record examination findings, diagnosis, and treatment steps."
                  icon="notes"
                />
              )}
            </Card>

            {/* Odontogram Overview */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText variant="headline" style={styles.sectionHeading}>
                  Dental chart (odontogram)
                </ThemedText>
                <Button
                  title="Update chart"
                  size="sm"
                  variant="ghost"
                  onPress={() =>
                    router.push({
                      pathname: "/(clinician)/odontogram-editor" as any,
                      params: { patientId, appointmentId, patientName },
                    })
                  }
                />
              </View>
              {failed.includes("dental chart") ? (
                <ThemedText variant="caption" style={styles.emptyNote}>
                  The chart could not be loaded.
                </ThemedText>
              ) : teeth.length === 0 ? (
                <ThemedText variant="caption" style={styles.emptyNote}>
                  All 32 teeth currently charted healthy or unrecorded. Tap 'Update Chart' to mark conditions.
                </ThemedText>
              ) : (
                <View style={styles.teethSummaryList}>
                  {teeth.map((t: any) => (
                    <View key={t.id || t.toothNumber} style={styles.toothChip}>
                      <ThemedText variant="headline" style={styles.toothNum}>
                        {fdiText(t.toothNumber)}
                      </ThemedText>
                      <Badge
                        label={toLabel(t.condition)}
                        variant={
                          t.condition === "decay"
                            ? "danger"
                            : t.condition === "filled"
                            ? "info"
                            : t.condition === "missing"
                            ? "default"
                            : "success"
                        }
                      />
                    </View>
                  ))}
                </View>
              )}
            </Card>

            {/* Treatment Plans */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText variant="headline" style={styles.sectionHeading}>
                  Treatment Plans ({plans.length})
                </ThemedText>
                <Button
                  title="New plan"
                  size="sm"
                  variant="ghost"
                  onPress={() =>
                    router.push({
                      pathname: "/(clinician)/treatment-plan-builder" as any,
                      params: { patientId, appointmentId, patientName },
                    })
                  }
                />
              </View>
              {failed.includes("treatment plans") ? (
                <ThemedText variant="caption" style={styles.emptyNote}>
                  Plans could not be loaded.
                </ThemedText>
              ) : plans.length === 0 ? (
                <ThemedText variant="caption" style={styles.emptyNote}>
                  No treatment plans created for this patient yet.
                </ThemedText>
              ) : (
                <View style={styles.planList}>
                  {plans.map((p: any) => (
                    <View key={p.id} style={styles.planItem}>
                      <View style={styles.planHeader}>
                        <ThemedText variant="headline" style={styles.planTitle}>
                          {p.title}
                        </ThemedText>
                        <Badge
                          label={toLabel(p.status)}
                          variant={p.status === "accepted" ? "success" : "default"}
                        />
                      </View>
                      <ThemedText variant="caption" style={styles.planCost}>
                        Total: {formatGbp(p.totalCostPence)} · {p.items?.length || 0} item(s)
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    backgroundColor: colors.systemBackground,
    gap: spacing.sm,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.systemBackground,
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
  diagRow: {
    gap: 2,
  },
  diagVal: {
    color: colors.ink,
    fontWeight: "600",
  },
  emptyNote: {
    color: colors.secondaryLabel,
    fontStyle: "italic",
  },
  errorBody: {
    color: colors.secondaryLabel,
  },
  errorCard: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  errorTitle: {
    color: colors.danger,
  },
  loadingCard: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.secondaryLabel,
  },
  metaLabel: {
    color: colors.secondaryLabel,
    fontWeight: "700",
  },
  navRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  notesBlock: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  notesContent: {
    color: colors.label,
  },
  planCost: {
    color: colors.secondaryLabel,
  },
  planHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  planItem: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    gap: 4,
    padding: spacing.sm,
  },
  planList: {
    gap: spacing.xs,
  },
  planTitle: {
    color: colors.label,
  },
  sectionHeading: {
    color: colors.label,
  },
  statusActionRow: {
    borderTopColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  statusBanner: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    backgroundColor: colors.inkSubtle,
    padding: spacing.sm,
  },
  statusText: {
    color: colors.ink,
    fontWeight: "600",
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  teethSummaryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  title: {
    color: colors.label,
  },
  titleBlock: {
    gap: 2,
  },
  toothChip: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toothNum: {
    color: colors.ink,
    fontSize: 13,
  },
});
