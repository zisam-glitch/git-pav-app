import React from "react";
import { ukDateLabel } from "@/features/booking/uk-time";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { ThemedText, Card, Badge, Button, AppIcon } from "@/components";
import {
  useCurrentConsents,
  useConsentHistory,
  useToggleMarketingConsentMutation,
  useExportDataAccessMutation,
} from "@/features/account/account-hooks";
import { consentLabel } from "@/features/account/consents";
import { colors, spacing, type, radius } from "@/theme";

export default function ConsentScreen() {
  const currentConsentsQuery = useCurrentConsents();
  const historyQuery = useConsentHistory(true);
  const toggleMarketingMutation = useToggleMarketingConsentMutation();
  const exportMutation = useExportDataAccessMutation();

  const activeConsents = currentConsentsQuery.data ?? [];
  // Every grant and withdrawal, newest first, so the patient can see what they
  // agreed to and when (UK GDPR Article 7).
  const history = historyQuery.data ?? null;
  const isUpdatingMarketing = toggleMarketingMutation.isPending;
  const isExporting = exportMutation.isPending;

  const healthDataConsent = activeConsents.find(
    (c) => c.consentType === "data_processing" || c.consentType === "treatment_data_processing"
  );
  const treatmentConsent = activeConsents.find(
    (c) => c.consentType === "clinical_records"
  );
  const marketingConsent = activeConsents.find(
    (c) => c.consentType === "marketing" || c.consentType === "marketing_communications"
  );

  const marketingOptedIn = Boolean(marketingConsent?.isGranted);

  const handleToggleMarketingConsent = async () => {
    const nextState = !marketingOptedIn;
    try {
      await toggleMarketingMutation.mutateAsync(nextState);
    } catch (err: any) {
      Alert.alert(
        "Consent Update Error",
        err?.message || "Could not update your marketing consent preference."
      );
    }
  };

  const handleExportData = async () => {
    try {
      const res = await exportMutation.mutateAsync({
        reason: "Patient Subject Access Request via Mobile App",
        format: "json",
      });
      Alert.alert(
        "Your data is ready",
        res?.sha256
          ? `Your data download (reference ${String(res.sha256).slice(0, 12)}…) is ready in Documents.`
          : "Your data download is ready in Documents.",
        [{ text: "OK" }]
      );
    } catch (err: any) {
      Alert.alert("Export Error", err?.message || "Could not generate GDPR export bundle.");
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    try {
      return ukDateLabel(new Date(isoString), {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <AppIcon name="clipboard" size={24} color={colors.ink} />
        <View style={styles.bannerTextWrap}>
          <ThemedText variant="headline">Your data rights (UK GDPR)</ThemedText>
          <ThemedText variant="caption" style={styles.bannerSub}>
            You have legal control over your clinical consents and data processing choices.
          </ThemedText>
        </View>
      </View>

      {/* Consents List */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Active consent records
        </ThemedText>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText variant="headline" style={styles.cardTitle}>
              Special category health data
            </ThemedText>
            <Badge variant={healthDataConsent ? "success" : "default"} label={healthDataConsent ? "Active" : "Pending"} />
          </View>
          <ThemedText variant="caption" style={styles.cardDesc}>
            Explicit consent for Pav Dental to store, process, and clinically review your dental odontograms, X-rays, medications, and medical conditions (UK GDPR Article 9).
          </ThemedText>
          <View style={styles.metaRow}>
            <ThemedText variant="caption" style={styles.metaText}>
              Version: {healthDataConsent?.version ? `v${healthDataConsent.version}` : "—"}
            </ThemedText>
            <ThemedText variant="caption" style={styles.metaText}>
              Signed: {formatDate(healthDataConsent?.grantedAt)}
            </ThemedText>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText variant="headline" style={styles.cardTitle}>
              Clinical treatment & examination
            </ThemedText>
            <Badge variant={treatmentConsent ? "success" : "default"} label={treatmentConsent ? "Active" : "Pending"} />
          </View>
          <ThemedText variant="caption" style={styles.cardDesc}>
            Consent to receive oral examinations, emergency dental triage, telehealth triage, and mobile van care by registered GDC professionals.
          </ThemedText>
          <View style={styles.metaRow}>
            <ThemedText variant="caption" style={styles.metaText}>
              Version: {treatmentConsent?.version ? `v${treatmentConsent.version}` : "—"}
            </ThemedText>
            <ThemedText variant="caption" style={styles.metaText}>
              Signed: {formatDate(treatmentConsent?.grantedAt)}
            </ThemedText>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText variant="headline" style={styles.cardTitle}>
              Recall & preventive reminders
            </ThemedText>
            <Badge
              variant={marketingOptedIn ? "success" : "default"}
              label={marketingOptedIn ? "Opted In" : "Opted Out"}
            />
          </View>
          <ThemedText variant="caption" style={styles.cardDesc}>
            Notifications sent every 6 months to remind you when your routine dental checkup or hygiene session is due.
          </ThemedText>
          <Button
            title={
              isUpdatingMarketing
                ? "Updating..."
                : marketingOptedIn
                  ? "Withdraw Marketing & Recall Consent"
                  : "Opt In to Recall Reminders"
            }
            variant="secondary"
            size="sm"
            loading={isUpdatingMarketing}
            onPress={handleToggleMarketingConsent}
          />
        </Card>
      </View>

      {/* Consent history */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Consent history
        </ThemedText>
        <Card style={styles.card}>
          {history === null ? (
            <ThemedText variant="caption" style={styles.cardDesc}>
              Your consent history couldn't be loaded.
            </ThemedText>
          ) : history.length === 0 ? (
            <ThemedText variant="caption" style={styles.cardDesc}>
              No consents recorded yet.
            </ThemedText>
          ) : (
            history.map((entry) => (
              <View key={entry.id} style={styles.historyRow}>
                <ThemedText variant="body">
                  {consentLabel(entry.consentType)} · v{entry.version}
                </ThemedText>
                <ThemedText variant="caption" style={styles.metaText}>
                  Given {formatDate(entry.grantedAt)}
                  {entry.withdrawnAt ? ` · withdrawn ${formatDate(entry.withdrawnAt)}` : ""}
                </ThemedText>
              </View>
            ))
          )}
        </Card>
      </View>

      {/* Retention Policy */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          How long we keep records
        </ThemedText>
        <Card style={styles.card}>
          <ThemedText variant="headline">How long records are stored</ThemedText>
          <ThemedText variant="caption" style={styles.cardDesc}>
            We must keep dental records for a period after your last treatment. Our privacy notice sets out how long; the draft periods are being reviewed by our legal adviser.
          </ThemedText>
        </Card>
      </View>

      {/* Export Archive */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Right of access (SAR)
        </ThemedText>
        <Card style={styles.card}>
          <ThemedText variant="headline">Export your dental records</ThemedText>
          <ThemedText variant="caption" style={styles.cardDesc}>
            Receive an authenticated data export bundle containing your treatment plans, tooth chart history, and signed consents, securely saved in Documents.
          </ThemedText>
          <Button
            title={isExporting ? "Preparing your data..." : "Download my data"}
            variant="secondary"
            onPress={handleExportData}
            disabled={isExporting}
          />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  historyRow: {
    gap: spacing.xxs,
    paddingVertical: spacing.xs,
  },
  banner: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },

  bannerSub: {
    color: colors.secondaryLabel,
  },
  bannerTextWrap: {
    flex: 1,
    gap: 2,
  },
  card: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardDesc: {
    color: colors.secondaryLabel,
    lineHeight: 18,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: colors.label,
    flex: 1,
    paddingRight: spacing.sm,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  metaRow: {
    borderTopColor: colors.separator,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.xs,
  },
  metaText: {
    color: colors.secondaryLabel,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...type.overline,
  },
});

