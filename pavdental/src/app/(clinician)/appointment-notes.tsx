import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { visitOutcomeCopy, recordVisitOutcome, type VisitOutcome } from "@/features/clinician/visit-outcome";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText, Card, Button, IconButton, AppIcon, ErrorState } from "@/components";
import { colors, spacing, radius } from "@/theme";
import {
  fetchAppointmentNotes,
  saveAppointmentNotes,
  completeAppointment,
  markAppointmentNoShow,
} from "@/features/records/records-api";

export default function AppointmentNotesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    appointmentId: string;
    patientId?: string;
    patientName?: string;
  }>();

  const appointmentId = params.appointmentId || "";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  // If the saved notes could not be read, the form must not be saved: it would
  // replace notes the clinician never saw.
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [finished, setFinished] = useState(false);
  const queryClient = useQueryClient();
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); }, []);

  useEffect(() => {
    async function load() {
      if (!appointmentId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setLoadFailed(false);
      try {
        const data = await fetchAppointmentNotes(appointmentId);
        if (data) {
          setNotes(data.notes || "");
          setDiagnosis(data.diagnosis || "");
          setTreatmentPlan(data.treatmentPlan || "");
        }
      } catch {
        // "No note yet" comes back as an empty answer, not an error, so this is a real failure.
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [appointmentId, reloadKey]);

  async function handleSaveNotes() {
    if (!appointmentId || !notes.trim()) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await saveAppointmentNotes(appointmentId, {
        notes: notes.trim(),
        diagnosis: diagnosis.trim() || undefined,
        treatmentPlan: treatmentPlan.trim() || undefined,
      });
      setSuccessMessage("Clinical notes saved successfully.");
    } catch (err: any) {
      setError(err?.message || "Failed to save clinical notes");
    } finally {
      setSaving(false);
    }
  }

  function confirmOutcome(kind: VisitOutcome) {
    if (!appointmentId || saving || finished) return;
    const copy = visitOutcomeCopy(kind, params.patientName);
    Alert.alert(copy.title, copy.message, [
      { text: "Cancel", style: "cancel" },
      {
        text: copy.confirmLabel,
        style: kind === "no_show" ? "destructive" : "default",
        onPress: async () => {
          setSaving(true);
          setError(null);
          try {
            if (kind === "complete" && notes.trim()) {
              await saveAppointmentNotes(appointmentId, {
                notes: notes.trim(),
                diagnosis: diagnosis.trim() || undefined,
                treatmentPlan: treatmentPlan.trim() || undefined,
              });
            }
          } catch (err: any) {
            setSaving(false);
            setError(err?.message || "Couldn't save the notes, so the visit was not closed.");
            return;
          }
          const result = await recordVisitOutcome(
            { complete: completeAppointment, noShow: markAppointmentNoShow },
            kind,
            appointmentId,
          );
          setSaving(false);
          if (result.ok) {
            setFinished(true);
            setSuccessMessage(copy.doneMessage);
            queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
            leaveTimer.current = setTimeout(() => router.back(), 1000);
          } else {
            setError(result.message);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Navigation */}
        <View style={styles.navRow}>
          <IconButton icon="arrowLeft" label="Back to patient file" variant="soft" onPress={() => router.back()} />
        </View>

        <View style={styles.headerBlock}>
          <ThemedText variant="title" style={styles.title}>
            Clinical examination notes
          </ThemedText>
          {params.patientName ? (
            <ThemedText variant="caption" style={styles.subtitle}>
              Patient: {params.patientName}
            </ThemedText>
          ) : null}
        </View>

        {successMessage ? (
          <Card elevation="flat" style={styles.successBanner}>
            <AppIcon name="checkCircle" size={18} color={colors.success} />
            <ThemedText variant="body" style={styles.successText}>
              {successMessage}
            </ThemedText>
          </Card>
        ) : null}

        {error ? (
          <Card elevation="flat" style={styles.errorBanner}>
            <ThemedText variant="caption" style={styles.errorText}>
              {error}
            </ThemedText>
          </Card>
        ) : null}

        {!appointmentId ? (
          <ErrorState illustration="notFound" message="Open examination notes from a patient's appointment. There is no patient selected." />
        ) : loading ? (
          <Card elevation="flat" style={styles.loadingCard}>
            <ActivityIndicator color={colors.ink} size="small" />
            <ThemedText variant="body" style={styles.loadingText}>
              Loading examination notes…
            </ThemedText>
          </Card>
        ) : loadFailed ? (
          <ErrorState message="We couldn't load the saved notes, so they can't be edited safely. Check the connection and try again." onRetry={() => setReloadKey((k) => k + 1)} />
        ) : (
          <Card style={styles.card}>
            <ThemedText variant="caption" style={styles.label}>
              Clinical examination findings & notes *
            </ThemedText>
            <TextInput
              style={[styles.textInput, { minHeight: 120 }]}
              multiline
              placeholder="Record findings: soft tissues, BPE scores, dental condition, oral hygiene..."
              placeholderTextColor={colors.tertiaryLabel}
              value={notes}
              onChangeText={setNotes}
            />

            <ThemedText variant="caption" style={[styles.label, { marginTop: spacing.sm }]}>
              Diagnosis (optional)
            </ThemedText>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Chronic generalized periodontitis stage 2"
              placeholderTextColor={colors.tertiaryLabel}
              value={diagnosis}
              onChangeText={setDiagnosis}
            />

            <ThemedText variant="caption" style={[styles.label, { marginTop: spacing.sm }]}>
              Treatment plan & recall (optional)
            </ThemedText>
            <TextInput
              style={[styles.textInput, { minHeight: 80 }]}
              multiline
              placeholder="e.g. Scaling & root surface debridement. Review in 3 months."
              placeholderTextColor={colors.tertiaryLabel}
              value={treatmentPlan}
              onChangeText={setTreatmentPlan}
            />

            <View style={styles.buttonStack}>
              <Button
                title={saving ? "Saving…" : "Save notes"}
                size="md"
                variant="primary"
                disabled={saving || finished || !notes.trim()}
                onPress={handleSaveNotes}
              />
              <View style={styles.actionRow}>
                <Button
                  title="Complete visit"
                  size="md"
                  variant="secondary"
                  disabled={saving || finished}
                  onPress={() => confirmOutcome("complete")}
                />
                <Button
                  title="Mark no-show"
                  size="md"
                  variant="destructive"
                  disabled={saving || finished}
                  onPress={() => confirmOutcome("no_show")}
                />
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  buttonStack: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.systemBackground,
    gap: spacing.xs,
    padding: spacing.md,
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
  errorBanner: {
    backgroundColor: colors.dangerSubtle,
    padding: spacing.sm,
  },
  errorText: {
    color: colors.danger,
  },
  headerBlock: {
    gap: 2,
  },
  label: {
    color: colors.secondaryLabel,
    fontWeight: "700",
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
  navRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  successBanner: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    backgroundColor: colors.inkSubtle,
    padding: spacing.sm,
  },
  successText: {
    color: colors.ink,
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: colors.tertiaryBackground,
    borderRadius: radius.sm,
    color: colors.label,
    padding: spacing.sm,
    textAlignVertical: "top",
    borderColor: colors.inputUnderline,
    borderWidth: 1,
  },
  title: {
    color: colors.label,
  },
});
