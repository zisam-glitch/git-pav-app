import React, { useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ThemedText, Card, Button, ErrorState } from "@/components";
import { colors, spacing } from "@/theme";
import { authFetch } from "@/features/auth/auth-api";
import { fetchCurrentShift } from "@/features/van/van-api";
import { VanServiceRequest } from "@/features/van/van-types";

// The stop (patient, address, procedure) comes from the operator's live shift
// queue, never from defaults (MC-2). Operators have no clinical-record access,
// so this screen shows no clinical flags; the clinician sees those.
export default function OperatorCheckInScreen() {
  const router = useRouter();
  const { stopId } = useLocalSearchParams<{ stopId?: string }>();

  const shiftQuery = useQuery({
    queryKey: ["operator-shift"],
    queryFn: fetchCurrentShift,
    enabled: !!stopId,
  });

  const [vanParked, setVanParked] = useState(false);
  const [patientBoarded, setPatientBoarded] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  if (!stopId) {
    return (
      <View style={styles.centered}>
        <ErrorState illustration="notFound" message="Open check-in from a stop on your route. No stop is selected." />
      </View>
    );
  }
  if (shiftQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator accessibilityLabel="Loading stop" />
      </View>
    );
  }
  const stop = (shiftQuery.data?.queue as VanServiceRequest[] | undefined)?.find((s) => s.id === stopId);
  if (shiftQuery.isError || !stop) {
    return (
      <View style={styles.centered}>
        <ErrorState
          message="This stop isn't on your current shift, so it can't be checked in."
          onRetry={() => shiftQuery.refetch()}
        />
      </View>
    );
  }

  const patientName = [stop.patient?.firstName, stop.patient?.lastName].filter(Boolean).join(" ") || "Patient";
  const address =
    [stop.accessDetails?.addressLine1, stop.accessDetails?.postcode].filter(Boolean).join(", ") || "Address not recorded";
  const procedure = stop.service?.name ?? "Procedure not recorded";

  const handleStartTreatment = async () => {
    setIsCheckingIn(true);
    try {
      const res = await authFetch(`/api/van/stops/${encodeURIComponent(stop.id)}/check-in`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Check-in failed");
      }
      router.push({
        pathname: "/(operator)/offline-capture" as any,
        params: { stopId: stop.id, patientName, procedure },
      });
    } catch (err: any) {
      Alert.alert("Check-in failed", err?.message || "Check-in failed");
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="largeTitle" style={styles.title}>
            Arrival & patient boarding
          </ThemedText>
          <ThemedText variant="subhead" style={styles.subtitle}>
            {address} · {patientName} · {procedure}
          </ThemedText>
        </View>

        {/* Access Checklist */}
        <Card style={styles.card}>
          <ThemedText variant="headline" style={styles.cardTitle}>
            On-site operational checklist
          </ThemedText>

          <View style={styles.checkItem}>
            <View style={styles.checkInfo}>
              <ThemedText variant="body">1. Vehicle safely positioned</ThemedText>
              <ThemedText variant="caption" style={styles.sub}>
                Handbrake engaged, levelling stabilisers deployed.
              </ThemedText>
            </View>
            <Button
              title={vanParked ? "Secured" : "Confirm"}
              size="sm"
              variant={vanParked ? "secondary" : "primary"}
              onPress={() => setVanParked(true)}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.checkItem}>
            <View style={styles.checkInfo}>
              <ThemedText variant="body">2. Patient boarded in surgery</ThemedText>
              <ThemedText variant="caption" style={styles.sub}>
                Patient welcomed inside surgery bay, seated in dental chair.
              </ThemedText>
            </View>
            <Button
              title={patientBoarded ? "Seated" : "Confirm"}
              size="sm"
              variant={patientBoarded ? "secondary" : "primary"}
              onPress={() => setPatientBoarded(true)}
            />
          </View>
        </Card>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Check in and start treatment"
          size="lg"
          loading={isCheckingIn}
          disabled={!vanParked || !patientBoarded || isCheckingIn}
          onPress={handleStartTreatment}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.systemBackground,
    gap: spacing.sm,
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.label,
  },
  centered: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.md,
  },
  checkInfo: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.sm,
  },
  checkItem: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xxs,
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
  separator: {
    backgroundColor: colors.separator,
    height: StyleSheet.hairlineWidth,
  },
  sub: {
    color: colors.secondaryLabel,
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  title: {
    color: colors.label,
  },
});

