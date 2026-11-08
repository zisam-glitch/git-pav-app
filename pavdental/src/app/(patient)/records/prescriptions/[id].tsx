import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Linking, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText, Card, Badge, Button, AppIcon, EmptyState, ErrorState, Skeleton } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { usePatientPrescriptions } from "@/features/hooks/use-dental-api";
import { useCurrentUser } from "@/features/auth/auth-store";
import { apiUrl, authFetch } from "@/features/auth/auth-api";
import { normalizePrescription } from "../prescriptions";
import { PRACTICE_CONFIG } from "@/config/practice";

export default function PrescriptionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useCurrentUser();
  const userId = user?.id || "";
  const { data: rawList, isLoading, isError, refetch } = usePatientPrescriptions(userId);
  const [openingPdf, setOpeningPdf] = useState(false);

  // The PDF opens in the phone's browser through a link that works for five
  // minutes, so it can be printed or shared with a pharmacy.
  const openPdf = async (prescriptionId: string) => {
    setOpeningPdf(true);
    try {
      const res = await authFetch(`/api/prescriptions/${prescriptionId}/pdf-link`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Couldn't open the prescription");
      await Linking.openURL(apiUrl(body.path));
    } catch (err: any) {
      Alert.alert("Couldn't open the prescription", err?.message || "Please try again.");
    } finally {
      setOpeningPdf(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton height={96} />
          <Skeleton height={140} />
        </View>
      </View>
    );
  }

  if (isError && rawList === undefined) {
    return (
      <View style={styles.container}>
        <ErrorState
          message="We couldn't load this prescription. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const prescriptions = Array.isArray(rawList) ? rawList.map(normalizePrescription) : [];
  // Never show a different prescription than the one asked for.
  const rx = prescriptions.find((p) => p.id === id);

  if (!rx) {
    return (
      <View style={styles.container}>
        <EmptyState
          illustration="notFound"
          heading="Prescription not found"
          body="This prescription may have been removed."
          actionLabel="Back to prescriptions"
          onAction={() => router.back()}
          icon="droplet"
        />
      </View>
    );
  }

  const issued = rx.issuedIso
    ? new Date(rx.issuedIso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "date not recorded";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerIcon}>
              <AppIcon name="droplet" size={22} color={colors.onInk} />
            </View>
            <View style={styles.headerInfo}>
              <ThemedText variant="title">
                {rx.drugName} {rx.strength}
              </ThemedText>
              <ThemedText variant="caption" style={styles.muted}>
                {rx.form ? `${rx.form} · ` : ""}issued {issued}
              </ThemedText>
            </View>
            <Badge
              label={rx.status === "active" ? "Active" : "Completed"}
              variant={rx.status === "active" ? "success" : "default"}
            />
          </View>
        </Card>

        {/* Dosage card */}
        <Card style={styles.card}>
          <ThemedText variant="overline">How to take it</ThemedText>
          <View style={styles.detailRow}>
            <ThemedText variant="subhead" style={styles.detailLabel}>
              Dose
            </ThemedText>
            <ThemedText variant="subhead" style={styles.detailValue}>
              {rx.dosage}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText variant="body" style={styles.detailLabel}>
              Course
            </ThemedText>
            <ThemedText variant="body" style={styles.detailValue}>
              {rx.course}
            </ThemedText>
          </View>
          {rx.reference ? (
            <View style={styles.detailRow}>
              <ThemedText variant="caption" style={styles.detailLabel}>
                Reference
              </ThemedText>
              <ThemedText variant="mono" style={styles.detailValue}>
                {rx.reference}
              </ThemedText>
            </View>
          ) : null}
          {rx.notes ? (
            <View style={styles.notesBox}>
              <ThemedText variant="caption" style={styles.notesText}>
                {rx.notes}
              </ThemedText>
            </View>
          ) : null}
        </Card>

        {/* Pharmacy + prescriber */}
        <Card style={styles.card}>
          <View style={styles.pharmRow}>
            <AppIcon name="mapPin" size={15} color={colors.secondaryLabel} />
            <View style={styles.pharmInfo}>
              <ThemedText variant="subhead" style={styles.pharmName}>
                {rx.pharmacy}
              </ThemedText>
              <ThemedText variant="caption" style={styles.muted}>
                Prescribed by {rx.prescriber}
              </ThemedText>
            </View>
          </View>

          {rx.status === "active" ? (
            rx.refillsRemaining > 0 ? (
              <View style={styles.refillBox}>
                <AppIcon name="refresh" size={15} color={colors.success} />
                <ThemedText variant="caption" style={styles.refillText}>
                  {rx.refillsRemaining} refill{rx.refillsRemaining !== 1 ? "s" : ""} remaining — request from the practice.
                </ThemedText>
              </View>
            ) : (
              <View style={styles.refillBoxDone}>
                <ThemedText variant="caption" style={styles.refillTextDone}>
                  Course in progress — contact the practice for a repeat.
                </ThemedText>
              </View>
            )
          ) : null}
        </Card>

        {rx.hasPdf ? (
          <Button
            title={openingPdf ? "Opening…" : "Open prescription PDF"}
            size="lg"
            loading={openingPdf}
            accessibilityLabel="Open your prescription PDF"
            onPress={() => openPdf(rx.id)}
          />
        ) : null}
        {rx.hasPdf ? (
          <ThemedText variant="caption" style={styles.muted}>
            This copy is for your records. To collect your medicine, take the paper copy your dentist signed to the pharmacy.
          </ThemedText>
        ) : null}

        <Button
          title={`Call the practice (${PRACTICE_CONFIG.phone})`}
          variant="secondary"
          size="lg"
          accessibilityLabel="Call Pav Dental practice"
          onPress={() => Linking.openURL(PRACTICE_CONFIG.telUrl).catch(() => {})}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  detailLabel: {
    color: colors.secondaryLabel,
    width: 70,
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingVertical: 2,
  },
  detailValue: {
    color: colors.label,
    flex: 1,
  },
  headerCard: {
    padding: spacing.md,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: colors.ink,
    borderRadius: radius.full,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  muted: {
    color: colors.secondaryLabel,
  },
  notesBox: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  notesText: {
    color: colors.label,
    lineHeight: 17,
  },
  pharmInfo: {
    flex: 1,
    gap: 2,
  },
  pharmName: {
    color: colors.label,
  },
  pharmRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  refillBox: {
    alignItems: "center",
    backgroundColor: colors.successSubtle,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.xxs,
    padding: spacing.sm,
  },
  refillBoxDone: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  refillText: {
    color: colors.success,
    flex: 1,
    fontWeight: "600",
  },
  refillTextDone: {
    color: colors.secondaryLabel,
  },
});
