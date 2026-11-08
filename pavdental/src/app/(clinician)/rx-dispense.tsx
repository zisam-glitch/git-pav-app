import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ThemedText, Input, Button, Card, ErrorState, ToggleSwitch } from "@/components";
import { colors, spacing } from "@/theme";
import { useCurrentUser } from "@/features/auth/auth-store";
import { apiUrl, authFetch } from "@/features/auth/auth-api";
import { summariseMedicalHistory, describeList } from "@/features/clinical/medical-summary";

interface ClinicalContext {
  appointmentId: string;
  patient: { id: string; firstName: string; lastName: string; dob: string | null; address: string | null };
  // Set when a parent or guardian booked this visit for their child.
  guardian?: { id: string; firstName: string; lastName: string } | null;
  medicalHistory: Record<string, unknown> | null;
}

async function fetchClinicalContext(appointmentId: string): Promise<ClinicalContext> {
  const res = await authFetch(`/api/booking/appointments/${encodeURIComponent(appointmentId)}/clinical-context`);
  if (!res.ok) throw new Error(res.status === 404 ? "not_found" : "failed");
  return res.json();
}

// Prescribing is only possible against a real appointment: the patient, their
// address and their recorded allergies all come from the API. Nothing is
// pre-filled, and a missing record says "Not recorded", never "none" (MC-1).
export default function ClinicianRxDispenseScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();

  const context = useQuery({
    queryKey: ["clinical-context", appointmentId],
    queryFn: () => fetchClinicalContext(appointmentId!),
    enabled: !!appointmentId,
  });

  const [medication, setMedication] = useState("");
  const [dosageInstructions, setDosageInstructions] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [allergiesChecked, setAllergiesChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clinicianName = currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : null;

  if (!appointmentId) {
    return (
      <View style={styles.centered}>
        <ErrorState illustration="notFound" message="Open a prescription from a patient's appointment. There is no patient selected." />
      </View>
    );
  }
  if (context.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator accessibilityLabel="Loading patient record" />
      </View>
    );
  }
  if (context.isError || !context.data) {
    return (
      <View style={styles.centered}>
        <ErrorState
          message="Couldn't load this patient's record, so a prescription can't be written."
          onRetry={() => context.refetch()}
        />
      </View>
    );
  }

  const { patient } = context.data;
  const summary = summariseMedicalHistory(context.data.medicalHistory);
  const hasAllergyWarning = summary.allergies === null || summary.allergies.length > 0;
  const canSubmit =
    medication.trim() !== "" && dosageInstructions.trim() !== "" && pharmacyName.trim() !== "" && allergiesChecked;

  const handleSignAndSend = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const res = await authFetch("/api/prescriptions", {
        method: "POST",
        body: JSON.stringify({
          appointmentId,
          medicationName: medication.trim(),
          dosageInstructions: dosageInstructions.trim(),
          dispensingPharmacy: pharmacyName.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "The prescription wasn't saved");
      }
      const issued = await res.json().catch(() => ({}));

      // Conclude video consultation and record summary if this visit was a video consult
      await authFetch("/api/video/end-consult", {
        method: "POST",
        body: JSON.stringify({
          appointmentId,
          notes: `Prescription issued: ${medication.trim()} (${dosageInstructions.trim()}). Dispensing via ${pharmacyName.trim()}.`,
          treatmentPlan: "Complete medication course as prescribed. Follow up if symptoms worsen.",
          followUpRecommended: "clinic",
        }),
      }).catch(() => {});
      // Decisions log #4: a pharmacy needs the prescriber's own signature, so
      // the PDF is printed and signed in ink before it goes to the patient.
      const next = "Print the PDF and sign it in ink before giving it to the patient. A copy is in their app for their records.";
      Alert.alert("Prescription issued", issued.reference ? `Reference ${issued.reference}. ${next}` : next, [
        { text: "Done", style: "cancel", onPress: () => router.replace("/(clinician)/schedule") },
        {
          text: "Open PDF to print",
          onPress: async () => {
            try {
              const link = await authFetch(`/api/prescriptions/${issued.id}/pdf-link`, { method: "POST" });
              const body = await link.json().catch(() => ({}));
              if (!link.ok) throw new Error(body.error || "Couldn't open the prescription");
              await Linking.openURL(apiUrl(body.path));
            } catch (err: any) {
              Alert.alert("Couldn't open the prescription", err?.message || "Open it from the patient's prescriptions instead.");
            } finally {
              router.replace("/(clinician)/schedule");
            }
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert("Prescription not saved", err?.message || "The prescription wasn't saved");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="largeTitle" style={styles.title}>
            Prescription
          </ThemedText>
          {clinicianName ? (
            <ThemedText variant="subhead" style={styles.subtitle}>
              Prescriber: {clinicianName}
            </ThemedText>
          ) : null}
        </View>

        <Card style={styles.card}>
          <ThemedText variant="headline">Patient</ThemedText>
          <ThemedText variant="body">
            {patient.firstName} {patient.lastName}
          </ThemedText>
          {context.data.guardian ? (
            <ThemedText variant="caption" style={styles.address}>
              Child, booked by parent or guardian {context.data.guardian.firstName} {context.data.guardian.lastName}
            </ThemedText>
          ) : null}
          <ThemedText variant="caption" style={styles.address}>
            {patient.address ?? "Address not recorded"}
          </ThemedText>
        </Card>

        <Card style={[styles.card, hasAllergyWarning && styles.warningCard]}>
          <ThemedText variant="headline">Allergies</ThemedText>
          <ThemedText
            variant="body"
            style={hasAllergyWarning ? styles.allergyWarning : undefined}
            accessibilityRole={hasAllergyWarning ? "alert" : undefined}
          >
            {describeList(summary.allergies, "No known allergies (as reported by the patient)")}
          </ThemedText>
          <ThemedText variant="headline" style={styles.sectionGap}>
            Current medications
          </ThemedText>
          <ThemedText variant="body">{describeList(summary.medications, "None reported")}</ThemedText>
          {summary.conditions.length > 0 ? (
            <>
              <ThemedText variant="headline" style={styles.sectionGap}>
                Conditions
              </ThemedText>
              <ThemedText variant="body">{summary.conditions.join(", ")}</ThemedText>
            </>
          ) : null}
        </Card>

        <View style={styles.form}>
          <Input label="Medicine, strength and form" value={medication} onChangeText={setMedication} />
          <Input label="Dose and frequency" value={dosageInstructions} onChangeText={setDosageInstructions} />
          <Input label="Dispensing pharmacy" value={pharmacyName} onChangeText={setPharmacyName} />
          <ToggleSwitch
            label="I have checked this prescription against the patient's allergies and medications"
            value={allergiesChecked}
            onValueChange={setAllergiesChecked}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isSubmitting ? "Saving..." : "Sign and save prescription"}
          size="lg"
          loading={isSubmitting}
          disabled={!canSubmit || isSubmitting}
          onPress={handleSignAndSend}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  address: {
    color: colors.secondaryLabel,
  },
  allergyWarning: {
    color: colors.danger,
    fontWeight: "600",
    marginTop: 2,
  },
  centered: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.md,
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
  footer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  form: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xxs,
  },
  sectionGap: {
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  warningCard: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  title: {
    color: colors.label,
  },
});

