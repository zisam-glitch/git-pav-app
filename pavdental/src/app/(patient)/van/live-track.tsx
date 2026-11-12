import { reportCaughtError } from "@/lib/caught-errors";
import { plainBookingError } from "@/features/payment/payment-errors";
import { authorizeDeposit, cancelDoneMessage, cancelPrompt, formatCountdown, secondsUntil } from "@/features/van/live-track-actions";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemedText, Button, AppIcon, ErrorState } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { fetchVanRequest, fetchActiveVanRequest, cancelVanRequest, retryDepositAuthorization, presentVanDepositSheet, DepositCanceledError } from "@/features/van/van-api";
import type { VanServiceRequest, VanStopPhase } from "@/features/van/van-types";
import { useStripe } from "@stripe/stripe-react-native";
import { positionAgeLabel, trackingSheet, trackingView, vanIsAssigned } from "@/features/van/tracking";
import { VanTrackingMap } from "@/features/van/van-tracking-map";

export default function VanLiveTrackScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ requestId?: string }>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);

  // Poll request status every 5s
  const { data: apiRequest, isLoading, isError, refetch } = useQuery<VanServiceRequest | null>({
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
      const updateTimer = () => setSecondsRemaining(secondsUntil(request.expiresAt));
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
      Alert.alert("Request cancelled", cancelDoneMessage(result), [
        { text: "OK", onPress: () => router.replace("/(patient)/(tabs)/home") },
      ]);
    },
    onError: (err: unknown) => {
      reportCaughtError(err, "van request cancel failed");
      Alert.alert("Cannot cancel", plainBookingError(err));
    },
  });

  const handleCancel = () => {
    if (!request) return;
    const prompt = cancelPrompt(request);
    Alert.alert(
      prompt.title,
      prompt.message,
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
    const outcome = await authorizeDeposit(
      {
        retry: retryDepositAuthorization,
        presentSheet: (clientSecret, retry) =>
          presentVanDepositSheet(clientSecret, { initPaymentSheet, presentPaymentSheet }, retry as Parameters<typeof presentVanDepositSheet>[2]),
        isClosedByPatient: (err) => err instanceof DepositCanceledError,
      },
      request.id
    );
    setIsAuthorizing(false);
    if (outcome.kind === "failed") {
      reportCaughtError(outcome.error, "van deposit authorization failed");
      Alert.alert("Authorization failed", outcome.message);
      return;
    }
    // "already" and "authorized": the next poll shows the stamped request.
    if (outcome.kind !== "closed") queryClient.invalidateQueries({ queryKey: ["van-request-live"] });
  };

  if (isLoading && !request) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.ink} />
        <ThemedText variant="caption" style={styles.loadingText}>
          Finding the van...
        </ThemedText>
      </SafeAreaView>
    );
  }

  // A failed check is not "no request": the deposit may be held and the van on
  // its way. Say we can't reach the server and let them retry (N25).
  if (!request && isError) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ErrorState
          message="We couldn't reach the server to check on your van. Your request hasn't changed. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <AppIcon name="truck" size={32} color={colors.secondaryLabel} />
        <ThemedText variant="headline">No active van request</ThemedText>
        <ThemedText variant="caption" style={styles.loadingText}>
          You don't have a mobile dental van visit in progress right now.
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
  const sheet = trackingSheet(request);

  const vanAgeLabel = trackingView(request).van ? positionAgeLabel(request.shift?.lastLocationAt) : null;
  const isTerminal = ["declined", "expired", "completed", "cancelled"].includes(status);
  // No van is assigned until an operator accepts, whatever the server sent.
  const vanAssigned = vanIsAssigned(status);
  const canCancel = !isTerminal && phase !== "in_treatment";
  const dotColor = {
    waiting: colors.warning,
    moving: colors.success,
    arrived: colors.success,
    treating: colors.ink,
    done: colors.success,
    stopped: colors.danger,
  }[sheet.tone];

  // Shown where no map can be drawn (web without a key, or an Android build
  // without one). The van only appears once it's actually on its way.
  const vanComing = trackingView(request).van !== null;
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
      {/* Destination marker, kept clear of the sheet */}
      <View style={[styles.homeMarker, { bottom: sheetHeight + spacing.lg }]}>
        <View style={[styles.markerBubble, styles.markerBubbleHome]}>
          <AppIcon name="mapPin" size={20} color={colors.ink} />
        </View>
        <ThemedText variant="caption" style={styles.homeLabel} numberOfLines={1}>
          {request.accessDetails?.addressLine1 || "Your address"}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* Live map: the van (once it's coming), the route and the patient's
            address, framed above the sheet. Where no map can be drawn, the
            panel above. */}
        <View style={styles.mapArea}>
          <VanTrackingMap view={trackingView(request)} bottomInset={sheetHeight} fallback={statusPanel} />
        </View>

        <View style={styles.topFloat} pointerEvents="box-none">
          <Pressable
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close live tracking"
            onPress={() => router.replace("/(patient)/(tabs)/home")}
          >
            <AppIcon name="close" size={18} color={colors.ink} />
          </Pressable>
        </View>

        {/* Bottom sheet */}
        <View style={styles.sheet} onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}>
          <View style={styles.grabber} />

          <View style={styles.headline}>
            <View style={styles.headlineText}>
              <View style={styles.statusDotRow}>
                <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
                <ThemedText variant="caption" style={styles.statusKicker}>
                  {sheet.tone === "stopped" ? "Ended" : STEP_LABELS[sheet.step]}
                </ThemedText>
              </View>
              <ThemedText variant="title" style={styles.sheetTitle} accessibilityRole="header">
                {sheet.title}
              </ThemedText>
              <ThemedText variant="subhead" style={styles.sheetSubtitle}>
                {sheet.subtitle}
              </ThemedText>
            </View>
            {sheet.etaMinutes !== null ? (
              <View style={styles.etaPill} accessibilityLabel={sheet.etaIsEstimate ? `Estimated arrival about ${sheet.etaMinutes} minutes` : `About ${sheet.etaMinutes} minutes away`}>
                <ThemedText style={styles.etaNumber}>{sheet.etaMinutes}</ThemedText>
                <ThemedText variant="caption" style={styles.etaUnit}>
                  {sheet.etaIsEstimate ? "min est." : "min"}
                </ThemedText>
              </View>
            ) : sheet.etaText && !isTerminal ? (
              <View style={styles.etaPill}>
                <ThemedText variant="caption" style={styles.etaRange}>
                  {sheet.etaIsEstimate ? `Est. ${sheet.etaText}` : sheet.etaText}
                </ThemedText>
              </View>
            ) : null}
          </View>

          {/* Progress: request, queued, driving, arrived, treating */}
          {sheet.tone !== "stopped" && (
            <View
              style={styles.progress}
              accessibilityRole="progressbar"
              accessibilityLabel={`Step ${Math.min(sheet.step + 1, 5)} of 5: ${STEP_LABELS[sheet.step]}`}
            >
              {STEP_LABELS.slice(0, 5).map((label, idx) => (
                <View
                  key={label}
                  style={[
                    styles.progressSegment,
                    idx < sheet.step && styles.progressDone,
                    idx === sheet.step && styles.progressCurrent,
                  ]}
                />
              ))}
            </View>
          )}

          {isError ? (
            <ThemedText variant="caption" style={styles.staleText} accessibilityLiveRegion="polite">
              Can't reach us. Showing your last update. Retrying…
            </ThemedText>
          ) : vanAgeLabel ? (
            <ThemedText variant="caption" style={styles.staleText}>
              {vanAgeLabel}
            </ThemedText>
          ) : null}

          {status === "pending" && request.depositAuthorized === false && (
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
                  {secondsRemaining !== null ? formatCountdown(secondsRemaining) : "4:00"} left
                </ThemedText>{" "}
                for a van to accept. If none can, the request ends and any deposit hold is released.
              </ThemedText>
            </View>
          )}

          {/* Vehicle */}
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleAvatar}>
              <AppIcon name="truck" size={20} color={colors.ink} />
            </View>
            <View style={styles.vehicleInfo}>
              <ThemedText variant="subhead" style={styles.vehicleName} numberOfLines={1}>
                {vanAssigned ? request.van?.name || "Pav Dental van" : "Waiting for a van to accept"}
              </ThemedText>
              <ThemedText variant="caption" style={styles.vehicleSub} numberOfLines={1}>
                {request.service?.name || "Dental visit"}
              </ThemedText>
            </View>
            {vanAssigned && request.van?.registrationPlate ? (
              <View style={styles.plate} accessibilityLabel={`Registration ${request.van.registrationPlate}`}>
                <ThemedText style={styles.plateText}>{request.van.registrationPlate}</ThemedText>
              </View>
            ) : null}
          </View>

          {/* Destination */}
          <View style={styles.addressRow}>
            <AppIcon name="mapPin" size={16} color={colors.secondaryLabel} />
            <ThemedText variant="caption" style={styles.addressText} numberOfLines={1}>
              {[request.accessDetails?.addressLine1, request.accessDetails?.postcode].filter(Boolean).join(", ") ||
                "Your address"}
            </ThemedText>
          </View>

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
        </View>
      </View>
    </SafeAreaView>
  );
}

