import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { ThemedText, Card, Badge, AppIcon, Button } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { ToothRecord, ToothCondition } from "@/features/records/records-types";
import { useOdontogram } from "@/features/hooks/use-dental-api";
import { useCurrentUser } from "@/features/auth/auth-store";
import { toLabel } from "@/lib/text";
import { isUpperArch } from "@/features/records/arch";
import { SafeAreaView } from "react-native-safe-area-context";

// Only decay is a warning; a missing tooth is a neutral fact, not a success.
const CONDITION_BADGE = {
  healthy: "success",
  decay: "danger",
  filling: "info",
  crown: "info",
  missing: "default",
  unrecorded: "default",
} as const;

const STANDARD_TEETH: ToothRecord[] = Array.from({ length: 32 }, (_, idx) => {
  const num = idx + 1;
  const quadrant = num <= 8 ? "UR" : num <= 16 ? "UL" : num <= 24 ? "LL" : "LR";
  return {
    id: `tooth-${num}`,
    patientId: "",
    toothNumber: num,
    quadrant,
    surfaces: {},
    updatedAt: new Date(0).toISOString(),
  };
});

// What the chart shows comes only from the recorded odontogram. A tooth with
// no record says "Not recorded"; nothing is inferred, priced or annotated
// (MC-4). Brushing metrics, radiograph previews and clinician notes that used
// to be hardcoded here are gone until there is real data behind them.
const CONDITION_LABEL: Record<ToothCondition, string> = {
  healthy: "Sound",
  decay: "Decay recorded",
  filling: "Filling",
  crown: "Crown",
  missing: "Missing",
};

const SURFACE_LABEL: Record<string, string> = {
  occlusal: "Occlusal (biting)",
  mesial: "Mesial (front)",
  distal: "Distal (rear)",
  buccal: "Buccal (cheek)",
  lingual: "Lingual (tongue)",
};

function getOverallCondition(t?: ToothRecord): ToothCondition {
  if (!t) return "healthy";
  const conds = Object.values(t.surfaces || {});
  if (conds.includes("decay")) return "decay";
  if (conds.includes("filling")) return "filling";
  if (conds.includes("crown")) return "crown";
  if (conds.includes("missing")) return "missing";
  return "healthy";
}

function getToothAnatomy(toothNumber: number) {
  const isUpper = toothNumber <= 16;
  const quadrant = isUpper
    ? (toothNumber <= 8 ? "UR" : "UL")
    : (toothNumber <= 24 ? "LL" : "LR");

  let fdi = 11;
  let type = "Molar";
  if (toothNumber <= 8) {
    fdi = 10 + (9 - toothNumber);
  } else if (toothNumber <= 16) {
    fdi = 20 + (toothNumber - 8);
  } else if (toothNumber <= 24) {
    fdi = 30 + (25 - toothNumber);
  } else {
    fdi = 40 + (toothNumber - 24);
  }

  const lastDigit = fdi % 10;
  if (lastDigit === 1) type = "Central Incisor";
  else if (lastDigit === 2) type = "Lateral Incisor";
  else if (lastDigit === 3) type = "Canine";
  else if (lastDigit === 4) type = "First Premolar";
  else if (lastDigit === 5) type = "Second Premolar";
  else if (lastDigit === 6) type = "First Molar";
  else if (lastDigit === 7) type = "Second Molar";
  else if (lastDigit === 8) type = "Third Molar";

  const archName = isUpper ? "Maxillary Arch" : "Mandibular Arch";
  const side = quadrant.includes("R") ? "Right" : "Left";

  return {
    fdi: `#${fdi}`,
    universal: `#${toothNumber}`,
    quadrant,
    archName,
    fullName: `${side} ${type}`,
    type,
  };
}

