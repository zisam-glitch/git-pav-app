import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, Card, Button, Badge, EmptyState, ErrorState, Skeleton, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useTreatmentPlans } from "@/features/hooks/use-dental-api";
import { useCurrentUser } from "@/features/auth/auth-store";
import { formatGbp } from "@/features/booking/booking-api";

export default function TreatmentPlansScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const userId = user?.id || "";
  const { data: apiPlans, isLoading, isError, refetch } = useTreatmentPlans(userId);

  const plans = apiPlans ?? [];

  const handleAcceptPlan = (planId: string) => {
    router.push({
      pathname: "/(patient)/records/plans/[id]" as never,
      params: { id: planId, signSheet: "true" },
    });
  };

  if (isLoading && !apiPlans) {
    return (
      <View style={[styles.container, styles.centeredState]}>
        <Skeleton height={120} borderRadius={16} />
        <Skeleton height={80} borderRadius={16} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.centeredState]}>
        <ErrorState
          message="Could not load treatment plans. Please try again."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  if (plans.length === 0) {
    return (
      <View style={[styles.container, styles.centeredState]}>
        <EmptyState
          heading="No treatment plans"
          body="Plans prescribed by your clinician will appear here."
          icon="clipboard"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="largeTitle" style={styles.title}>
            Treatment plans
          </ThemedText>
          <ThemedText variant="subhead" style={styles.subtitle}>
            {plans.length} plan{plans.length !== 1 ? "s" : ""} prescribed by your clinician.
          </ThemedText>
        </View>

        {plans.map((plan: any) => {
          const isAccepted =
            plan.status === "completed" ||
            plan.status === "accepted" ||
            Boolean(plan.patientSignedAt);
          const clinicianName = plan.clinician?.fullName
            ? `${plan.clinician.fullName} (${plan.clinician.roleTitle || ""})`
            : "Your Clinician";
          const createdAt = new Date(plan.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const totalCostPence = plan.totalCostPence || 0;

          return (
            <View key={plan.id}>
              {/* Plan Header Card */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open treatment plan ${plan.title}`}
                onPress={() => router.push({ pathname: "/(patient)/records/plans/[id]" as never, params: { id: plan.id } })}
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
              <Card style={styles.card}>
                <View style={styles.rowBetween}>
                  <ThemedText variant="headline" style={styles.planTitle}>
                    {plan.title}
                  </ThemedText>
                  <Badge
                    label={isAccepted ? "Read" : "Not read yet"}
                    variant={isAccepted ? "success" : "warning"}
                  />
                </View>
                <ThemedText variant="caption" style={styles.legalNotice}>
                  Prescribed by {clinicianName} on {createdAt}.
                </ThemedText>
                <ThemedText variant="caption" style={styles.legalNotice}>
                  Itemised estimate of the treatment your dentist recommends. Your dentist will go through it with you before treatment starts.
                </ThemedText>
              </Card>
              </Pressable>

              {/* Itemised Procedures List */}
              <View style={styles.section}>
                <ThemedText variant="headline">Procedures included</ThemedText>
                {(plan.items || []).map((item: any) => (
                  <Card key={item.id} style={styles.itemCard}>
                    <View style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <ThemedText variant="headline" style={styles.itemName}>
                          {item.description}
                        </ThemedText>
                        <ThemedText variant="caption" style={styles.itemCode}>
                          Clinical code: #{item.code}
                          {item.toothNumber ? ` · Tooth #${item.toothNumber}` : ""}
                        </ThemedText>
                      </View>
                      <ThemedText variant="mono" style={styles.itemCost}>
                        {formatGbp(item.costPence || 0)}
                      </ThemedText>
                    </View>
                  </Card>
                ))}
              </View>

              {/* Total & Finance */}
              <Card style={styles.totalCard}>
                <View style={styles.rowBetween}>
                  <ThemedText variant="headline">Total treatment cost</ThemedText>
                  <ThemedText variant="title" style={styles.totalPrice}>
                    {formatGbp(totalCostPence)}
                  </ThemedText>
                </View>
                {totalCostPence > 0 && (
                  <Button
                    title="Ways to pay"
                    variant="ghost"
                    size="sm"
                    onPress={() => router.push("/(patient)/records/financing" as never)}
                  />
                )}
              </Card>

              {isAccepted ? (
                <View style={styles.signatureBox}>
                  <AppIcon name="checkCircle" size={16} color={colors.success} />
                  <ThemedText variant="caption" style={styles.sigText}>
                    You've confirmed you read this plan.
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.footer}>
                  <Button
                    title="I've read this plan"
                    size="lg"
                    onPress={() => handleAcceptPlan(plan.id)}
                  />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.systemBackground,
    gap: spacing.xs,
    padding: spacing.md,
  },
  centeredState: {
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.xl,
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
  header: {
    gap: spacing.xxs,
  },
  itemCard: {
    backgroundColor: colors.systemBackground,
    padding: spacing.md,
  },
  itemCode: {
    color: colors.secondaryLabel,
  },
  itemCost: {
    color: colors.ink,
    fontWeight: "700",
  },
  itemInfo: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.sm,
  },
  itemName: {
    color: colors.label,
  },
  itemRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legalNotice: {
    color: colors.secondaryLabel,
    lineHeight: 16,
    marginTop: 2,
  },
  planTitle: {
    color: colors.label,
    flex: 1,
    paddingRight: spacing.xs,
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  sigText: {
    color: colors.success,
    fontWeight: "600",
  },
  signatureBox: {
    alignItems: "center",
    backgroundColor: colors.successSubtle,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.xxs,
    justifyContent: "center",
    padding: spacing.sm,
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  title: {
    color: colors.label,
  },
  totalCard: {
    backgroundColor: colors.systemBackground,
    gap: spacing.sm,
    padding: spacing.md,
  },
  totalPrice: {
    color: colors.ink,
  },
});
