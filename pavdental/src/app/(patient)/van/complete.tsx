import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ThemedText, Card, Button, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { fetchVanRequest, fetchActiveVanRequest } from "@/features/van/van-api";
import { formatGbp } from "@/lib/money";

export default function VanCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ requestId?: string }>();

  const { data: request } = useQuery({
    queryKey: ["van-request-complete", params.requestId],
    queryFn: () =>
      params.requestId
        ? fetchVanRequest(params.requestId)
        : fetchActiveVanRequest(),
  });

  const serviceName = request?.service?.name || "Van visit";
  const priceLabel =
    request?.service?.pricePence != null
      ? formatGbp(request.service.pricePence)
      : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.centerHeader}>
            <View style={styles.checkCircle}>
              <AppIcon name="checkCircle" size={36} color={colors.success} />
            </View>
            <ThemedText variant="largeTitle" style={styles.title}>
              Van visit complete!
            </ThemedText>
            <ThemedText variant="subhead" style={styles.subtitle}>
              Thank you for choosing Pav Dental. Your van visit has finished.
            </ThemedText>
          </View>

          {/* What the visit was booked for. What was actually done is in the clinician's notes. */}
          <Card style={styles.card}>
            <ThemedText variant="headline" style={styles.cardTitle}>
              Your visit
            </ThemedText>
            <View style={styles.treatmentRow}>
              <AppIcon name="check" size={15} color={colors.success} />
              <ThemedText variant="body" style={styles.treatmentName}>
                {serviceName}
              </ThemedText>
              {priceLabel ? (
                <ThemedText variant="caption" style={styles.okTag}>
                  {priceLabel}
                </ThemedText>
              ) : null}
            </View>
          </Card>

          <Card style={styles.card}>
            <ThemedText variant="headline" style={styles.cardTitle}>
              Post-care & records
            </ThemedText>
            <ThemedText variant="caption" style={styles.sub}>
              Your clinician's notes from today will appear in your Records tab once they've been written up.
            </ThemedText>
          </Card>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="View updated dental records"
            size="lg"
            onPress={() => router.replace("/(patient)/(tabs)/records")}
          />
          <Button
            title="Back to home"
            variant="ghost"
            size="md"
            onPress={() => router.replace("/(patient)/(tabs)/home")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.systemBackground,
    gap: spacing.xs,
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.label,
    marginBottom: spacing.xxs,
  },
  centerHeader: {
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  checkCircle: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 80,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 80,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  footer: {
    backgroundColor: colors.background,
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  okTag: {
    color: colors.success,
    fontWeight: "700",
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  sub: {
    color: colors.secondaryLabel,
    lineHeight: 18,
  },
  subtitle: {
    color: colors.secondaryLabel,
    lineHeight: 20,
    paddingHorizontal: spacing.gutter,
    textAlign: "center",
  },
  title: {
    color: colors.label,
    textAlign: "center",
  },
  treatmentRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingVertical: 2,
  },
  treatmentName: {
    flex: 1,
  },
});

