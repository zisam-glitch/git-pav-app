import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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

  const patientId = params.patientId || "";
  const appointmentId = params.appointmentId || "";
  const patientName = params.patientName || "Patient Record";

  async function loadRecord() {
    if (!patientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [profData, odontData, planData, noteData] = await Promise.all([
        // A refused or failed profile load is shown as an error, not as an empty record.
        fetchPatientProfile(patientId),
        fetchOdontogram(patientId).catch(() => []),
        fetchTreatmentPlans(patientId).catch(() => []),
        appointmentId ? fetchAppointmentNotes(appointmentId).catch(() => null) : null,
      ]);
      setProfile(profData);
      setTeeth(odontData || []);
      setPlans(planData || []);
      setNotes(noteData);
    } catch (err: any) {
      setError(err?.message || "Failed to load clinical record");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecord();
  }, [patientId, appointmentId]);

  async function handleComplete() {
    if (!appointmentId) return;
    setActionInProgress(true);
    try {
      await completeAppointment(appointmentId);
      setStatusMessage("Appointment marked as completed.");
    } catch (err: any) {
      setError(err?.message || "Failed to complete appointment");
    } finally {
      setActionInProgress(false);
    }
  }

  async function handleNoShow() {
    if (!appointmentId) return;
    setActionInProgress(true);
    try {
      await markAppointmentNoShow(appointmentId);
      setStatusMessage("Patient marked as no-show.");
    } catch (err: any) {
      setError(err?.message || "Failed to mark no-show");
    } finally {
      setActionInProgress(false);
    }
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
              {appointmentId ? (
                <View style={styles.statusActionRow}>
                  <Button
                    title="Mark completed"
                    size="sm"
                    variant="primary"
                    disabled={actionInProgress}
                    onPress={handleComplete}
                  />
                  <Button
                    title="Mark no-show"
                    size="sm"
                    variant="destructive"
                    disabled={actionInProgress}
                    onPress={handleNoShow}
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
              {notes ? (
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
              {teeth.length === 0 ? (
                <ThemedText variant="caption" style={styles.emptyNote}>
                  All 32 teeth currently charted healthy or unrecorded. Tap 'Update Chart' to mark conditions.
                </ThemedText>
              ) : (
                <View style={styles.teethSummaryList}>
                  {teeth.map((t: any) => (
                    <View key={t.id || t.toothNumber} style={styles.toothChip}>
                      <ThemedText variant="headline" style={styles.toothNum}>
                        #{t.toothNumber}
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
              {plans.length === 0 ? (
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
                        Total: £{(p.totalCostPence / 100).toFixed(2)} · {p.items?.length || 0} item(s)
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