export default function OdontogramScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const userId = user?.id || "";
  const { data: apiTeeth } = useOdontogram(userId);
  const teeth: (ToothRecord & { recorded: boolean })[] = React.useMemo(() => {
    const rawList = Array.isArray(apiTeeth)
      ? apiTeeth
      : Array.isArray((apiTeeth as any)?.teeth)
        ? (apiTeeth as any).teeth
        : [];
    return STANDARD_TEETH.map((base) => {
      const match = rawList.find(
        (t: any) => Number(t.toothNumber ?? t.number) === base.toothNumber
      );
      if (!match) return { ...base, recorded: false };
      const mappedCond: ToothCondition =
        match.condition === "decay"
          ? "decay"
          : match.condition === "filled" || match.condition === "filling"
            ? "filling"
            : match.condition === "crown"
              ? "crown"
              : match.condition === "missing"
                ? "missing"
                : "healthy";
      return {
        ...base,
        ...match,
        toothNumber: base.toothNumber,
        quadrant: match.quadrant || base.quadrant,
        surfaces: match.surfaces || { occlusal: mappedCond },
        notes: match.notes || undefined,
        recorded: true,
      };
    });
  }, [apiTeeth]);

  const params = useLocalSearchParams<{ toothModal?: string; tooth?: string }>();
  const [selectedToothNumber, setSelectedToothNumber] = useState<number>(
    params.tooth ? parseInt(params.tooth, 10) || 1 : 1
  );
  const [showToothModal, setShowToothModal] = useState<boolean>(false);

  useEffect(() => {
    if (params.toothModal === "true") {
      setShowToothModal(true);
    }
    if (params.tooth) {
      setSelectedToothNumber(parseInt(params.tooth, 10) || 1);
    }
  }, [params.toothModal, params.tooth]);

  // Filter 32 teeth into Maxillary (Upper) and Mandibular (Lower)
  const upperTeeth = teeth.filter((t) => isUpperArch(t.quadrant, t.toothNumber));
  const lowerTeeth = teeth.filter((t) => !isUpperArch(t.quadrant, t.toothNumber));

  const selectedTooth = teeth.find((t) => t.toothNumber === selectedToothNumber) || teeth[0];
  const anatomy = getToothAnatomy(selectedTooth.toothNumber);
  const selectedCondition = getOverallCondition(selectedTooth);
  const selectedLabel = selectedTooth.recorded ? CONDITION_LABEL[selectedCondition] : "Not recorded";
  const recordedSurfaces = Object.entries(selectedTooth.surfaces || {}).filter(
    (entry): entry is [string, ToothCondition] => typeof entry[1] === "string"
  );

  const handleSelectTooth = (toothNumber: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedToothNumber(toothNumber);
  };

  const handleBookAppointment = () => {
    setShowToothModal(false);
    router.push("/(patient)/booking/service-catalog" as never);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Header: Back + Title "Clean Progress" + Right Hygiene Icon */}
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <AppIcon name="arrowLeft" size={22} color={colors.ink} />
          </Pressable>

          <ThemedText variant="headline" style={styles.headerTitle}>
            Clean progress
          </ThemedText>

          {/* Keeps the title centred opposite the back button. */}
          <View style={styles.headerSpacer} />
        </View>

        {/* 3D Visual Dental Arch Model with Interactive Risk Annotation */}
        <Card style={styles.archContainer}>
          <View style={styles.archModelWrapper}>
            {/* Upper Jaw Arch */}
            <View style={styles.archRow}>
              <View style={styles.gumRidgeUpper}>
                {upperTeeth.map((t) => {
                  const cond = getOverallCondition(t);
                  const isDecay = cond === "decay";
                  const isSelected = t.toothNumber === selectedToothNumber;
                  return (
                    <Pressable
                      key={t.toothNumber}
                      accessibilityRole="button"
                      accessibilityLabel={`Tooth ${t.toothNumber}: ${t.recorded ? CONDITION_LABEL[cond] : "not recorded"}`}
                      onPress={() => handleSelectTooth(t.toothNumber)}
                      style={[
                        styles.toothCapsule,
                        isDecay && styles.toothDecay,
                        isSelected && styles.toothSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.enamelDot,
                          isDecay && styles.enamelDotDecay,
                          isSelected && styles.enamelDotSelected,
                        ]}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Lower Jaw Arch */}
            <View style={styles.archRow}>
              <View style={styles.gumRidgeLower}>
                {lowerTeeth.map((t) => {
                  const cond = getOverallCondition(t);
                  const isDecay = cond === "decay";
                  const isSelected = t.toothNumber === selectedToothNumber;
                  return (
                    <Pressable
                      key={t.toothNumber}
                      accessibilityRole="button"
                      accessibilityLabel={`Tooth ${t.toothNumber}: ${t.recorded ? CONDITION_LABEL[cond] : "not recorded"}`}
                      onPress={() => handleSelectTooth(t.toothNumber)}
                      style={[
                        styles.toothCapsule,
                        isDecay && styles.toothDecay,
                        isSelected && styles.toothSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.enamelDot,
                          isDecay && styles.enamelDotDecay,
                          isSelected && styles.enamelDotSelected,
                        ]}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Selected Tooth Detail Banner */}
          {selectedTooth ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View tooth details"
              onPress={() => setShowToothModal(true)}
              style={styles.selectedDetail}
            >
              <View style={styles.selectedDetailLeft}>
                <ThemedText variant="headline" style={styles.selectedToothTitle}>
                  Tooth #{selectedTooth.toothNumber} · {anatomy.fullName}
                </ThemedText>
                <ThemedText variant="caption" style={styles.selectedToothSub}>
                  {anatomy.fdi} ({selectedTooth.quadrant}) · {anatomy.archName} · Tap to inspect
                </ThemedText>
              </View>
              <View style={styles.selectedDetailRight}>
                <Badge
                  label={toLabel(selectedLabel)}
                  variant={CONDITION_BADGE[selectedTooth.recorded ? selectedCondition : "unrecorded"]}
                />
                <AppIcon name="chevronRight" size={16} color={colors.secondaryLabel} />
              </View>
            </Pressable>
          ) : null}
        </Card>

      </ScrollView>

      {/* Frame 3: Interactive Tooth Deep-Dive Sheet Modal (Neo Financial Itemized Detail Pattern) */}
      <Modal
        visible={showToothModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowToothModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close tooth details" style={styles.modalBackdrop} onPress={() => setShowToothModal(false)} />

          <View style={styles.sheetContainer}>
            {/* Grabber handle */}
            <View style={styles.sheetGrabber} />

            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View>
                <ThemedText variant="headline" style={styles.sheetTitle}>
                  Tooth #{selectedTooth.toothNumber} ({anatomy.fdi})
                </ThemedText>
                <ThemedText variant="caption" style={styles.sheetSub}>
                  {anatomy.fullName} · {anatomy.archName}
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => setShowToothModal(false)}
                style={styles.closeBtn}
              >
                <AppIcon name="close" size={16} color={colors.ink} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScroll}
            >
              <Card elevation="flat" style={styles.diagnosticCard}>
                <View style={styles.diagnosticRow}>
                  <View style={styles.statusGroup}>
                    <ThemedText variant="caption" style={styles.cardSectionLabel}>
                      Recorded condition
                    </ThemedText>
                    <ThemedText variant="headline" style={styles.statusHeading}>
                      {selectedLabel}
                    </ThemedText>
                  </View>
                </View>
              </Card>

              {recordedSurfaces.length > 0 ? (
                <View style={styles.surfaceSection}>
                  <ThemedText variant="caption" style={styles.sectionHeader}>
                    Surfaces
                  </ThemedText>
                  <View style={styles.surfaceGrid}>
                    {recordedSurfaces.map(([surface, condition]) => {
                      const risk = condition === "decay";
                      return (
                        <View key={surface} style={styles.surfaceRow}>
                          <View style={styles.surfaceIndicatorRow}>
                            <View style={[styles.surfaceDot, risk && styles.surfaceDotRisk]} />
                            <ThemedText variant="subhead" style={styles.surfaceName}>
                              {SURFACE_LABEL[surface] ?? surface}
                            </ThemedText>
                          </View>
                          <ThemedText variant="caption" style={[styles.surfaceStatus, risk && styles.surfaceStatusRisk]}>
                            {CONDITION_LABEL[condition] ?? condition}
                          </ThemedText>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {selectedTooth.notes ? (
                <Card elevation="flat" style={styles.clinicianNoteCard}>
                  <ThemedText variant="subhead" style={styles.clinicianName}>
                    Notes from your dentist
                  </ThemedText>
                  <ThemedText variant="body" style={styles.clinicianNoteBody}>
                    {selectedTooth.notes}
                  </ThemedText>
                </Card>
              ) : null}

              <ThemedText variant="caption" style={styles.sheetSub}>
                Questions about this tooth? Ask your dentist at your next visit or by message.
              </ThemedText>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.sheetFooter}>
              <Button title="Book an appointment" variant="primary" size="lg" onPress={handleBookAppointment} />
              <Button
                title="Close"
                variant="ghost"
                size="md"
                onPress={() => setShowToothModal(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  archContainer: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.md,
  },
  archModelWrapper: {
    alignItems: "center",
    gap: 12,
    paddingVertical: spacing.sm,
    position: "relative",
  },
  archRow: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  backBtn: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    width: 44,
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
  enamelDot: {
    backgroundColor: colors.separator,
    borderRadius: radius.xs,
    height: 12,
    width: 8,
  },
  enamelDotDecay: {
    backgroundColor: colors.danger,
  },
  enamelDotSelected: {
    backgroundColor: colors.ink,
  },
  gumRidgeLower: {
    alignItems: "center",
    backgroundColor: colors.dangerSubtle,
    borderColor: colors.separator,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 6,
    width: "100%",
  },
  gumRidgeUpper: {
    alignItems: "center",
    backgroundColor: colors.dangerSubtle,
    borderColor: colors.separator,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 6,
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerSpacer: {
    height: 44,
    width: 44,
  },
  headerTitle: {
    color: colors.label,
    fontSize: 17,
    fontWeight: "700",
  },
  selectedDetail: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  selectedDetailLeft: {
    flex: 1,
    gap: 2,
  },
  selectedDetailRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  selectedToothSub: {
    color: colors.secondaryLabel,
  },
  selectedToothTitle: {
    color: colors.label,
    fontSize: 15,
  },
  toothCapsule: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    height: 24,
    justifyContent: "center",
    width: 15,
  },
  toothDecay: {
    backgroundColor: colors.dangerSubtle,
    borderColor: colors.danger,
  },
  toothSelected: {
    borderColor: colors.ink,
    borderWidth: 2,
  },
  /* Tooth Detail Sheet Modal Styles */
  modalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: colors.sheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: spacing.sm,
    maxHeight: "88%",
    paddingBottom: 28,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
  },
  sheetGrabber: {
    alignSelf: "center",
    backgroundColor: colors.separator,
    borderRadius: radius.xs,
    height: 4,
    marginBottom: spacing.xs,
    width: 36,
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.xs,
  },
  sheetTitle: {
    color: colors.label,
    fontSize: 17,
    fontWeight: "700",
  },
  sheetSub: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  closeBtn: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  sheetScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  diagnosticCard: {
    backgroundColor: colors.systemBackground,
    padding: spacing.sm,
  },
  diagnosticRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusGroup: {
    flex: 1,
    gap: 2,
  },
  cardSectionLabel: {
    color: colors.secondaryLabel,
    fontSize: 11,
    fontWeight: "700",
  },
  statusHeading: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "600",
  },
  surfaceSection: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  sectionHeader: {
    color: colors.secondaryLabel,
    fontSize: 11,
    fontWeight: "700",
  },
  surfaceGrid: {
    gap: 6,
  },
  surfaceRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  surfaceIndicatorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  surfaceDot: {
    backgroundColor: colors.success,
    borderRadius: radius.full,
    height: 6,
    width: 6,
  },
  surfaceDotRisk: {
    backgroundColor: colors.danger,
  },
  surfaceName: {
    color: colors.label,
    fontSize: 13,
  },
  surfaceStatus: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  surfaceStatusRisk: {
    color: colors.danger,
    fontWeight: "600",
  },
  clinicianNoteCard: {
    backgroundColor: colors.systemBackground,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  clinicianName: {
    color: colors.label,
    fontSize: 13,
    fontWeight: "600",
  },
  clinicianNoteBody: {
    color: colors.secondaryLabel,
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
  },
  sheetFooter: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
});
