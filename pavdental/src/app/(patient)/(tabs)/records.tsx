import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { usePullToRefresh } from "@/lib/pull-to-refresh";
import { useRouter } from "expo-router";
import { ThemedText, Card, ListRow, AppIcon, Button, type AppIconName, SegmentedControl, IconTile } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useCurrentUser } from "@/features/auth/auth-store";
import { useOdontogram, useOralHealthInsights } from "@/features/hooks/use-dental-api";

// ─── Records — clinical documents hub (routes unchanged) ──────────────────────

type RecordsTab = "vault" | "activity" | "estimates";

interface RecordLink {
  icon: AppIconName;
  title: string;
  subtitle: string;
  route: string;
  category: RecordsTab;
}

const links: RecordLink[] = [
  {
    icon: "activity",
    title: "Tooth chart",
    subtitle: "Interactive 32-tooth dental chart",
    route: "/(patient)/records/odontogram",
    category: "vault",
  },
  {
    icon: "clipboard",
    title: "Treatment plans",
    subtitle: "Review and approve digital treatment plans",
    route: "/(patient)/records/plans",
    category: "estimates",
  },
  {
    icon: "droplet",
    title: "Prescriptions & dispensing",
    subtitle: "Prescriptions from your dentist",
    route: "/(patient)/records/prescriptions",
    category: "vault",
  },
  {
    icon: "image",
    title: "Documents",
    subtitle: "Documents your dental team shares with you",
    route: "/(patient)/records/vault",
    category: "vault",
  },
  {
    icon: "creditCard",
    title: "Payment plans",
    subtitle: "How to spread the cost of treatment",
    route: "/(patient)/records/financing",
    category: "estimates",
  },
  {
    icon: "clock",
    title: "Oral health activity & insights",
    subtitle: "Weekly brushing streaks & recall timer",
    route: "/(patient)/records/insights",
    category: "activity",
  },
];

export default function PatientRecordsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RecordsTab>("vault");
  const user = useCurrentUser();
  const refresh = usePullToRefresh();
  const userId = user?.id || "";

  const { data: apiTeeth } = useOdontogram(userId);
  const { data: insightsData } = useOralHealthInsights();

  const teethArray = Array.isArray(apiTeeth) ? apiTeeth : [];
  const hasTeeth = teethArray.length > 0;
  const teethCount = hasTeeth ? String(teethArray.length) : "—";
  const activeIssues = hasTeeth
    ? String(
        teethArray.filter((t: any) =>
          Object.values(t.surfaces || {}).some((cond) => cond && cond !== "healthy")
        ).length
      )
    : "—";

  const recallDays =
    typeof insightsData?.recallDaysRemaining === "number"
      ? insightsData.recallDaysRemaining
      : null;
  const recallDisplay =
    recallDays != null ? `${Math.max(1, Math.ceil(recallDays / 30))}M` : "—";

  const displayedLinks = useMemo(() => {
    return links.filter((l) => l.category === activeTab);
  }, [activeTab]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refresh.refreshing} onRefresh={refresh.onRefresh} />}>
      <SegmentedControl
        segments={[
          { key: "vault", label: "Documents" },
          { key: "activity", label: "Activity & recall" },
          { key: "estimates", label: "Estimates" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      {/* 3-Column Metric Summary Card (Screen_337_Charts_Dashboard.png) */}
      <Card style={styles.metricsCard}>
        <View style={styles.metricColumn}>
          <ThemedText variant="largeTitle" style={styles.metricVal}>
            {teethCount}
          </ThemedText>
          <ThemedText variant="caption" style={styles.metricLabel}>
            {hasTeeth ? "Teeth tracked" : "Teeth charted"}
          </ThemedText>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricColumn}>
          <ThemedText
            variant="largeTitle"
            style={[styles.metricVal, hasTeeth && activeIssues === "0" ? { color: colors.success } : null]}
          >
            {activeIssues}
          </ThemedText>
          <ThemedText variant="caption" style={styles.metricLabel}>
            Active issues
          </ThemedText>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricColumn}>
          <ThemedText variant="largeTitle" style={styles.metricVal}>
            {recallDisplay}
          </ThemedText>
          <ThemedText variant="caption" style={styles.metricLabel}>
            Next recall
          </ThemedText>
        </View>
      </Card>

      {!hasTeeth ? (
        <Card elevation="flat" style={styles.initialCareCard}>
          <View style={styles.initialCareContent}>
            <View style={styles.initialCareIcon}>
              <AppIcon name="clipboard" size={16} color={colors.ink} />
            </View>
            <View style={styles.initialCareText}>
              <ThemedText variant="subhead" style={styles.initialCareTitle}>
                Initial dental charting pending
              </ThemedText>
              <ThemedText variant="caption" style={styles.initialCareSub}>
                Your tooth chart and recall timer will populate automatically after your first check-up.
              </ThemedText>
            </View>
          </View>
          <Button
            title="Book initial examination"
            variant="secondary"
            size="sm"
            onPress={() => router.push("/(patient)/booking/service-catalog" as never)}
            style={styles.bookExamBtn}
          />
        </Card>
      ) : null}

      {/* Summary banner */}
      <Card elevation="flat" style={styles.summaryCard}>
        <View style={styles.summaryText}>
          <ThemedText variant="headline" style={styles.summaryTitle}>
            Clinical timeline
          </ThemedText>
          <ThemedText variant="caption" style={styles.summarySub}>
            Your examinations, treatment plans and prescriptions from van, video and practice visits.
          </ThemedText>
        </View>
      </Card>

      <View style={styles.section}>
        <ThemedText variant="title" style={styles.sectionOverline}>
          {activeTab === "vault"
            ? "Vault & clinical charts"
            : activeTab === "estimates"
            ? "Estimates & finance"
            : "Activity & recall"}
        </ThemedText>
        <View>
          {displayedLinks.map((link) => (
            <ListRow
              inset="flush"
              key={link.title}
              title={link.title}
              subtitle={link.subtitle}
              left={<IconTile icon={link.icon} />}
              right={<AppIcon name="chevronRight" size={16} color={colors.tertiaryLabel} />}
              onPress={() => router.push(link.route as never)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  metricsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.systemBackground,
    borderColor: colors.separator,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  metricColumn: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  metricVal: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.label,
  },
  metricLabel: {
    color: colors.secondaryLabel,
    fontSize: 11,
    fontWeight: "600",
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: colors.separator,
  },
  section: {
    gap: spacing.xs,
  },
  sectionOverline: {
    marginBottom: spacing.xxs,
  },
  summaryCard: {
    alignItems: "center",
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  summarySub: {
    color: colors.secondaryLabel,
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  summaryTitle: {
    color: colors.label,
  },
  initialCareCard: {
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  initialCareContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  initialCareIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.separator,
    borderWidth: 1,
  },
  initialCareText: {
    flex: 1,
    gap: 2,
  },
  initialCareTitle: {
    color: colors.label,
    fontWeight: "600",
  },
  initialCareSub: {
    color: colors.secondaryLabel,
    lineHeight: 18,
  },
  bookExamBtn: {
    marginTop: spacing.xxs,
  },
});
