import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText, Input, Button, FlowHeader } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";

export default function OnboardingMedicalHistoryScreen() {
  const router = useRouter();
  const [hasAllergies, setHasAllergies] = useState(false);
  const [allergyDetails, setAllergyDetails] = useState("");
  const [isTakingMeds, setIsTakingMeds] = useState(false);
  const [medDetails, setMedDetails] = useState("");
  const [isBleedingRisk, setIsBleedingRisk] = useState(false);
  const [gpSurgery, setGpSurgery] = useState("");
  const setMedicalHistory = useOnboardingStore((s) => s.setMedicalHistory);

  const handleNext = () => {
    setMedicalHistory({
      hasAllergies,
      allergyDetails: allergyDetails.trim(),
      isTakingMeds,
      medDetails: medDetails.trim(),
      isBleedingRisk,
      gpSurgery: gpSurgery.trim(),
    });
    router.push("/onboarding/consents");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.topNav}>
          <FlowHeader step={{ current: 3, total: 4 }} insetHandled />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText variant="largeTitle" style={styles.title}>
              Medical history
            </ThemedText>
            <ThemedText variant="subhead" style={styles.subtitle}>
              Essential clinical questions to keep you safe during dental treatments and anaesthetics.
            </ThemedText>
          </View>

          <View style={styles.form}>
            {/* Allergies */}
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabelBox}>
                  <ThemedText variant="headline" style={styles.cardTitle}>Known allergies</ThemedText>
                  <ThemedText variant="caption" style={styles.switchSub}>
                    e.g. Latex, Penicillin, Anaesthetics
                  </ThemedText>
                </View>
                <Switch
                  value={hasAllergies}
                  onValueChange={setHasAllergies}
                  trackColor={{ true: colors.successFill, false: colors.inkSubtle }}
                  accessibilityRole="switch"
                  accessibilityLabel="Known Allergies"
                />
              </View>

              {hasAllergies ? (
                <View style={styles.inputWrap}>
                  <Input
                    label="Allergy details"
                    placeholder="List your allergies"
                    value={allergyDetails}
                    onChangeText={setAllergyDetails}
                  />
                </View>
              ) : null}
            </View>

            {/* Medications */}
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabelBox}>
                  <ThemedText variant="headline" style={styles.cardTitle}>Regular medications</ThemedText>
                  <ThemedText variant="caption" style={styles.switchSub}>
                    Prescription or regular over-the-counter
                  </ThemedText>
                </View>
                <Switch
                  value={isTakingMeds}
                  onValueChange={setIsTakingMeds}
                  trackColor={{ true: colors.successFill, false: colors.inkSubtle }}
                  accessibilityRole="switch"
                  accessibilityLabel="Regular Medications"
                />
              </View>

              {isTakingMeds ? (
                <View style={styles.inputWrap}>
                  <Input
                    label="Medication details"
                    placeholder="List medications & dosages"
                    value={medDetails}
                    onChangeText={setMedDetails}
                  />
                </View>
              ) : null}
            </View>

            {/* Blood thinners / bleeding */}
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabelBox}>
                  <ThemedText variant="headline" style={styles.cardTitle}>Blood thinners / bleeding</ThemedText>
                  <ThemedText variant="caption" style={styles.switchSub}>
                    e.g. Warfarin, Apixaban, Clopidogrel
                  </ThemedText>
                </View>
                <Switch
                  value={isBleedingRisk}
                  onValueChange={setIsBleedingRisk}
                  trackColor={{ true: colors.successFill, false: colors.inkSubtle }}
                  accessibilityRole="switch"
                  accessibilityLabel="Blood Thinners or Bleeding Disorders"
                />
              </View>
            </View>

            {/* GP Surgery */}
            <Input
              label="GP surgery / practice name"
              placeholder="e.g. High Street Medical Centre"
              value={gpSurgery}
              onChangeText={setGpSurgery}
            />
          </View>

          <View style={styles.actions}>
            <Button
              title="Continue to consents"
              size="lg"
              arrow={true}
              onPress={handleNext}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: "auto",
    paddingTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cardTitle: {
    fontWeight: "700",
  },
  flex: {
    flex: 1,
  },
  form: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  inputWrap: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
  },
  subtitle: {
    color: colors.secondaryLabel,
    fontSize: 15,
    lineHeight: 21,
  },
  switchLabelBox: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.md,
  },
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  switchSub: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  title: {
    color: colors.label,
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  topNav: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
});
