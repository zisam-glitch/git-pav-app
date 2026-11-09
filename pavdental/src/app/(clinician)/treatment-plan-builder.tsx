import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText, Card, Button, EmptyState, IconButton, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { toothLabel, fdiToUniversal } from "@/features/records/tooth-number";
import { createTreatmentPlan } from "@/features/records/records-api";
import { useServices } from "@/features/hooks/use-dental-api";

interface PlanItem {
  code: string;
  description: string;
  costPence: number;
  toothNumber?: number;
}

// D-08: prices come from the practice's own services list, which the owner
// sets on the dashboard (Team & Services). Anything else is a custom item.

export default function TreatmentPlanBuilderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    patientId: string;
    appointmentId?: string;
    patientName?: string;
  }>();

  const patientId = params.patientId || "";
  const { data: services, isLoading: servicesLoading, isError: servicesError } = useServices();
  const [title, setTitle] = useState("Comprehensive Dental Treatment Plan");
  const [items, setItems] = useState<PlanItem[]>([]);
  const [selectedTooth, setSelectedTooth] = useState<string>("");
  const [customDesc, setCustomDesc] = useState<string>("");
  const [customCostPounds, setCustomCostPounds] = useState<string>("");
  const [customCode, setCustomCode] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // The clinician types the FDI number (e.g. 36); it is stored as Universal.
  const toothFromInput = (): number | undefined =>
    selectedTooth ? fdiToUniversal(parseInt(selectedTooth, 10)) ?? undefined : undefined;

  function addItem(proc: { code: string; description: string; costPence: number }) {
    const tooth = toothFromInput();
    setItems((prev) => [
      ...prev,
      {
        code: proc.code,
        description: proc.description + (tooth ? ` (${toothLabel(tooth)})` : ""),
        costPence: proc.costPence,
        toothNumber: tooth && !isNaN(tooth) ? tooth : undefined,
      },
    ]);
    setSelectedTooth("");
  }

  function addCustomItem() {
    if (!customDesc.trim() || !customCostPounds.trim()) return;
    const costPence = Math.round(parseFloat(customCostPounds) * 100);
    if (isNaN(costPence) || costPence <= 0) return;

    const tooth = toothFromInput();
    setItems((prev) => [
      ...prev,
      {
        code: customCode.trim() || "CUST01",
        description: customDesc.trim() + (tooth ? ` (${toothLabel(tooth)})` : ""),
        costPence,
        toothNumber: tooth && !isNaN(tooth) ? tooth : undefined,
      },
    ]);

    setCustomDesc("");
    setCustomCostPounds("");
    setCustomCode("");
    setSelectedTooth("");
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totalPence = items.reduce((sum, item) => sum + item.costPence, 0);

  async function handleSavePlan() {
    if (!patientId || items.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await createTreatmentPlan(patientId, {
        title: title.trim() || "Treatment Plan",
        items,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to create treatment plan");
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
        </View>

        <View style={styles.headerBlock}>
          <ThemedText variant="title" style={styles.title}>
            Treatment plan builder
          </ThemedText>
          {params.patientName ? (
            <ThemedText variant="caption" style={styles.subtitle}>
              Patient: {params.patientName}
            </ThemedText>
          ) : null}
        </View>

        {success ? (
          <Card style={styles.successCard}>
            <ThemedText variant="headline" style={styles.successTitle}>
              Treatment plan created
            </ThemedText>
            <ThemedText variant="body" style={styles.successBody}>
              Plan "{title}" has been saved with {items.length} items totaling £
              {(totalPence / 100).toFixed(2)}. The patient can review and sign it via the app.
            </ThemedText>
            <Button
              title="Return to patient file"
              size="md"
              variant="primary"
              onPress={() => router.back()}
            />
          </Card>
        ) : (
          <>
            {error ? (
              <Card elevation="flat" style={styles.errorBanner}>
                <ThemedText variant="caption" style={styles.errorText}>
                  {error}
                </ThemedText>
              </Card>
            ) : null}

            {/* Plan Title */}
            <Card style={styles.card}>
              <ThemedText variant="caption" style={styles.label}>
                Plan title
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Comprehensive Dental Treatment Plan"
                placeholderTextColor={colors.tertiaryLabel}
              />
            </Card>

            {/* Quick Add Procedures */}
            <Card style={styles.card}>
              <ThemedText variant="headline" style={styles.sectionHeading}>
                Add standard procedures
              </ThemedText>
              <View style={styles.toothInputRow}>
                <ThemedText variant="caption" style={styles.toothLabel}>
                  Tooth, FDI (optional):
                </ThemedText>
                <TextInput
                  style={styles.toothInput}
                  placeholder="e.g. 36"
                  placeholderTextColor={colors.tertiaryLabel}
                  keyboardType="numeric"
                  value={selectedTooth}
                  onChangeText={setSelectedTooth}
                />
              </View>

              <View style={styles.procGrid}>
                {servicesLoading ? (
                  <ThemedText variant="caption">Loading the practice's price list…</ThemedText>
                ) : servicesError || !services?.length ? (
                  <ThemedText variant="caption">
                    The practice's price list couldn't be loaded. Add items below with their price.
                  </ThemedText>
                ) : (
                  services.map((svc) => (
                    <Button
                      key={svc.id}
                      icon={<AppIcon name="plus" size={16} color={colors.ink} />}
                      title={`${svc.name} (£${(svc.pricePence / 100).toFixed(2).replace(/\.00$/, "")})`}
                      size="sm"
                      variant="secondary"
                      onPress={() => addItem({ code: svc.id, description: svc.name, costPence: svc.pricePence })}
                    />
                  ))
                )}
              </View>
            </Card>

            {/* Custom Item Form */}
            <Card style={styles.card}>
              <ThemedText variant="headline" style={styles.sectionHeading}>
                Add custom procedure
              </ThemedText>
              <TextInput
                style={styles.textInput}
                placeholder="Description (e.g. Custom Night Guard)"
                placeholderTextColor={colors.tertiaryLabel}
                value={customDesc}
                onChangeText={setCustomDesc}
              />
              <View style={styles.customRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="Code (optional)"
                  placeholderTextColor={colors.tertiaryLabel}
                  value={customCode}
                  onChangeText={setCustomCode}
                />
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="Cost (£)"
                  placeholderTextColor={colors.tertiaryLabel}
                  keyboardType="decimal-pad"
                  value={customCostPounds}
                  onChangeText={setCustomCostPounds}
                />
                <Button title="Add" size="md" variant="primary" onPress={addCustomItem} />
              </View>
            </Card>

            {/* Plan Items & Total */}
            <Card style={styles.card}>
              <ThemedText variant="headline" style={styles.sectionHeading}>
                Plan Items ({items.length})
              </ThemedText>

              {items.length === 0 ? (
                <EmptyState
                  illustration="plans"
                  heading="No items in this plan"
                  body="Select procedures above to assemble the treatment plan."
                  icon="notes"
                />
              ) : (
                <View style={styles.itemList}>
                  {items.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <View style={styles.itemDetails}>
                        <ThemedText variant="headline" style={styles.itemDesc}>
                          {item.description}
                        </ThemedText>
                        <ThemedText variant="caption" style={styles.itemCode}>
                          Code: {item.code} · £{(item.costPence / 100).toFixed(2)}
                        </ThemedText>
                      </View>
                      <Button
                        title="Remove"
                        size="sm"
                        variant="ghost"
                        onPress={() => removeItem(idx)}
                      />
                    </View>
                  ))}

                  <View style={styles.totalRow}>
                    <ThemedText variant="headline" style={styles.totalLabel}>
                      Total estimated cost:
                    </ThemedText>
                    <ThemedText variant="title" style={styles.totalVal}>
                      £{(totalPence / 100).toFixed(2)}
                    </ThemedText>
                  </View>

                  <Button
                    title={saving ? "Saving plan…" : "Create & send plan"}
                    size="md"
                    variant="primary"
                    disabled={saving}
                    onPress={handleSavePlan}
                  />
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
  card: {
    backgroundColor: colors.systemBackground,
    gap: spacing.sm,
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
  customRow: {
    flexDirection: "row",
    gap: spacing.xs,
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
  itemCode: {
    color: colors.secondaryLabel,
  },
  itemDesc: {
    color: colors.label,
  },
  itemDetails: {
    flex: 1,
    gap: 2,
  },
  itemList: {
    gap: spacing.sm,
  },
  itemRow: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.sm,
  },
  label: {
    color: colors.secondaryLabel,
    fontWeight: "700",
  },
  navRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  procGrid: {
    gap: spacing.xs,
  },
  sectionHeading: {
    color: colors.label,
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  successBody: {
    color: colors.label,
  },
  successCard: {
    backgroundColor: colors.systemBackground,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  successTitle: {
    color: colors.ink,
  },
  textInput: {
    backgroundColor: colors.tertiaryBackground,
    borderRadius: radius.sm,
    color: colors.label,
    padding: spacing.sm,
    borderColor: colors.inputUnderline,
    borderWidth: 1,
  },
  title: {
    color: colors.label,
  },
  toothInput: {
    backgroundColor: colors.tertiaryBackground,
    borderRadius: radius.sm,
    color: colors.label,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 60,
    borderColor: colors.inputUnderline,
    borderWidth: 1,
  },
  toothInputRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  toothLabel: {
    color: colors.secondaryLabel,
  },
  totalLabel: {
    color: colors.label,
  },
  totalRow: {
    alignItems: "center",
    borderTopColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  totalVal: {
    color: colors.ink,
  },
});
