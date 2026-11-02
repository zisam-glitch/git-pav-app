import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemedText, Card, Button, Badge, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { fetchVanRequest, fetchActiveVanRequest, cancelVanRequest, retryDepositAuthorization, presentVanDepositSheet, DepositCanceledError } from "@/features/van/van-api";
import { VanServiceRequest, VanStopPhase } from "@/features/van/van-types";
import { useStripe } from "@stripe/stripe-react-native";
import { toLabel } from "@/lib/text";
import { trackingView } from "@/features/van/tracking";
import { VanTrackingMap } from "@/features/van/van-tracking-map";

export default function VanLiveTrackScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ requestId?: string }>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Poll request status every 5s
  const { data: apiRequest, isLoading } = useQuery<VanServiceRequest | null>({
    queryKey: ["van-request-live", params.requestId],
    queryFn: () =>
      params.requestId
        ? fetchVanRequest(params.requestId)
        : fetchActiveVanRequest(),
    refetchInterval: 5000,
  });

  const request = apiRequest ?? null;

  // Calculate remaining seconds for pending requests
  useEffect(() => {
    if (request?.status === "pending" && request.expiresAt) {
      const updateTimer = () => {
        const remaining = Math.max(
          0,
          Math.floor((new Date(request.expiresAt).getTime() - Date.now()) / 1000)
        );
        setSecondsRemaining(remaining);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
    setSecondsRemaining(null);
    return undefined;
  }, [request?.status, request?.expiresAt]);

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelVanRequest(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["van-request-live"] });
      const depositLine = result.depositRetained
        ? " The van was already on its way, so your deposit has been kept to cover the call-out."
        : "";
      Alert.alert("Request Cancelled", `Your van visit request has been cancelled.${depositLine}`, [
        { text: "OK", onPress: () => router.replace("/(patient)/(tabs)/home") },
      ]);
    },
    onError: (err: any) => {
      Alert.alert("Cannot Cancel", err.message || "Could not cancel request.");
    },
  });

  const handleCancel = () => {
    if (!request) return;
    Alert.alert(
      "Cancel Van Request",
      request.phase === "en_route" || request.phase === "on_site"
        ? "The van is already on its way, so your deposit will be kept to cover the call-out. Cancel anyway?"
        : "Are you sure you want to cancel your mobile surgery request? Your deposit will be returned.",
      [
        { text: "Keep Visit", style: "cancel" },
        {
          text: "Cancel Request",
          style: "destructive",
          onPress: () => cancelMutation.mutate(request.id),
        },
      ]
    );
  };

  /**
   * (Re-)authorize the deposit hold for a pending request whose PaymentSheet
   * was dismissed or whose card was declined. Uses the payment-retry endpoint
   * so the client secret is always fresh and server-validated.
   */
  const handleAuthorizeDeposit = async () => {
    if (!request) return;
    setIsAuthorizing(true);
    try {
      const retry = await retryDepositAuthorization(request.id);
      if (retry.alreadyAuthorized || !retry.clientSecret) {
        // Webhook already stamped it — refresh state.
        queryClient.invalidateQueries({ queryKey: ["van-request-live"] });
        return;
      }
      await presentVanDepositSheet(retry.clientSecret, {
        initPaymentSheet,
        presentPaymentSheet,
      }, retry);
      // Authorized — poll will pick up the stamped request.
      queryClient.invalidateQueries({ queryKey: ["van-request-live"] });
    } catch (err: any) {
      if (err instanceof DepositCanceledError) {
        // Silent — banner stays, patient can tap again.
      } else {
        Alert.alert("Authorization Failed", err?.message || "Could not authorize the deposit. You have not been charged.");
      }
    } finally {
      setIsAuthorizing(false);
    }
  };

  if (isLoading && !request) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.ink} />
        <ThemedText variant="caption" style={styles.loadingText}>
          Connecting to live van dispatch system...
        </ThemedText>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <AppIcon name="truck" size={32} color={colors.secondaryLabel} />
        <ThemedText variant="headline">No active van request</ThemedText>
        <ThemedText variant="caption" style={styles.loadingText}>
          You don't have a mobile surgery visit in progress right now.
        </ThemedText>
        <Button
          title="Request mobile dental van"
          variant="primary"
          onPress={() => router.replace("/(patient)/van/service-area" as any)}
        />
        <Button
          title="Return home"
          variant="ghost"
          size="sm"
          onPress={() => router.replace("/(patient)/(tabs)/home")}
        />
      </SafeAreaView>
    );
  }

  const phase: VanStopPhase = request?.phase ?? "queued";
  const status = request?.status ?? "pending";
  const etaLabel =
    request?.etaLabel ||
    (request?.etaSecondsSnapshot
      ? `~${Math.round(request.etaSecondsSnapshot / 60)} min`
      : "Calculating...");

  const isTerminal = ["declined", "expired", "completed", "cancelled"].includes(status);
  const canCancel = !isTerminal && phase !== "in_treatment";

  // Step indices for progress bar
  const getStepIndex = () => {
    if (status === "pending") return 0;
    if (status === "accepted" && phase === "queued") return 1;
    if (phase === "en_route") return 2;
    if (phase === "on_site") return 3;
    if (phase === "in_treatment") return 4;
    if (status === "completed") return 5;
    return 0;
  };
  const currentStep = getStepIndex();

  // Shown where no map can be drawn (web, or an Android build without a Maps
  // key). The van only appears once it's actually on its way.
  const vanComing = request ? trackingView(request).van !== null : false;
  const statusPanel = (
    <View style={styles.mapBackground}>
      {vanComing ? (
        <>
          <View style={styles.routeLine} />
          <View style={styles.vanMarker}>
            <View style={styles.markerBubble}>
              <AppIcon name="truck" size={20} color={colors.onInk} />
            </View>
            <View style={styles.pulseRing} />
          </View>
        </>
      ) : null}
      {/* Destination marker */}
      <View style={styles.homeMarker}>
        <View style={[styles.markerBubble, styles.markerBubbleHome]}>
          <AppIcon name="mapPin" size={20} color={colors.ink} />
        </View>
        <ThemedText variant="caption" style={styles.homeLabel} numberOfLines={1}>
          {request?.accessDetails?.addressLine1 || "Your address"}
        </ThemedText>
      </View>
    </View>
  );

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topFloat}>
          <View style={styles.backRow}>
            <Button
              title="Close"
              variant="secondary"
              size="sm"
              accessibilityLabel="Close live tracking"
              onPress={() => router.replace("/(patient)/(tabs)/home")}
            />
            <Badge
              label={
                status === "pending"
                  ? "Operator review"
                  : status === "accepted"
                  ? "In live queue"
                  : toLabel(status)
              }
              variant={
                status === "accepted"
                  ? "success"
                  : status === "pending"
                  ? "warning"
                  : "default"
              }
            />
          </View>
        </View>

        {/* Live map: the van (once it's coming), the route and the patient's
            address. Where no map can be drawn, the branded panel below. */}
        <View style={styles.mapArea}>
          {request ? (
            <VanTrackingMap view={trackingView(request)} fallback={statusPanel} />
          ) : (
            statusPanel
          )}
        </View>

        {/* Bottom Dispatch Control Sheet */}
        <Card style={styles.bottomCard}>
          {/* Status Headline */}
          <View style={styles.statusHeader}>
            <View style={styles.statusDotRow}>
              <View
                style={[
                  styles.statusPulse,
                  {
                    backgroundColor:
                      status === "declined" || status === "expired" || status === "cancelled"
                        ? colors.danger
                        : phase === "in_treatment"
                        ? colors.ink
                        : phase === "on_site"
                        ? colors.warning
                        : colors.success,
                  },
                ]}
              />
              <ThemedText variant="headline" style={styles.statusTitle}>
                {status === "pending"
                  ? "Request Sent · Awaiting Operator"
                  : status === "declined"
                  ? "Request Declined by Operator"
                  : status === "expired"
                  ? "Request Timed Out"
                  : status === "completed"
                  ? "Clinical Visit Completed!"
                  : status === "cancelled"
                  ? "Visit Cancelled"
                  : phase === "en_route"
                  ? "Van En Route to Location"
                  : phase === "on_site"
                  ? "Van Arrived On Site"
                  : phase === "in_treatment"
                  ? "Appointment In Treatment"
                  : `Accepted · Queue Position #${request?.queuePosition || 1}`}
              </ThemedText>
            </View>

            {!isTerminal && (
              <ThemedText variant="headline" style={styles.etaText}>
                {etaLabel}
              </ThemedText>
            )}
          </View>

          {/* Stepper / Timeline */}
          {!isTerminal && (
            <View style={styles.stepperContainer}>
              {[
                { label: "Request", step: 0 },
                { label: "Queued", step: 1 },
                { label: "Driving", step: 2 },
                { label: "Arrived", step: 3 },
                { label: "Treating", step: 4 },
              ].map((s, idx) => {
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <View key={s.step} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepDot,
                        isPassed && styles.stepDotPassed,
                        isCurrent && styles.stepDotCurrent,
                      ]}
                    >
                      <ThemedText
                        variant="caption"
                        style={[styles.stepNum, isPassed && styles.stepNumPassed]}
                      >
                        {idx + 1}
                      </ThemedText>
                    </View>
                    <ThemedText
                      variant="caption"
                      style={[styles.stepLabel, isCurrent && styles.stepLabelCurrent]}
                    >
                      {s.label}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          )}

          {/* Dynamic Instructions */}
          {status === "pending" && request?.depositAuthorized === false && (
            <View style={styles.depositBanner}>
              <ThemedText variant="caption" style={styles.depositBannerText}>
                <ThemedText variant="caption" style={styles.boldText}>
                  Deposit not authorized:
                </ThemedText>{" "}
                The van team can only dispatch once your deposit hold is authorized. You haven't been charged.
              </ThemedText>
              <Button
                title={isAuthorizing ? "Opening payment sheet…" : "Authorize deposit"}
                size="sm"
                loading={isAuthorizing}
                onPress={handleAuthorizeDeposit}
              />
            </View>
          )}

          {status === "pending" && (
            <View style={styles.pendingAlertBox}>
              <ThemedText variant="caption" style={styles.pendingText}>
                <ThemedText variant="caption" style={styles.boldText}>
                  Operator decision countdown:
                </ThemedText>{" "}
                {secondsRemaining !== null ? formatTimer(secondsRemaining) : "4:00"}. If the operator cannot take the stop, your request will automatically expire.
              </ThemedText>
            </View>
          )}

          {phase === "en_route" && (
            <View style={styles.infoBox}>
              <ThemedText variant="caption" style={styles.infoText}>
                Our surgical van is in transit to{" "}
                <ThemedText variant="caption" style={styles.boldText}>
                  {request?.accessDetails?.addressLine1}
                </ThemedText>
                . Please ensure parking access is unobstructed.
              </ThemedText>
            </View>
          )}

          {phase === "on_site" && (
            <View style={styles.infoBox}>
              <ThemedText variant="caption" style={styles.infoText}>
                The van has parked at your property. Please meet the clinician outside or answer the buzzer.
              </ThemedText>
            </View>
          )}

          {/* Vehicle & Procedure Details */}
          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <AppIcon name="truck" size={18} color={colors.ink} />
            </View>
            <View style={styles.driverInfo}>
              <ThemedText variant="subhead" style={styles.driverName}>
                {request?.van?.name || "Pav Dental Mobile Surgery Unit #1"}
              </ThemedText>
              <ThemedText variant="caption" style={styles.driverSub}>
                {request?.service?.name || "Dental Checkup"} · Reg:{" "}
                {request?.van?.registrationPlate || "PV24 DEN"}
              </ThemedText>
            </View>
          </View>

          {/* Action Buttons */}
          {status === "completed" && (
            <Button
              title="View treatment summary & records"
              arrow
              variant="primary"
              onPress={() =>
                router.push({
                  pathname: "/(patient)/van/complete" as any,
                  params: { requestId: request.id },
                })
              }
            />
          )}

          {isTerminal && status !== "completed" && (
            <Button
              title="Return to home screen"
              variant="primary"
              onPress={() => router.replace("/(patient)/(tabs)/home")}
            />
          )}

          {canCancel && (
            <Button
              title="Cancel van request"
              variant="secondary"
              size="sm"
              loading={cancelMutation.isPending}
              onPress={handleCancel}
            />
          )}
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  boldText: {
    color: colors.label,
    fontWeight: "700",
  },
  bottomCard: {
    backgroundColor: colors.systemBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    bottom: 0,
    gap: spacing.sm,
    left: 0,
    padding: spacing.md,
    position: "absolute",
    right: 0,
  },
  centerContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
  },
  container: {
    flex: 1,
  },
  driverAvatar: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  driverInfo: {
    flex: 1,
    gap: 2,
  },
  driverName: {
    color: colors.label,
  },
  driverRow: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  driverSub: {
    color: colors.secondaryLabel,
  },
  etaText: {
    color: colors.ink,
    fontWeight: "700",
  },
  homeLabel: {
    color: colors.label,
    fontWeight: "600",
  },
  homeMarker: {
    alignItems: "center",
    bottom: "25%",
    maxWidth: "45%",
    position: "absolute",
    right: "8%",
  },
  markerBubble: {
    alignItems: "center",
    backgroundColor: colors.ink,
    borderRadius: radius.full,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  markerBubbleHome: {
    backgroundColor: colors.systemBackground,
  },
  infoBox: {
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  infoText: {
    color: colors.ink,
    lineHeight: 16,
  },
  loadingText: {
    color: colors.secondaryLabel,
  },
  mapArea: {
    backgroundColor: colors.inkSubtle,
    flex: 1,
  },
  mapBackground: {
    flex: 1,
    position: "relative",
  },
  pendingAlertBox: {
    backgroundColor: colors.warningSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  depositBanner: {
    backgroundColor: colors.warningSubtle,
    borderRadius: radius.sm,
    gap: spacing.sm,
    padding: spacing.sm,
  },
  depositBannerText: {
    color: colors.warning,
    lineHeight: 16,
  },
  pendingText: {
    color: colors.warning,
    lineHeight: 16,
  },
  pulseRing: {
    borderColor: colors.ink,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 40,
    opacity: 0.5,
    position: "absolute",
    top: -5,
    width: 40,
  },
  routeLine: {
    borderColor: colors.ink,
    borderStyle: "dashed",
    borderWidth: 1.5,
    height: "50%",
    left: "30%",
    position: "absolute",
    top: "25%",
    transform: [{ rotate: "35deg" }],
    width: 2,
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  statusDotRow: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: spacing.xs,
  },
  statusHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusPulse: {
    borderRadius: radius.full,
    height: 10,
    width: 10,
  },
  statusTitle: {
    color: colors.label,
    flex: 1,
  },
  stepDot: {
    alignItems: "center",
    backgroundColor: colors.separator,
    borderRadius: radius.full,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  stepDotCurrent: {
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.onInk,
  },
  stepDotPassed: {
    backgroundColor: colors.ink,
  },
  stepItem: {
    alignItems: "center",
    gap: 3,
  },
  stepLabel: {
    color: colors.tertiaryLabel,
    fontSize: 11,
  },
  stepLabelCurrent: {
    color: colors.ink,
    fontWeight: "700",
  },
  stepNum: {
    color: colors.onInk,
    fontSize: 11,
    fontWeight: "700",
  },
  stepNumPassed: {
    color: colors.onInk,
  },
  stepperContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  topFloat: {
    left: spacing.md,
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    zIndex: 10,
  },
  vanMarker: {
    alignItems: "center",
    left: "25%",
    position: "absolute",
    top: "30%",
  },
});
