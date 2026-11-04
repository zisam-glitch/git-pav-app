import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText, Card, Button, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authFetch } from "@/features/auth/auth-api";

export default function VideoSummaryScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      if (!appointmentId) {
        setLoading(false);
        return;
      }
      try {
        const res = await authFetch(`/api/video/summary/${appointmentId}`);
        if (res.ok) {
          const data = await res.json();
          setSummaryData(data);
        }
      } catch (err) {
        console.error("Failed to fetch consult summary:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [appointmentId]);

  const summary = summaryData?.summary;
  const hasNotesOrDiagnosis = !!(summary?.diagnosis || summary?.notes || summary?.treatmentPlan);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.checkBadge}>
              <AppIcon name="checkCircle" size={20} color={colors.success} />
              <ThemedText variant="headline">Completed</ThemedText>
            </View>
            <ThemedText variant="largeTitle" style={styles.title}>
              Consultation summary
            </ThemedText>
            <ThemedText variant="subhead" style={styles.subtitle}>
              Your video consultation has ended.
            </ThemedText>
          </View>

          {/* Clinician recorded summary (MC-3) */}
          <Card style={styles.card}>
            <ThemedText variant="headline" style={styles.cardHeader}>
              Clinical summary
            </ThemedText>
            {loading ? (
              <ActivityIndicator color={colors.ink} />
            ) : hasNotesOrDiagnosis ? (
              <View style={styles.summaryDetails}>
                {summary?.diagnosis && (
                  <View style={styles.summaryBlock}>
                    <ThemedText variant="subhead" style={styles.blockTitle}>
                      Diagnosis
                    </ThemedText>
                    <ThemedText variant="body" style={styles.findingText}>
                      {summary.diagnosis}
                    </ThemedText>
                  </View>
                )}
                {summary?.notes && (
                  <View style={styles.summaryBlock}>
                    <ThemedText variant="subhead" style={styles.blockTitle}>
                      Clinician Notes
                    </ThemedText>
                    <ThemedText variant="body" style={styles.findingText}>
                      {summary.notes}
                    </ThemedText>
                  </View>
                )}
                {summary?.treatmentPlan && (
                  <View style={styles.summaryBlock}>
                    <ThemedText variant="subhead" style={styles.blockTitle}>
                      Treatment Plan
                    </ThemedText>
                    <ThemedText variant="body" style={styles.findingText}>
                      {summary.treatmentPlan}
                    </ThemedText>
                  </View>
                )}
              </View>
            ) : (
              <ThemedText variant="body" style={styles.findingText}>
                Anything your clinician records from this consultation, including any prescription, will appear in your records.
              </ThemedText>
            )}
            <Button
              title="View prescriptions"
              variant="secondary"
              size="md"
              onPress={() => router.push("/(patient)/records/prescriptions" as any)}
            />
          </Card>

          <Card style={styles.actionCard}>
            <ThemedText variant="headline" style={styles.actionTitle}>
              Need a follow-up visit?
            </ThemedText>
            <ThemedText variant="subhead" style={styles.actionBody}>
              If your clinician advised an in-person visit, you can book one here.
            </ThemedText>
            <View style={styles.ctaRow}>
              <Button
                title="Book van to my home"
                size="md"
                onPress={() => router.replace("/(patient)/booking/service-catalog?channel=van" as any)}
              />
              <Button
                title="Book clinic visit"
                variant="secondary"
                size="md"
                onPress={() => router.replace("/(patient)/booking/service-catalog" as any)}
              />
            </View>
          </Card>
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.footer}>
          <Button
            title="Return to home dashboard"
            variant="ghost"
            size="lg"
            onPress={() => router.replace("/(patient)/(tabs)/home")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionBody: {
    color: colors.label,
    lineHeight: 20,
  },
  actionCard: {
    backgroundColor: colors.inkSubtle,
    borderColor: colors.ink,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  actionTitle: {
    color: colors.ink,
  },
  card: {
    backgroundColor: colors.systemBackground,
    gap: spacing.xs,
    padding: spacing.md,
  },
  cardHeader: {
    color: colors.label,
  },
  checkBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
    alignSelf: "flex-start",
    backgroundColor: colors.successSubtle,
    borderRadius: radius.sm,
    marginBottom: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  ctaRow: {
    flexDirection: "column",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  findingText: {
    color: colors.secondaryLabel,
    lineHeight: 22,
  },
  summaryDetails: {
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  summaryBlock: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    gap: 4,
    padding: spacing.sm,
  },
  blockTitle: {
    color: colors.label,
    fontWeight: "600",
  },
  footer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  header: {
    gap: spacing.xxs,
    marginTop: spacing.sm,
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  title: {
    color: colors.label,
  },
});

