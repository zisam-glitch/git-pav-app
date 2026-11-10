import { buildGroupedRows } from "@/lib/list-rows";
import React from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
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

  const rows = buildGroupedRows([
    { key: "active", title: "Active", items: active },
    { key: "past", title: "Past courses", items: past },
  ]);

  return (
    <View style={styles.container}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        contentContainerStyle={styles.content}
        renderItem={({ item: row }) =>
          row.kind === "heading" ? (
            <ThemedText variant="overline">{row.title}</ThemedText>
          ) : (
            <Row rx={row.item} />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
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
});
