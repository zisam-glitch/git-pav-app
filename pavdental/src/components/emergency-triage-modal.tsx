import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Modal, Linking } from "react-native";
import { useRouter } from "expo-router";
import { safeHaptics } from "@/lib/haptics";
import { ThemedText } from "./themed-text";
import { Card } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { AppIcon, AppIconName } from "./app-icon";
import { colors, spacing, radius } from "@/theme";
import { PRACTICE_CONFIG } from "@/config/practice";

export interface EmergencyTriageModalProps {
  visible: boolean;
  onClose: () => void;
}

type SymptomType = "pain" | "broken" | "filling" | "swelling" | "bleeding";

interface SymptomOption {
  id: SymptomType;
  label: string;
  icon: AppIconName;
  tag: string;
  title: string;
  advice: string[];
  redFlag?: string;
}

// DRAFT WORDING, needs clinical lead sign-off (decisions log #11). Titles
// describe what the patient reports, never a diagnosis, and advice is general
// first aid with no drug doses. Bookings go through the real service catalogue.
const SYMPTOMS: SymptomOption[] = [
  {
    id: "pain",
    label: "Severe Pain",
    icon: "alert",
    tag: "Urgent",
    title: "Severe toothache",
    advice: [
      "Take over-the-counter pain relief as directed on the packet, if it is safe for you.",
      "Avoid very hot, cold or sugary food and drink if they make the pain worse.",
    ],
    redFlag: "Call NHS 111 if the pain is severe and you cannot get a dental appointment.",
  },
  {
    id: "broken",
    label: "Broken Tooth",
    icon: "zap",
    tag: "Same-day care",
    title: "Broken or chipped tooth",
    advice: [
      "Rinse your mouth gently with warm water.",
      "If you have the broken piece, keep it in milk and bring it to your appointment.",
    ],
    redFlag: "Go to A&E if a tooth was knocked out after a head injury.",
  },
  {
    id: "filling",
    label: "Lost Crown / Filling",
    icon: "activity",
    tag: "Priority",
    title: "Lost crown or filling",
    advice: [
      "Keep the crown in a clean, dry container and bring it with you. Do not glue it back in.",
      "Chew on the other side of your mouth until you have been seen.",
    ],
  },
  {
    id: "swelling",
    label: "Facial Swelling",
    icon: "alert",
    tag: "Urgent",
    title: "Swelling in the face or gums",
    advice: [
      "Do not try to burst or drain any swelling yourself.",
    ],
    redFlag: "Go to A&E or call 999 if swelling affects your breathing, swallowing or vision.",
  },
  {
    id: "bleeding",
    label: "Bleeding Gums",
    icon: "activity",
    tag: "Clinical review",
    title: "Bleeding from the gums or a socket",
    advice: [
      "Bite firmly on a clean, folded piece of gauze for 20 minutes.",
      "Avoid rinsing, spitting or drinking through a straw.",
    ],
    redFlag: "Call NHS 111 if bleeding does not stop after 45 minutes of firm pressure.",
  },
];

