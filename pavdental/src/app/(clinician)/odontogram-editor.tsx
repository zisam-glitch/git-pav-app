import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText, Card, Badge, Button, IconButton, AppIcon, ErrorState } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { fetchOdontogram, updateOdontogram, fetchOdontogramHistory } from "@/features/records/records-api";
import { toLabel } from "@/lib/text";

const TOOTH_CONDITIONS = [
  "healthy",
  "decay",
  "filled",
  "missing",
  "crown",
  "implant",
  "root_canal",
] as const;

type ToothCondition = typeof TOOTH_CONDITIONS[number];

export default function OdontogramEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    patientId: string;
    appointmentId?: string;
    patientName?: string;
  }>();

  const patientId = params.patientId || "";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Map of toothNumber -> { condition, notes, arch, quadrant }
  const [teethState, setTeethState] = useState<Record<number, { condition: ToothCondition; notes?: string }>>({});
  const [selectedTooth, setSelectedTooth] = useState<number>(1);
  const [toothNote, setToothNote] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Initialize 32 teeth
  useEffect(() => {
    async function loadData() {
      if (!patientId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [records, hist] = await Promise.all([
          fetchOdontogram(patientId).catch(() => []),
          fetchOdontogramHistory(patientId).catch(() => []),
        ]);

        const initial: Record<number, { condition: ToothCondition; notes?: string }> = {};
        for (let i = 1; i <= 32; i++) {
          initial[i] = { condition: "healthy" };
        }
        for (const r of records) {
          initial[r.toothNumber] = {
            condition: r.condition,
            notes: r.notes || undefined,
          };
        }
        setTeethState(initial);
        setHistory(hist || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load odontogram");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [patientId]);

  function getArchAndQuadrant(toothNumber: number): { arch: "upper" | "lower"; quadrant: "upper_right" | "upper_left" | "lower_right" | "lower_left" } {
    if (toothNumber >= 1 && toothNumber <= 8) {
      return { arch: "upper", quadrant: "upper_right" };
    }
    if (toothNumber >= 9 && toothNumber <= 16) {
      return { arch: "upper", quadrant: "upper_left" };
    }
    if (toothNumber >= 17 && toothNumber <= 24) {
      return { arch: "lower", quadrant: "lower_left" };
    }
    return { arch: "lower", quadrant: "lower_right" };
  }

  function handleSelectTooth(num: number) {
    setSelectedTooth(num);
    setToothNote(teethState[num]?.notes || "");
  }

  function handleConditionChange(cond: ToothCondition) {
    setTeethState((prev) => ({
      ...prev,
      [selectedTooth]: {
        ...prev[selectedTooth],
        condition: cond,
      },
    }));
  }

  function handleSaveNote() {
    setTeethState((prev) => ({
      ...prev,
      [selectedTooth]: {
        ...prev[selectedTooth],
        notes: toothNote,
      },
    }));
  }

  async function handleSaveChart() {
    if (!patientId) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const payload = Object.entries(teethState).map(([numStr, data]) => {
        const num = parseInt(numStr, 10);
        const { arch, quadrant } = getArchAndQuadrant(num);
        return {
          toothNumber: num,
          arch,
          quadrant,
          condition: data.condition,
          notes: data.notes || undefined,
        };
      });

      await updateOdontogram(patientId, payload);
      setSuccessMessage("Dental chart saved with append-only audit trail.");
      // Refresh history
      const updatedHist = await fetchOdontogramHistory(patientId).catch(() => []);
      setHistory(updatedHist);
    } catch (err: any) {
      setError(err?.message || "Failed to save odontogram");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Navigation */}
        <View style={styles.navRow}>
          <IconButton icon="arrowLeft" label="Back to patient file" variant="soft" onPress={() => router.back()} />
          <Button
            title={showHistory ? "View chart" : "View history"}
            variant="ghost"
            size="sm"
            onPress={() => setShowHistory(!showHistory)}
          />
        </View>

        <View style={styles.headerBlock}>
          <ThemedText variant="title" style={styles.title}>
            Odontogram editor
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

        {!patientId ? (
          <ErrorState illustration="notFound" message="Open the dental chart from a patient's appointment. There is no patient selected." />
        ) : loading ? (
          <Card elevation="flat" style={styles.loadingCard}>
            <ActivityIndicator color={colors.ink} size="small" />
            <ThemedText variant="body" style={styles.loadingText}>
              Loading dental chart…
            </ThemedText>
          </Card>
        ) : showHistory ? (
          /* History View (PT-3 audit) */
          <Card style={styles.card}>
            <ThemedText variant="headline" style={styles.sectionHeading}>
              Append-Only Tooth History ({history.length} Entries)
            </ThemedText>
            {history.length === 0 ? (
              <ThemedText variant="caption" style={styles.emptyNote}>
                No previous changes logged for this patient.
              </ThemedText>
            ) : (
              <View style={styles.historyList}>
                {history.map((h: any, idx: number) => (
                  <View key={h.id || idx} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <ThemedText variant="headline" style={styles.historyTooth}>
                        Tooth #{h.toothNumber} ({h.arch} - {h.quadrant})
                      </ThemedText>
                      <Badge
                        label={toLabel(h.condition)}
                        variant={
                          h.condition === "decay"
                            ? "danger"
                            : h.condition === "filled"
                            ? "info"
                            : "default"
                        }
                      />
                    </View>
                    {h.notes ? (
                      <ThemedText variant="caption" style={styles.historyNotes}>
                        Notes: {h.notes}
                      </ThemedText>
                    ) : null}
                    <ThemedText variant="caption" style={styles.historyTime}>
                      {new Date(h.createdAt).toLocaleString("en-GB")}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </Card>
        ) : (
          <>
            {/* Tooth Grid */}
            <Card style={styles.chartCard}>
              <ThemedText variant="caption" style={styles.archLabel}>
                Maxillary arch (upper jaw: 1 - 16)
              </ThemedText>
              <View style={styles.teethRow}>
                {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => {
                  const state = teethState[num];
                  const isSelected = selectedTooth === num;
                  return (
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Tooth ${num}${state?.condition ? `, ${state.condition}` : ""}`} accessibilityState={{ selected: isSelected }}
                      key={num}
                      style={[
                        styles.toothButton,
                        isSelected && styles.toothSelected,
                        state?.condition === "decay" && styles.toothDecay,
                        state?.condition === "filled" && styles.toothFilled,
                        state?.condition === "missing" && styles.toothMissing,
                      ]}
                      onPress={() => handleSelectTooth(num)}
                    >
                      <ThemedText variant="caption" style={styles.toothNumText}>
                        {num}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ThemedText variant="caption" style={[styles.archLabel, { marginTop: spacing.md }]}>
                Mandibular arch (lower jaw: 17 - 32)
              </ThemedText>
              <View style={styles.teethRow}>
                {Array.from({ length: 16 }, (_, i) => i + 17).map((num) => {
                  const state = teethState[num];
                  const isSelected = selectedTooth === num;
                  return (
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Tooth ${num}${state?.condition ? `, ${state.condition}` : ""}`} accessibilityState={{ selected: isSelected }}
                      key={num}
                      style={[
                        styles.toothButton,
                        isSelected && styles.toothSelected,
                        state?.condition === "decay" && styles.toothDecay,
                        state?.condition === "filled" && styles.toothFilled,
                        state?.condition === "missing" && styles.toothMissing,
                      ]}
                      onPress={() => handleSelectTooth(num)}
                    >
                      <ThemedText variant="caption" style={styles.toothNumText}>
                        {num}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* Tooth Inspector & Editor */}
            <Card style={styles.card}>
              <View style={styles.inspectorHeader}>
                <ThemedText variant="headline" style={styles.sectionHeading}>
                  Tooth #{selectedTooth} details
                </ThemedText>
                <Badge
                  label={toLabel(teethState[selectedTooth]?.condition || "healthy")}
                  variant={
                    teethState[selectedTooth]?.condition === "decay"
                      ? "danger"
                      : teethState[selectedTooth]?.condition === "filled"
                      ? "info"
                      : "default"
                  }
                />
              </View>

              <ThemedText variant="caption" style={styles.label}>
                Condition
              </ThemedText>
              <View style={styles.conditionRow}>
                {TOOTH_CONDITIONS.map((cond) => {
                  const isActive = teethState[selectedTooth]?.condition === cond;
                  return (
                    <TouchableOpacity accessibilityRole="radio" accessibilityLabel={toLabel(cond)} accessibilityState={{ selected: isActive }}
                      key={cond}
                      hitSlop={{ top: 4, bottom: 4 }}
                      style={[styles.condChip, isActive && styles.condChipActive]}
                      onPress={() => handleConditionChange(cond)}
                    >
                      <ThemedText
                        variant="caption"
                        style={[styles.condChipText, isActive && styles.condChipTextActive]}
                      >
                        {toLabel(cond)}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ThemedText variant="caption" style={[styles.label, { marginTop: spacing.sm }]}>
                Clinical notes
              </ThemedText>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Incipient caries, mesial cavity, crown margin sound..."
                placeholderTextColor={colors.tertiaryLabel}
                value={toothNote}
                onChangeText={setToothNote}
                onBlur={handleSaveNote}
                multiline
              />

              <View style={styles.saveChartRow}>
                <Button
                  title={saving ? "Saving chart…" : "Save dental chart"}
                  size="md"
                  variant="primary"
                  disabled={saving}
                  onPress={handleSaveChart}
                />
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  archLabel: {
    color: colors.secondaryLabel,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.systemBackground,
    gap: spacing.sm,
    padding: spacing.md,
  },
  chartCard: {
    backgroundColor: colors.systemBackground,
    gap: spacing.xs,
    padding: spacing.md,
  },
  // Outlined white pill so it shows on the grey card; accent when chosen.
  condChip: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.inputUnderline,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  condChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  condChipText: {
    color: colors.label,
  },
  condChipTextActive: {
    color: colors.onAccent,
    fontWeight: "700",
  },
  conditionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
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
  emptyNote: {
    color: colors.secondaryLabel,
    fontStyle: "italic",
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
  historyHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyItem: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    gap: 4,
    padding: spacing.sm,
  },
  historyList: {
    gap: spacing.xs,
  },
  historyNotes: {
    color: colors.label,
  },
  historyTime: {
    color: colors.secondaryLabel,
    fontSize: 11,
  },
  historyTooth: {
    color: colors.ink,
  },
  inspectorHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
  saveChartRow: {
    marginTop: spacing.sm,
  },
  sectionHeading: {
    color: colors.label,
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
  teethRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "center",
    marginTop: 4,
  },
  textInput: {
    backgroundColor: colors.tertiaryBackground,
    borderRadius: radius.sm,
    color: colors.label,
    minHeight: 64,
    padding: spacing.sm,
    textAlignVertical: "top",
    borderColor: colors.inputUnderline,
    borderWidth: 1,
  },
  title: {
    color: colors.label,
  },
  toothButton: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  toothDecay: {
    backgroundColor: colors.dangerSubtle,
    borderColor: colors.danger,
  },
  toothFilled: {
    backgroundColor: colors.infoSubtle,
    borderColor: colors.info,
  },
  toothMissing: {
    backgroundColor: colors.inkSubtle,
    opacity: 0.4,
  },
  toothNumText: {
    color: colors.ink,
    fontWeight: "600",
  },
  toothSelected: {
    borderColor: colors.ink,
    borderWidth: 2,
  },
});
