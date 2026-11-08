import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, Card, Badge, EmptyState, ErrorState, AppIcon, Skeleton } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { usePatientPrescriptions } from "@/features/hooks/use-dental-api";
import { useCurrentUser } from "@/features/auth/auth-store";

import {
  normalizePrescription,
  type NormalizedPrescription,
} from "@/features/records/prescription-normalize";

export { normalizePrescription };

export default function PrescriptionsScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const userId = user?.id || "";
  const { data: rawList, isLoading, isError, refetch } = usePatientPrescriptions(userId);

  const prescriptions: NormalizedPrescription[] = Array.isArray(rawList)
    ? rawList.map(normalizePrescription)
    : [];

  const active = prescriptions.filter((rx) => rx.status === "active");
  const past = prescriptions.filter((rx) => rx.status !== "active");

  const Row = ({ rx }: { rx: NormalizedPrescription }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Prescription ${rx.drugName} ${rx.strength}`}
      onPress={() =>
        router.push({
          pathname: "/(patient)/records/prescriptions/[id]" as never,
          params: { id: rx.id },
        })
      }
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
    >
      <Card style={styles.rowCard}>
        <View style={styles.rowIcon}>
          <AppIcon name="droplet" size={18} color={colors.ink} />
        </View>
        <View style={styles.rowInfo}>
          <ThemedText variant="subhead" style={styles.rowTitle}>
            {rx.drugName} {rx.strength}
          </ThemedText>
          <ThemedText variant="caption" style={styles.rowMeta}>
            {rx.dosage} · {rx.course}
          </ThemedText>
        </View>
        {rx.status === "active" ? (
          <Badge label="Active" variant="success" />
        ) : (
          <AppIcon name="chevronRight" size={15} color={colors.tertiaryLabel} />
        )}
      </Card>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton height={76} />
          <Skeleton height={76} />
        </View>
      </View>
    );
  }

  if (isError && rawList === undefined) {
    return (
      <View style={styles.container}>
        <ErrorState
          message="We couldn't load your prescriptions. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          illustration="writing"
          heading="No prescriptions"
          body="Prescriptions issued by your dentist will appear here."
          icon="droplet"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {active.length > 0 ? (
          <View style={styles.group}>
            <ThemedText variant="overline">Active</ThemedText>
            <View style={styles.stack}>
              {active.map((rx) => (
                <Row key={rx.id} rx={rx} />
              ))}
            </View>
          </View>
        ) : null}

        {past.length > 0 ? (
          <View style={styles.group}>
            <ThemedText variant="overline">Past courses</ThemedText>
            <View style={styles.stack}>
              {past.map((rx) => (
                <Row key={rx.id} rx={rx} />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  group: {
    gap: spacing.xs,
  },
  rowCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  rowIcon: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowMeta: {
    color: colors.secondaryLabel,
  },
  rowTitle: {
    color: colors.label,
  },
  stack: {
    gap: spacing.sm,
  },
});