export function EmergencyTriageModal({ visible, onClose }: EmergencyTriageModalProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<SymptomType>("pain");
  const [painLevel, setPainLevel] = useState<number>(8);

  const selected = SYMPTOMS.find((s) => s.id === selectedId) || SYMPTOMS[0];

  const handleSelectSymptom = (id: SymptomType) => {
    safeHaptics.impactAsync("light").catch(() => {});
    setSelectedId(id);
  };

  const handleBookEmergency = () => {
    safeHaptics.impactAsync("medium").catch(() => {});
    onClose();
    router.push("/(patient)/booking/service-catalog" as never);
  };

  const handleStartVideo = () => {
    safeHaptics.impactAsync("light").catch(() => {});
    onClose();
    // A video consult is a booked appointment (the clinician sees the triage
    // before letting the patient in), so this books the video service.
    router.push("/(patient)/booking/service-catalog?channel=video" as never);
  };

  const handleCallHotline = () => {
    safeHaptics.impactAsync("light").catch(() => {});
    Linking.openURL(PRACTICE_CONFIG.telUrl).catch(() => {});
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.modalBackdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          <View style={styles.sheetGrabber} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.emergencyBadge}>
                <AppIcon name="alert" size={13} color={colors.danger} />
                <ThemedText variant="caption" style={styles.emergencyBadgeText}>
                  Urgent symptom check
                </ThemedText>
              </View>
              <ThemedText variant="headline" style={styles.sheetTitle}>
                What are you experiencing?
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={styles.closeBtn}
            >
              <AppIcon name="close" size={16} color={colors.ink} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Symptom selection horizontal pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.hScroll}
          contentContainerStyle={styles.symptomPillsRow}
            >
              {SYMPTOMS.map((item) => {
                const isActive = item.id === selectedId;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected: isActive }}
                    onPress={() => handleSelectSymptom(item.id)}
                    style={[
                      styles.symptomPill,
                      isActive ? styles.symptomPillActive : styles.symptomPillInactive,
                    ]}
                  >
                    <AppIcon
                      name={item.icon}
                      size={14}
                      color={isActive ? colors.onAccent : colors.ink}
                    />
                    <ThemedText
                      variant="caption"
                      style={[
                        styles.symptomPillText,
                        isActive && styles.symptomPillTextActive,
                      ]}
                    >
                      {item.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Pain Severity Stepper */}
            <Card elevation="flat" style={styles.painScoreCard}>
              <View style={styles.painScoreHeader}>
                <ThemedText variant="caption" style={styles.sectionLabel}>
                  Pain severity scale (1–10)
                </ThemedText>
                <ThemedText variant="mono" style={styles.painScoreValue}>
                  {painLevel} / 10 · {painLevel >= 8 ? "Severe" : painLevel >= 4 ? "Moderate" : "Mild"}
                </ThemedText>
              </View>

              <View style={styles.painDotsRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                  const isSelected = score === painLevel;
                  const isFilled = score <= painLevel;
                  return (
                    <Pressable
                      key={score}
                      accessibilityRole="button"
                      accessibilityLabel={`Pain level ${score}`}
                      accessibilityState={{ selected: isSelected }}
                      hitSlop={{ top: 8, bottom: 8 }}
                      onPress={() => {
                        safeHaptics.impactAsync("light").catch(() => {});
                        setPainLevel(score);
                      }}
                      style={[
                        styles.painDot,
                        isFilled && styles.painDotFilled,
                        isSelected && styles.painDotSelected,
                      ]}
                    >
                      <ThemedText
                        variant="caption"
                        style={[
                          styles.painDotText,
                          isFilled && styles.painDotTextFilled,
                          isSelected && styles.painDotTextSelected,
                        ]}
                      >
                        {score}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            {/* Selected Assessment & Clinical Advice Card */}
            <Card style={styles.assessmentCard}>
              <View style={styles.assessmentTopRow}>
                <ThemedText variant="headline" style={styles.assessmentTitle}>
                  {selected.title}
                </ThemedText>
                <Badge
                  label={selected.tag}
                  variant={selected.id === "swelling" ? "danger" : "warning"}
                />
              </View>

              <View style={styles.adviceList}>
                <ThemedText variant="caption" style={styles.sectionLabel}>
                  While you wait
                </ThemedText>
                {selected.advice.map((line, idx) => (
                  <View key={idx} style={styles.adviceItemRow}>
                    <View style={styles.adviceBullet} />
                    <ThemedText variant="caption" style={styles.adviceLine}>
                      {line}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {/* Red Flag Warning Box */}
              {selected.redFlag ? (
                <View style={styles.redFlagBox}>
                  <ThemedText variant="caption" style={styles.redFlagText}>
                    {selected.redFlag}
                  </ThemedText>
                </View>
              ) : null}
            </Card>

            {/* Quick Hotline Banner */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Call practice emergency hotline at ${PRACTICE_CONFIG.phone}`}
              onPress={handleCallHotline}
              style={styles.hotlineBanner}
            >
              <AppIcon name="phone" size={15} color={colors.ink} />
              <View style={styles.hotlineTextGroup}>
                <ThemedText variant="caption" style={styles.hotlineLabel}>
                  Need urgent advice by phone?
                </ThemedText>
                <ThemedText variant="subhead" style={styles.hotlineNumber}>
                  {`Call the practice (${PRACTICE_CONFIG.phone}) ›`}
                </ThemedText>
              </View>
            </Pressable>
          </ScrollView>

          {/* Action CTAs */}
          <View style={styles.sheetFooter}>
            <Button
              title="Book an appointment ›"
              variant="primary"
              size="lg"
              onPress={handleBookEmergency}
            />
            <Button
              title="Book a video triage"
              variant="secondary"
              size="md"
              onPress={handleStartVideo}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Horizontal chip rows must not stretch to fill the column (web)
  hScroll: {
    flexGrow: 0,
  },
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
    maxHeight: "90%",
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
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.xxs,
  },
  headerTitleGroup: {
    flex: 1,
    gap: 4,
  },
  emergencyBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.full,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  emergencyBadgeText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sheetTitle: {
    color: colors.label,
    fontSize: 17,
    fontWeight: "700",
  },
  closeBtn: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  symptomPillsRow: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: 4,
  },
  symptomPill: {
    alignItems: "center",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  symptomPillActive: {
    backgroundColor: colors.accent,
  },
  symptomPillInactive: {
    backgroundColor: colors.systemBackground,
  },
  symptomPillText: {
    color: colors.label,
    fontSize: 13,
    fontWeight: "600",
  },
  symptomPillTextActive: {
    color: colors.onAccent,
  },
  painScoreCard: {
    backgroundColor: colors.systemBackground,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  painScoreHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionLabel: {
    color: colors.secondaryLabel,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  painScoreValue: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: "700",
  },
  painDotsRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "space-between",
  },
  painDot: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.full,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  painDotFilled: {
    backgroundColor: colors.dangerSubtle,
    borderColor: colors.danger,
  },
  painDotSelected: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  // The selected score sits on solid red: its number must stay readable.
  painDotTextSelected: {
    color: colors.onTint,
  },
  painDotText: {
    color: colors.secondaryLabel,
    fontSize: 11,
    fontWeight: "600",
  },
  painDotTextFilled: {
    color: colors.danger,
  },
  assessmentCard: {
    backgroundColor: colors.systemBackground,
    gap: spacing.sm,
    padding: spacing.md,
  },
  assessmentTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  assessmentTitle: {
    color: colors.label,
    fontSize: 17,
    fontWeight: "700",
  },
  adviceList: {
    gap: 6,
  },
  adviceItemRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  adviceBullet: {
    backgroundColor: colors.ink,
    borderRadius: radius.full,
    height: 4,
    marginTop: 6,
    width: 4,
  },
  adviceLine: {
    color: colors.label,
    flex: 1,
    fontSize: 13,
    lineHeight: 17,
  },
  redFlagBox: {
    backgroundColor: colors.dangerSubtle,
    borderColor: colors.dangerSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.xs,
  },
  redFlagText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
  },
  hotlineBanner: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  hotlineTextGroup: {
    flex: 1,
  },
  hotlineLabel: {
    color: colors.secondaryLabel,
    fontSize: 11,
  },
  hotlineNumber: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  sheetFooter: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
});