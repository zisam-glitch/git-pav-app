import React, { useEffect, useState } from "react";
import { reportCaughtError } from "@/lib/caught-errors";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText, Card, Button, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authFetch } from "@/features/auth/auth-api";

const FOLLOW_UP_WORDS: Record<string, string> = {
  clinic: "A visit at the clinic.",
  van: "A visit from the van, at your home.",
  video: "Another video consultation.",
};

export default function VideoSummaryScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    async function fetchSummary() {
      if (!appointmentId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadFailed(false);
      try {
        const res = await authFetch(`/api/video/summary/${appointmentId}`);
        if (res.ok) {
          const data = await res.json();
          setSummaryData(data);
        } else {
          // Say so, instead of leaving a summary that looks empty (V33).
          setLoadFailed(true);
        }
      } catch (err) {
        reportCaughtError(err, "failed to fetch consult summary");
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [appointmentId, attempt]);

  const summary = summaryData?.summary;
  const hasNotesOrDiagnosis = !!(summary?.diagnosis || summary?.notes || summary?.treatmentPlan);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            {summaryData?.status === "completed" ? (
              <View style={styles.checkBadge}>
                <AppIcon name="checkCircle" size={20} color={colors.success} />
                <ThemedText variant="headline">Completed</ThemedText>
              </View>
            ) : null}
            <ThemedText variant="largeTitle" style={styles.title}>
              Consultation summary
            </ThemedText>
            <ThemedText variant="subhead" style={styles.subtitle}>
              {summaryData?.status === "completed" ? "Your video consultation has ended." : "Your clinician will add a summary here after your consultation."}
            </ThemedText>
          </View>

          {/* Clinician recorded summary (MC-3) */}
          <Card style={styles.card}>
            <ThemedText variant="headline" style={styles.cardHeader}>
              Clinical summary
            </ThemedText>
            {loading ? (
              <ActivityIndicator color={colors.ink} />
            ) : loadFailed ? (
              <View style={styles.summaryDetails}>
                <ThemedText variant="body" style={styles.findingText}>
                  We couldn't load your summary. Check your connection and try again.
                </ThemedText>
                <Button title="Try again" variant="secondary" size="md" onPress={() => setAttempt((n) => n + 1)} />
              </View>
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
                {summary?.followUpRecommended && summary.followUpRecommended !== "none" ? (
                  <View style={styles.summaryBlock}>
                    <ThemedText variant="subhead" style={styles.blockTitle}>
                      Follow-up advised
                    </ThemedText>
                    <ThemedText variant="body" style={styles.findingText}>
                      {FOLLOW_UP_WORDS[String(summary.followUpRecommended)] ?? "Your clinician advised a follow-up."}
                    </ThemedText>
                  </View>
                ) : null}
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

