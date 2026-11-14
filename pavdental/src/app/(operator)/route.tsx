import React from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemedText, Card, Badge, Button, ErrorState, Skeleton, IconButton, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { fetchCurrentShift, updatePhase, optimizeRoute, reorderQueue } from "@/features/van/van-api";
import { VanServiceRequest, VanStopPhase } from "@/features/van/van-types";
import { openDrivingDirections } from "@/features/van/nav-links";
import { useOperatorLocation } from "@/features/van/use-operator-location";
import { useAuthStore } from "@/features/auth/auth-store";
import { toLabel } from "@/lib/text";

export default function OperatorRouteScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["operator-shift"],
    queryFn: fetchCurrentShift,
    refetchInterval: 10000,
  });

  const shift = data?.shift;
  const van = data?.van;
  const queue: VanServiceRequest[] = data?.queue ?? [];

  // Real device GPS: keeps the backend's live position current (patient ETAs)
  // and origin-anchors turn-by-turn links. Falls back to the van's last
  // reported position when the device has no fix yet.
  const isOnShift = shift?.status === "online" || shift?.status === "paused";
  const { fix, error: gpsError, gpsActive } = useOperatorLocation({ enabled: isOnShift });

  const handleNavigate = (stop: VanServiceRequest, patientName: string) => {
    const destination = {
      lat: stop.patientLat,
      lng: stop.patientLng,
    };
    const label = `${patientName} — ${stop.accessDetails?.addressLine1 ?? "stop"}`;
    // Origin: live device fix if available, else the van's last reported fix.
    const origin =
      fix ?? (shift?.lastLat != null && shift?.lastLng != null
        ? { lat: shift.lastLat, lng: shift.lastLng }
        : undefined);

    openDrivingDirections(destination, label, origin).catch((err: any) => {
      Alert.alert("Navigation Failed", err?.message || "Could not open maps.");
    });
  };

  const phaseMutation = useMutation({
    mutationFn: ({ id, phase }: { id: string; phase: VanStopPhase | "no_show" }) =>
      updatePhase(id, phase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-shift"] });
    },
    onError: (err: any) => {
      Alert.alert("Phase Update Failed", err.message || "Could not update stop phase");
    },
  });

  // Server-side minimum-driving-time ordering (routing matrix). In-progress
  // stops are pinned server-side; only queued stops are sequenced.
  const optimizeMutation = useMutation({
    mutationFn: optimizeRoute,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["operator-shift"] });
      Alert.alert(
        result.blocked ? "Order kept" : result.reordered > 0 ? "Route Optimized" : "Already Optimal",
        result.message
      );
    },
    onError: (err: any) => {
      Alert.alert("Optimization Failed", err.message || "Could not optimize the route");
    },
  });

  // Manual reorder: move a queued stop up/down. Only queued (not yet
  // started) stops are movable — in-progress stops are pinned.
  const reorderMutation = useMutation({
    mutationFn: reorderQueue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-shift"] });
    },
    onError: (err: any) => {
      Alert.alert("Reorder Failed", err.message || "Could not reorder the queue");
      queryClient.invalidateQueries({ queryKey: ["operator-shift"] });
    },
  });

  const moveStop = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= queue.length) return;
    // Both positions must hold movable (queued-phase) stops — the server
    // enforces this too; the check keeps the buttons honest in the UI.
    if (queue[index].phase !== "queued" || queue[target].phase !== "queued") return;

    // The server validates the payload as a permutation of the QUEUED stops
    // only (in-progress stops are pinned server-side), so the payload must
    // contain just the queued subset — sending in-progress ids 409s.
    const queued = queue.filter((s) => s.phase === "queued");
    const ids = queued.map((s) => s.id);
    const from = ids.indexOf(queue[index].id);
    const to = ids.indexOf(queue[target].id);
    [ids[from], ids[to]] = [ids[to], ids[from]];
    reorderMutation.mutate(ids);
  };

  const getPhaseBadge = (phase: VanStopPhase) => {
    switch (phase) {
      case "en_route":
        return <Badge label="En route" variant="info" />;
      case "on_site":
        return <Badge label="On site" variant="warning" />;
      case "in_treatment":
        return <Badge label="In treatment" variant="success" />;
      default:
        return <Badge label="Queued" variant="default" />;
    }
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
          message="We couldn't load your route. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.vanBadgeRow}>
            <Badge label={van?.name ?? "Live dispatch"} variant="info" />
            <ThemedText variant="caption" style={styles.shiftText}>
              Status: {shift?.status ? toLabel(shift.status) : "Offline"}
            </ThemedText>
            {isOnShift ? (
              <Badge
                label={gpsActive ? "GPS live" : "Waiting for GPS"}
                variant={gpsActive ? "success" : "default"}
              />
            ) : null}
          </View>
          <View style={styles.titleRow}>
            <ThemedText variant="largeTitle" style={styles.title}>
              Live queue ({queue.length} stop{queue.length !== 1 ? "s" : ""})
            </ThemedText>
            {queue.filter((s) => s.phase === "queued").length > 1 ? (
              <Button
                title="Optimize"
                size="sm"
                variant="secondary"
                loading={optimizeMutation.isPending}
                onPress={() => optimizeMutation.mutate()}
              />
            ) : null}
          </View>
          {queue.filter((s) => s.phase === "queued").length > 1 ? (
            <ThemedText variant="caption" style={styles.hintText}>
              Tip: Optimize sequences the remaining stops for minimum driving time. You can also drag stops with the arrows.
            </ThemedText>
          ) : null}
          {gpsError ? (
            <View style={styles.gpsWarning}>
              <ThemedText variant="caption" style={styles.gpsWarningText}>
                {gpsError}
              </ThemedText>
            </View>
          ) : null}
        </View>

        {queue.length === 0 ? (
          <Card style={styles.emptyCard}>
            <ThemedText variant="headline" style={styles.emptyTitle}>
              No stops in queue
            </ThemedText>
            <ThemedText variant="caption" style={styles.emptyBody}>
              Accepted requests will appear here in delivery order.
            </ThemedText>
            <Button
              title="Go to shift console"
              variant="secondary"
              onPress={() => router.push("/(operator)/shift" as any)}
            />
          </Card>
        ) : (
          <View style={styles.stopList}>
            {queue.map((s, index) => {
              const isCurrent = index === 0;
              const isPinned = s.phase !== "queued"; // in-treatment stops can't move
              const patientName = `${s.patient?.firstName ?? "Patient"} ${s.patient?.lastName ?? ""}`.trim();
              const address = `${s.accessDetails?.addressLine1}, ${s.accessDetails?.postcode}`;

              return (
                <Card
                  key={s.id}
                 
                  style={[styles.card, isCurrent && styles.cardNext]}
                >
                  <View style={styles.stopTop}>
                    <View style={styles.stopBadgeRow}>
                      <View style={styles.stopBadge}>
                        <ThemedText variant="caption" style={styles.stopNum}>
                          Stop {index + 1}
                        </ThemedText>
                      </View>
                      {!isPinned ? (
                        <View style={styles.reorderRow}>
                          <IconButton
                            icon="arrowUp"
                            label={`Move stop ${index + 1} up`}
                            variant="soft"
                            size={18}
                            disabled={index === 0 || reorderMutation.isPending}
                            onPress={() => moveStop(index, -1)}
                          />
                          <IconButton
                            icon="arrowDown"
                            label={`Move stop ${index + 1} down`}
                            variant="soft"
                            size={18}
                            disabled={index === queue.length - 1 || reorderMutation.isPending}
                            onPress={() => moveStop(index, 1)}
                          />
                        </View>
                      ) : (
                        <ThemedText variant="caption" style={styles.pinnedLabel}>
                          Pinned
                        </ThemedText>
                      )}
                    </View>
                    {getPhaseBadge(s.phase)}
                  </View>

                  <View style={styles.patientInfo}>
                    <ThemedText variant="headline" style={styles.name}>
                      {patientName}
                    </ThemedText>
                    <ThemedText variant="caption" style={styles.address}>
                      {address}
                    </ThemedText>
                    <ThemedText variant="caption" style={styles.parking}>
                      Parking: {s.accessDetails?.parkingType?.replace("_", " ")}
                      {s.accessDetails?.gateCode ? ` · Gate: ${s.accessDetails.gateCode}` : ""}
                    </ThemedText>
                    <ThemedText variant="caption" style={styles.procedure}>
                      {s.service?.name} ({s.service?.durationMinutes ?? 45}m block)
                    </ThemedText>
                  </View>

                  {/* Turn-by-turn: hands off to the native maps app */}
                  <Button
                    title="Navigate with maps"
              arrow
                    size="sm"
                    variant="secondary"
                    onPress={() => handleNavigate(s, patientName)}
                  />

                  {/* Phase Progression Actions (current stop only) */}
                  {isCurrent && (
                    <View style={styles.actionRow}>
                      {s.phase === "queued" && (
                        <Button
                          title="Start driving (en route)"
              arrow
                          size="md"
                          loading={phaseMutation.isPending}
                          onPress={() =>
                            phaseMutation.mutate({ id: s.id, phase: "en_route" })
                          }
                        />
                      )}
                      {s.phase === "en_route" && (
                        <Button
                          title="Arrived on site"
              arrow
                          size="md"
                          loading={phaseMutation.isPending}
                          onPress={() =>
                            phaseMutation.mutate({ id: s.id, phase: "on_site" })
                          }
                        />
                      )}
                      {s.phase === "on_site" && (
                        <Button
                          title="Start treatment"
              arrow
                          size="md"
                          variant="primary"
                          loading={phaseMutation.isPending}
                          onPress={() =>
                            phaseMutation.mutate({ id: s.id, phase: "in_treatment" })
                          }
                        />
                      )}
                      {s.phase === "in_treatment" && (
                        <Button
                          title="Complete visit & add notes"
              arrow
                          size="md"
                          onPress={() =>
                            router.push({
                              pathname: "/(operator)/offline-capture" as any,
                              params: {
                                stopId: s.id,
                                patientName,
                                procedure: s.service?.name,
                              },
                            })
                          }
                        />
                      )}
                      <Button
                        title="Mark no-show"
                        size="sm"
                        variant="ghost"
                        onPress={() => {
                          Alert.alert(
                            "Mark No-Show",
                            `Mark ${patientName} as no-show? This will remove them from the queue.`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Confirm No-Show",
                                style: "destructive",
                                onPress: () =>
                                  phaseMutation.mutate({ id: s.id, phase: "no_show" }),
                              },
                            ]
                          );
                        }}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Portal Role Switcher for Simulator Verification (development opt-in only) */}
        {__DEV__ && process.env.EXPO_PUBLIC_ENABLE_ROLE_SWITCHER === "true" ? (
          <Card style={styles.roleCard}>
            <ThemedText variant="caption" style={styles.roleHint}>
              Switch mobile portal (Demo Verification)
            </ThemedText>
            <View style={styles.roleBtnRow}>
              <Button
                title="Patient portal"
                icon={<AppIcon name="arrowLeft" size={16} color={colors.ink} />}
                variant="secondary"
                size="sm"
                onPress={() => {
                  useAuthStore.getState().updateUser({
                    role: "patient",
                    email: "patient@example.test",
                    firstName: "Test",
                    lastName: "Patient",
                  });
                  router.replace("/(patient)/(tabs)/home" as any);
                }}
              />
              <Button
                title="Clinician portal"
              arrow
                variant="secondary"
                size="sm"
                onPress={() => {
                  useAuthStore.getState().updateUser({
                    role: "clinician",
                    email: "clinician@example.test",
                    firstName: "Demo",
                    lastName: "Clinician",
                  });
                  router.replace("/(clinician)/schedule" as any);
                }}
              />
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    borderTopColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  address: {
    color: colors.secondaryLabel,
  },
  card: {
    backgroundColor: colors.systemBackground,
    gap: spacing.sm,
    padding: spacing.md,
  },
  // Marks the stop to drive to next; a hairline, not a heavy frame.
  cardNext: {
    borderColor: colors.ink,
    borderWidth: 1,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  hintText: {
    color: colors.secondaryLabel,
  },
  pinnedLabel: {
    color: colors.secondaryLabel,
  },
  reorderRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  stopBadgeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyBody: {
    color: colors.secondaryLabel,
    textAlign: "center",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.label,
  },
  gpsWarning: {
    backgroundColor: colors.warningSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  gpsWarningText: {
    color: colors.warning,
    lineHeight: 16,
  },
  header: {
    gap: spacing.xs,
  },
  name: {
    color: colors.label,
  },
  parking: {
    color: colors.secondaryLabel,
  },
  patientInfo: {
    gap: 2,
  },
  procedure: {
    color: colors.ink,
    fontWeight: "600",
    marginTop: 2,
  },
  shiftText: {
    color: colors.secondaryLabel,
  },
  stopBadge: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  stopList: {
    gap: spacing.md,
  },
  stopNum: {
    color: colors.label,
    fontWeight: "700",
  },
  stopTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: colors.label,
  },
  vanBadgeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  roleCard: {
    backgroundColor: colors.systemBackground,
    borderCurve: "continuous",
    borderRadius: radius.lg,
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  roleHint: {
    color: colors.secondaryLabel,
    fontWeight: "600",
  },
  roleBtnRow: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
});
