import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, Card, Button, AppIcon, Badge, ErrorState, Skeleton } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useLogBrushingMutation, useOralHealthInsights } from "@/features/hooks/use-dental-api";
import { currentBrushingSlot } from "@/features/records/brushing";

export default function OralHealthInsightsScreen() {
  const router = useRouter();
  const { data: insightsData, isLoading, isError, refetch } = useOralHealthInsights();
  const logBrushing = useLogBrushingMutation();
  const slot = currentBrushingSlot();

  // Every figure here comes from the API. Clinical measurements (plaque,
  // bleeding on probing, recall) are only shown when a clinician recorded them;
  // nothing is filled in with healthy-looking defaults (MC-4).
  const weeklyData: { day: string; am: boolean; pm: boolean; durationSec: number }[] =
    Array.isArray(insightsData?.weeklyBrushing)
      ? insightsData.weeklyBrushing.map((m: any) => ({
          day: m.day || m.dayLabel || "",
          am: Boolean(m.am ?? m.brushedMorning),
          pm: Boolean(m.pm ?? m.brushedEvening),
          durationSec: Number(m.durationSec) || 0,
        }))
      : [];

  const num = (...values: unknown[]): number | null =>
    (values.find((v) => typeof v === "number" && Number.isFinite(v)) as number | undefined) ?? null;
  const plaqueIndex = num(insightsData?.plaqueIndexPercent, insightsData?.summary?.plaqueIndex);
  const bleedingIndex = num(insightsData?.bleedingPercent, insightsData?.summary?.bleedingIndex);
  const adherenceRate = num(insightsData?.summary?.adherencePercent);
  const recallDays = num(insightsData?.recallDaysRemaining);
  const advice: string | null =
    typeof insightsData?.practitionerAdvice === "string" && insightsData.practitionerAdvice.trim()
      ? insightsData.practitionerAdvice.trim()
      : null;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton height={140} />
          <Skeleton height={200} />
        </View>
      </View>
    );
  }

  if (isError && insightsData === undefined) {
    return (
      <View style={styles.container}>
        <ErrorState
          message="We couldn't load your insights. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="largeTitle" style={styles.title}>
            Oral health insights
          </ThemedText>
          <ThemedText variant="subhead" style={styles.subtitle}>
            Your brushing log and the measurements your dentist records.
          </ThemedText>
        </View>

        {/* Recall Countdown Hero (Neo Financial Style) */}
        <Card style={styles.recallCard}>
          <View style={styles.recallTop}>
            <View>
              <ThemedText variant="caption" style={styles.recallSub}>Preventive recall cycle</ThemedText>
              <ThemedText variant="largeTitle" style={styles.recallDays}>
                {recallDays === null ? "Not set" : `${recallDays} days`}
              </ThemedText>
              <ThemedText variant="caption" style={styles.recallTarget}>
                {recallDays === null ? "Your dentist will set your recall at your next visit" : "Until your next recall"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.recallBottom}>
            <Button
              title="Book early"
              arrow
              variant="secondary"
              size="sm"
              onPress={() => router.push("/(patient)/booking/service-catalog" as any)}
            />
          </View>
        </Card>

        {/* Weekly AM / PM Brushing Bar Chart */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <ThemedText variant="headline">Weekly brushing adherence</ThemedText>
            {adherenceRate !== null ? <Badge label={`${adherenceRate}% Goal Met`} variant="info" /> : null}
          </View>
          <ThemedText variant="caption" style={styles.muted}>
            2 sessions daily (AM + PM, 2 mins each). Goal: 4 mins/day.
          </ThemedText>

          {weeklyData.length === 0 ? (
            <ThemedText variant="body" style={styles.muted}>
              No brushing sessions logged yet.
            </ThemedText>
          ) : null}

          <Button
            title={slot.session === "am" ? "Log this morning's brush (2 min)" : "Log this evening's brush (2 min)"}
            variant="secondary"
            size="sm"
            loading={logBrushing.isPending}
            onPress={() => logBrushing.mutate({ ...slot, durationSec: 120 })}
          />
          {logBrushing.isError ? (
            <ThemedText variant="caption" style={styles.muted} accessibilityRole="alert">
              That didn't save. Please try again.
            </ThemedText>
          ) : null}

          {/* Bar Columns */}
          <View style={styles.barsContainer}>
            {weeklyData.map((item: { day: string; am: boolean; pm: boolean; durationSec: number }) => {
              const heightPercent = Math.min(100, (item.durationSec / 240) * 100);
              const isGoalMet = item.am && item.pm;
              return (
                <View key={item.day} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${heightPercent}%` },
                        !isGoalMet && styles.barFillPartial,
                      ]}
                    />
                  </View>
                  <ThemedText variant="caption" style={styles.dayLabel}>
                    {item.day}
                  </ThemedText>
                  <View style={styles.amPmDots}>
                    <View style={[styles.dot, item.am && styles.dotActive]} />
                    <View style={[styles.dot, item.pm && styles.dotActive]} />
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, styles.dotActive]} />
              <ThemedText variant="caption" style={styles.legendText}>Completed (2 mins)</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, styles.dotMissing]} />
              <ThemedText variant="caption" style={styles.legendText}>Missed session</ThemedText>
            </View>
          </View>
        </Card>

        {/* Clinical Health Gauges */}
        <View style={styles.gaugesGrid}>
          <Card style={styles.gaugeCard}>
            <ThemedText variant="caption" style={styles.gaugeSub}>Plaque index</ThemedText>
            <ThemedText variant="largeTitle" style={styles.gaugeNum}>
              {plaqueIndex === null ? "—" : `${plaqueIndex}%`}
            </ThemedText>
            <ThemedText variant="caption" style={styles.muted}>
              {plaqueIndex === null ? "Not recorded" : "Recorded at your last check-up"}
            </ThemedText>
          </Card>

          <Card style={styles.gaugeCard}>
            <ThemedText variant="caption" style={styles.gaugeSub}>Bleeding on probe</ThemedText>
            <ThemedText variant="largeTitle" style={styles.gaugeNum}>
              {bleedingIndex === null ? "—" : `${bleedingIndex}%`}
            </ThemedText>
            <ThemedText variant="caption" style={styles.muted}>
              {bleedingIndex === null ? "Not recorded" : "Recorded at your last check-up"}
            </ThemedText>
          </Card>
        </View>

        {advice ? (
          <Card style={styles.adviceCard}>
            <View style={styles.adviceHeaderRow}>
              <AppIcon name="userCheck" size={18} color={colors.ink} />
              <ThemedText variant="headline">Advice from your dentist</ThemedText>
            </View>
            <ThemedText variant="body" style={styles.adviceBody}>
              {advice}
            </ThemedText>
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  adviceBody: {
    color: colors.label,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  adviceCard: {
    borderCurve: "continuous",
    borderColor: colors.separator,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  adviceHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  amPmDots: {
    flexDirection: "row",
    gap: 3,
    marginTop: 2,
  },
  barCol: {
    alignItems: "center",
    flex: 1,
    gap: 4,
    minWidth: 20,
  },
  barFill: {
    backgroundColor: colors.ink,
    borderRadius: radius.sm,
    width: "100%",
  },
  barFillPartial: {
    backgroundColor: colors.warning,
  },
  barTrack: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.sm,
    height: 120,
    justifyContent: "flex-end",
    overflow: "hidden",
    width: 24,
  },
  barsContainer: {
    alignItems: "flex-end",
    flexDirection: "row",
    height: 150,
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  chartCard: {
    borderCurve: "continuous",
    borderColor: colors.separator,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  chartHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartLegend: {
    borderTopColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
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
  dayLabel: {
    color: colors.secondaryLabel,
    fontSize: 11,
    fontWeight: "600",
  },
  divider: {
    backgroundColor: colors.separator,
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.xs,
  },
  dot: {
    backgroundColor: colors.separator,
    borderRadius: radius.full,
    height: 6,
    width: 6,
  },
  dotActive: {
    backgroundColor: colors.success,
  },
  dotMissing: {
    backgroundColor: colors.inkSubtle,
  },
  gaugeCard: {
    borderCurve: "continuous",
    borderColor: colors.separator,
    borderRadius: radius.xl,
    borderWidth: 1,
    flex: 1,
    gap: 2,
    padding: spacing.md,
  },
  gaugeNum: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "700",
  },
  gaugeSub: {
    color: colors.secondaryLabel,
    fontSize: 11,
    fontWeight: "700",
  },
  gaugesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  header: {
    gap: spacing.xxs,
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  legendText: {
    color: colors.secondaryLabel,
  },
  muted: {
    color: colors.secondaryLabel,
    lineHeight: 18,
  },
  recallBottom: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recallCard: {
    borderCurve: "continuous",
    borderColor: colors.separator,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  recallDays: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -1,
  },
  recallSub: {
    color: colors.secondaryLabel,
    fontSize: 11,
    fontWeight: "700",
  },
  recallTarget: {
    color: colors.secondaryLabel,
  },
  recallTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subtitle: {
    color: colors.secondaryLabel,
    lineHeight: 20,
  },
  title: {
    color: colors.label,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
});
