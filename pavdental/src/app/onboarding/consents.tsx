import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText, Button, FlowHeader, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authFetch } from "@/features/auth/auth-api";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/features/auth/auth-store";
import {
  useOnboardingStore,
  OnboardingMedicalHistory,
} from "@/features/onboarding/onboarding-store";

/** Free-text gender → backend enum; unmappable values → "other" */
function mapGender(value: string): string | undefined {
  const v = value.trim().toLowerCase();
  if (!v) return undefined;
  if (["male", "m"].includes(v)) return "male";
  if (["female", "f"].includes(v)) return "female";
  if (v.includes("prefer") || v.includes("not say")) return "prefer_not_to_say";
  return "other";
}

export default function OnboardingConsentsScreen() {
  const router = useRouter();
  const [dataProcessing, setDataProcessing] = useState(false);
  const [treatmentConsent, setTreatmentConsent] = useState(false);
  const [directMarketing, setDirectMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setConsents = useOnboardingStore((s) => s.setConsents);
  const draft = useOnboardingStore();
  const { user } = useAuthStore();

  const handleComplete = async () => {
    if (!dataProcessing || !treatmentConsent) {
      setError("Please accept the mandatory health data & clinical treatment consents to continue.");
      return;
    }
    if (!user?.profileId) {
      setError("Session error — please sign in again.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      setConsents({ dataProcessing, treatmentConsent, directMarketing });

      const history: OnboardingMedicalHistory = draft.medicalHistory;

      // 1. Profile + medical history → patients API (server-authoritative)
      const profileRes = await authFetch(`/api/patients/${user.profileId}/profile`, {
        method: "PUT",
        body: JSON.stringify({
          dob: draft.dob || undefined,
          gender: mapGender(draft.gender),
          addressLine1: draft.addressLine1 || undefined,
          addressLine2: draft.addressLine2 || undefined,
          city: draft.city || undefined,
          postcode: draft.postcode || undefined,
          emergencyContactName: draft.emergencyContactName || undefined,
          emergencyContactPhone: draft.emergencyContactPhone || undefined,
          medicalHistory: {
            hasAllergies: history.hasAllergies,
            allergies: history.allergyDetails || undefined,
            isTakingMeds: history.isTakingMeds,
            medications: history.medDetails || undefined,
            isBleedingRisk: history.isBleedingRisk,
            gpSurgery: history.gpSurgery || undefined,
          },
        }),
      });
      if (!profileRes.ok) {
        const err = (await profileRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Could not save your profile");
      }

      // 2. Consents → consent records (versioned and audited)
      const grants: Array<{ consentType: string; lawfulBasis: string }> = [
        { consentType: "data_processing", lawfulBasis: "consent" },
        { consentType: "clinical_records", lawfulBasis: "consent" },
        ...(directMarketing
          ? [{ consentType: "marketing", lawfulBasis: "consent" }]
          : []),
      ];
      for (const grant of grants) {
        const res = await authFetch("/api/consents/grant", {
          method: "POST",
          body: JSON.stringify(grant),
        });
        if (!res.ok && res.status !== 409) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(err.error || `Could not record ${grant.consentType} consent`);
        }
      }

      // The Home card and the booking check both read the saved profile.
      await queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
      router.push("/onboarding/complete");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not finish setup. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topNav}>
        <FlowHeader step={{ current: 4, total: 4 }} insetHandled />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText variant="largeTitle" style={styles.title}>
            Privacy & consents
          </ThemedText>
          <ThemedText variant="subhead" style={styles.subtitle}>
            We handle your data under UK GDPR. Our privacy notice explains how.
          </ThemedText>
        </View>

        {error ? (
          <View style={styles.errorBox} accessibilityRole="alert">
            <AppIcon name="alert" size={16} color={colors.danger} />
            <ThemedText variant="caption" style={styles.errorText}>
              {error}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.consentList}>
          {/* Mandatory Health Data */}
          <View style={styles.consentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <ThemedText variant="headline" style={styles.cardTitle}>
                  Health data processing
                </ThemedText>
                <View style={styles.mandatoryBadge}>
                  <ThemedText variant="caption" style={styles.mandatoryText}>Required</ThemedText>
                </View>
              </View>
              <Switch
                value={dataProcessing}
                onValueChange={(val) => {
                  setDataProcessing(val);
                  if (error) setError(null);
                }}
                trackColor={{ true: colors.successFill, false: colors.inkSubtle }}
                accessibilityRole="switch"
                accessibilityLabel="Special Category Health Data Consent"
              />
            </View>
            <ThemedText variant="subhead" style={styles.cardBody}>
              I consent to Pav Dental storing and processing my sensitive medical and dental history to provide clinical triage, examinations, and healthcare.
            </ThemedText>
          </View>

          {/* Mandatory Clinical Examination */}
          <View style={styles.consentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <ThemedText variant="headline" style={styles.cardTitle}>
                  General treatment
                </ThemedText>
                <View style={styles.mandatoryBadge}>
                  <ThemedText variant="caption" style={styles.mandatoryText}>Required</ThemedText>
                </View>
              </View>
              <Switch
                value={treatmentConsent}
                onValueChange={(val) => {
                  setTreatmentConsent(val);
                  if (error) setError(null);
                }}
                trackColor={{ true: colors.successFill, false: colors.inkSubtle }}
                accessibilityRole="switch"
                accessibilityLabel="General Treatment and Examination Consent"
              />
            </View>
            <ThemedText variant="subhead" style={styles.cardBody}>
              I understand that examinations, X-rays, video consultations, and emergency triage may be conducted by registered GDC practitioners.
            </ThemedText>
          </View>

          {/* Optional Communication */}
          <View style={styles.consentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <ThemedText variant="headline" style={styles.cardTitle}>
                  Recall & reminders
                </ThemedText>
                <View style={styles.optionalBadge}>
                  <ThemedText variant="caption" style={styles.optionalText}>Optional</ThemedText>
                </View>
              </View>
              <Switch
                value={directMarketing}
                onValueChange={setDirectMarketing}
                trackColor={{ true: colors.successFill, false: colors.inkSubtle }}
                accessibilityRole="switch"
                accessibilityLabel="Hygiene and Recall Reminders Consent"
              />
            </View>
            <ThemedText variant="subhead" style={styles.cardBody}>
              Receive SMS and email reminders when your routine 6-month checkup or hygiene session is due.
            </ThemedText>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title={isSubmitting ? "Saving your details..." : "Complete registration"}
            size="lg"
            arrow={true}
            loading={isSubmitting}
            onPress={handleComplete}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: "auto",
    paddingTop: spacing.sm,
  },
  cardBody: {
    color: colors.secondaryLabel,
    fontSize: 13,
    lineHeight: 18,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  cardTitle: {
    fontWeight: "700",
  },
  consentCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.xs,
    padding: spacing.md,
  },
  consentList: {
    gap: spacing.md,
  },
  errorBox: {
    alignItems: "center",
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  errorText: {
    color: colors.danger,
    flex: 1,
    fontWeight: "600",
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  mandatoryBadge: {
    backgroundColor: colors.ink,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  mandatoryText: {
    color: colors.alwaysWhite,
    fontSize: 11,
    fontWeight: "700",
  },
  optionalBadge: {
    backgroundColor: colors.separator,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  optionalText: {
    color: colors.secondaryLabel,
    fontSize: 11,
    fontWeight: "700",
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
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
