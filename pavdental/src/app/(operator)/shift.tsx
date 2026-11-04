import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Switch, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemedText, Card, Badge, Button, ErrorState, Skeleton } from "@/components";
import { colors, spacing } from "@/theme";
import {
  fetchCurrentShift,
  startShift,
  endShift,
  pauseShift,
  resumeShift,
} from "@/features/van/van-api";
import { useOperatorLocation } from "@/features/van/use-operator-location";
import { toLabel } from "@/lib/text";

export default function OperatorShiftScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [gpsActive, setGpsActive] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["operator-shift"],
    queryFn: fetchCurrentShift,
    refetchInterval: 10000,
  });

  const shift = data?.shift;
  const van = data?.van;
  const queue = data?.queue ?? [];
  const incoming = data?.incoming ?? [];
  const isOnline = shift?.status === "online";
  const isPaused = shift?.status === "paused";
  const isOnShift = isOnline || isPaused;

  // Real device GPS: watches position while on shift and pings the backend,
  // so patient-side ETAs and live tracking use the van's true location.
  // (Replaces the earlier mock drift loop.)
  const {
    fix,
    error: gpsError,
    gpsActive: gpsHookActive,
  } = useOperatorLocation({ enabled: isOnShift });

  // Keep the existing state flag in sync with the hook (existing UI reads it).
  useEffect(() => {
    setGpsActive(gpsHookActive);
  }, [gpsHookActive]);

  const startMutation = useMutation({
    mutationFn: () => startShift(fix ?? { lat: 51.5074, lng: -0.1278 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-shift"] });
      Alert.alert("Shift Started", "Your van is now online and accepting requests.");
    },
    onError: (err: any) => {
      Alert.alert("Could Not Start Shift", err.message || "Failed to start shift");
    },
  });

  const endMutation = useMutation({
    mutationFn: endShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-shift"] });
      Alert.alert("Shift Ended", "Your van is now offline.");
    },
    onError: (err: any) => {
      Alert.alert("Cannot End Shift", err.message || "Failed to end shift");
    },
  });

  const pauseMutation = useMutation({
    mutationFn: pauseShift,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["operator-shift"] }),
  });

  const resumeMutation = useMutation({
    mutationFn: resumeShift,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["operator-shift"] }),
  });

  const handleToggleShift = (value: boolean) => {
    if (value) {
      startMutation.mutate();
    } else {
      if (queue.length > 0) {
        Alert.alert(
          "Open Stops in Queue",
          `You have ${queue.length} stop(s) in progress. Complete or cancel them before ending your shift.`,
          [{ text: "OK" }]
        );
        return;
      }
      Alert.alert(
        "End Shift",
        "Are you sure you want to end your shift and take the van offline?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "End Shift", style: "destructive", onPress: () => endMutation.mutate() },
        ]
      );
    }
  };

  const getStatusBadge = () => {
    if (isOnline) return <Badge label="Online · accepting" variant="success" />;
    if (isPaused) return <Badge label="Paused · not accepting" variant="warning" />;
    return <Badge label="Offline" variant="default" />;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton height={120} />
          <Skeleton height={76} />
        </View>
      </View>
    );
  }

  if (isError && data === undefined) {
    return (
      <View style={styles.container}>
        <ErrorState
          message="We couldn't load your shift. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Shift Status Header */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusTextCol}>
              <ThemedText variant="largeTitle" style={styles.vanTitle}>
                {van?.name ?? "Van dispatch"}
              </ThemedText>
              {van?.registrationPlate && (
                <ThemedText variant="caption" style={styles.plate}>
                  {van.registrationPlate}
                </ThemedText>
              )}
            </View>
            <View style={styles.switchCol}>
              <ThemedText variant="caption" style={styles.switchLabel}>
                On shift
              </ThemedText>
              <Switch
              value={isOnShift}
              onValueChange={handleToggleShift}
              disabled={startMutation.isPending || endMutation.isPending}
              trackColor={{ false: colors.inkSubtle, true: colors.successFill }}
              accessibilityRole="switch"
              accessibilityLabel="On shift"
            />
            </View>
          </View>
          <View style={styles.badgeRow}>
            {getStatusBadge()}
            {gpsActive && <Badge label="GPS active" variant="info" />}
          </View>
          {gpsError ? (
            <ThemedText variant="caption" style={styles.gpsWarning}>
              {gpsError}
            </ThemedText>
          ) : null}
        </Card>

        {/* Pause / Resume Controls (only when on shift) */}
        {isOnShift && (
          <View style={styles.controlRow}>
            {isOnline ? (
              <Button
                title="Pause new requests (busy)"
                variant="secondary"
                size="sm"
                loading={pauseMutation.isPending}
                onPress={() => pauseMutation.mutate()}
              />
            ) : (
              <Button
                title="Resume accepting requests"
                variant="primary"
                size="sm"
                loading={resumeMutation.isPending}
                onPress={() => resumeMutation.mutate()}
              />
            )}
          </View>
        )}

        {/* Incoming Requests Banner */}
        {incoming.length > 0 && (
          <Card style={styles.incomingBanner}>
            <View style={styles.incomingRow}>
              <ThemedText variant="headline" style={styles.incomingTitle}>
                {incoming.length} New Request{incoming.length > 1 ? "s" : ""}
              </ThemedText>
              <Button
                title="Review"
              arrow
                size="sm"
                onPress={() => router.push("/(operator)/incoming" as any)}
              />
            </View>
          </Card>
        )}

        {/* Live Queue Summary */}
        <View style={styles.sectionHeader}>
          <ThemedText variant="headline">
            Live queue ({queue.length} stop{queue.length !== 1 ? "s" : ""})
          </ThemedText>
          {queue.length > 0 && (
            <Button
              title="Full queue"
              arrow
              variant="ghost"
              size="sm"
              onPress={() => router.push("/(operator)/route" as any)}
            />
          )}
        </View>

        {queue.length === 0 ? (
          <Card style={styles.emptyCard}>
            <ThemedText variant="headline" style={styles.emptyTitle}>
              {isOnShift ? "Queue is empty" : "Shift is offline"}
            </ThemedText>
            <ThemedText variant="caption" style={styles.emptyBody}>
              {isOnShift
                ? "Waiting for incoming patient requests in your coverage area. Keep the app open."
                : "Toggle the switch above to start your shift and put this van online."}
            </ThemedText>
          </Card>
        ) : (
          queue.slice(0, 3).map((stop, idx) => (
            <Card key={stop.id} style={styles.stopCard}>
              <View style={styles.stopTopRow}>
                <Badge label={`STOP #${idx + 1}`} variant="info" />
                <ThemedText variant="caption" style={styles.phaseLabel}>
                  {toLabel(stop.phase)}
                </ThemedText>
              </View>
              <ThemedText variant="headline">
                {stop.patient?.firstName} {stop.patient?.lastName}
              </ThemedText>
              <ThemedText variant="caption" style={styles.address}>
                {stop.accessDetails?.addressLine1}, {stop.accessDetails?.postcode}
              </ThemedText>
              <ThemedText variant="caption" style={styles.service}>
                {stop.service?.name}
              </ThemedText>
            </Card>
          ))
        )}

        {/* Quick Navigation Links */}
        <View style={styles.quickNav}>
          <Button
            title="View live queue route"
              arrow
            variant="secondary"
            onPress={() => router.push("/(operator)/route" as any)}
          />
          {incoming.length > 0 && (
            <Button
              title={`View ${incoming.length} incoming request${incoming.length === 1 ? "" : "s"}`}
              arrow
              onPress={() => router.push("/(operator)/incoming" as any)}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  switchCol: {
    alignItems: "center",
    gap: spacing.xxs,
  },
  switchLabel: {
    color: colors.secondaryLabel,
  },
  address: {
    color: colors.secondaryLabel,
  },
  gpsWarning: {
    color: colors.warning,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
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
  controlRow: {
    flexDirection: "row",
  },
  emptyBody: {
    color: colors.secondaryLabel,
    textAlign: "center",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    gap: spacing.xs,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.label,
  },
  incomingBanner: {
    backgroundColor: colors.inkSubtle,
    borderColor: colors.ink,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  incomingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  incomingTitle: {
    color: colors.ink,
  },
  phaseLabel: {
    color: colors.ink,
    fontWeight: "600",
  },
  plate: {
    color: colors.secondaryLabel,
  },
  quickNav: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  service: {
    color: colors.ink,
    fontWeight: "600",
  },
  statusCard: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusTextCol: {
    gap: 2,
  },
  stopCard: {
    backgroundColor: colors.systemBackground,
    gap: spacing.xs,
    padding: spacing.md,
  },
  stopTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  vanTitle: {
    color: colors.label,
  },
});