// One per sheet step; the first five are the progress bar's segments.
const STEP_LABELS = ["Request sent", "Queued", "Driving", "Arrived", "Treating", "Completed"];

const styles = StyleSheet.create({
  addressRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  addressText: {
    color: colors.secondaryLabel,
    flex: 1,
  },
  boldText: {
    color: colors.label,
    fontWeight: "700",
  },
  centerContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    shadowColor: colors.alwaysBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    width: 40,
  },
  container: {
    flex: 1,
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
  etaNumber: {
    color: colors.onInk,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 28,
  },
  etaPill: {
    alignItems: "center",
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    justifyContent: "center",
    minWidth: 56,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  etaRange: {
    color: colors.onInk,
    fontWeight: "700",
  },
  etaUnit: {
    color: colors.onInk,
    opacity: 0.8,
  },
  grabber: {
    alignSelf: "center",
    backgroundColor: colors.separator,
    borderRadius: radius.full,
    height: 5,
    marginBottom: spacing.xs,
    width: 40,
  },
  headline: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  headlineText: {
    flex: 1,
    gap: 2,
  },
  homeLabel: {
    color: colors.label,
    fontWeight: "600",
  },
  homeMarker: {
    alignItems: "center",
    maxWidth: "45%",
    position: "absolute",
    right: "8%",
  },
  loadingText: {
    color: colors.secondaryLabel,
  },
  mapArea: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: colors.inkSubtle,
  },
  mapBackground: {
    flex: 1,
    position: "relative",
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
  pendingAlertBox: {
    backgroundColor: colors.warningSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  pendingText: {
    color: colors.warning,
    lineHeight: 16,
  },
  plate: {
    backgroundColor: colors.systemBackground,
    borderColor: colors.ink,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  plateText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  progress: {
    flexDirection: "row",
    gap: 4,
    marginVertical: spacing.xs,
  },
  progressCurrent: {
    backgroundColor: colors.ink,
    opacity: 0.45,
  },
  progressDone: {
    backgroundColor: colors.ink,
  },
  progressSegment: {
    backgroundColor: colors.separator,
    borderRadius: radius.full,
    flex: 1,
    height: 4,
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
    height: "40%",
    left: "30%",
    position: "absolute",
    top: "15%",
    transform: [{ rotate: "35deg" }],
    width: 2,
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.systemBackground,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    bottom: 0,
    gap: spacing.sm,
    left: 0,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    position: "absolute",
    right: 0,
    shadowColor: colors.alwaysBlack,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  sheetSubtitle: {
    color: colors.secondaryLabel,
  },
  sheetTitle: {
    color: colors.label,
  },
  statusDot: {
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },
  statusDotRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  staleText: {
    color: colors.warning,
  },
  statusKicker: {
    color: colors.secondaryLabel,
    fontWeight: "600",
  },
  topFloat: {
    left: spacing.md,
    position: "absolute",
    top: spacing.md,
    zIndex: 10,
  },
  vanMarker: {
    alignItems: "center",
    left: "25%",
    position: "absolute",
    top: "20%",
  },
  vehicleAvatar: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  vehicleInfo: {
    flex: 1,
    gap: 2,
  },
  vehicleName: {
    color: colors.label,
    fontWeight: "600",
  },
  vehicleRow: {
    alignItems: "center",
    borderColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  vehicleSub: {
    color: colors.secondaryLabel,
  },
});
