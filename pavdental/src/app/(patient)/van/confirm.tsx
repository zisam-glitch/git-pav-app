import { formatGbp } from "@/lib/money";
import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { useStripe } from "@stripe/stripe-react-native";
import { ThemedText, Card, Button, Badge, DetailRow } from "@/components";
import { colors, spacing, radius } from "@/theme";
import {
  createVanRequest,
  cancelVanRequest,
  retryDepositAuthorization,
  presentVanDepositSheet,
  DepositCanceledError,
} from "@/features/van/van-api";
import { useVanStore } from "@/features/van/van-store";

export default function VanConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useVanStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accessPayload = store.getAccessDetailsPayload();
  const etaLabel = store.availability?.etaLabel || null;

  /**
   * Create the request, then — when the backend is in real-Stripe mode —
   * present PaymentSheet so the patient authorizes the manual-capture
   * deposit hold. The deposit is captured server-side only if an operator
   * accepts; if the request is declined or times out the backend releases
   * the hold automatically.
   */
  const hasService = Boolean(store.serviceId);
  const depositPence = store.serviceDepositPence ?? 0;

  const submitRequest = async () => {
    if (!hasService) {
      Alert.alert("No Service Selected", "Please choose a service before requesting the van.");
      return;
    }
    setIsSubmitting(true);
    let requestId: string | null = null;
    try {
      const request = await createVanRequest({
        serviceId: store.serviceId,
        accessDetails: accessPayload,
      });
      requestId = request.id;

      if (request.isMockPayment || !request.clientSecret) {
        // Mock-Stripe backend (or no deposit configured) — straight to tracking.
        store.setActiveRequestId(request.id);
        router.replace({
          pathname: "/(patient)/van/live-track" as any,
          params: { requestId: request.id },
        });
        return;
      }

      await presentVanDepositSheet(request.clientSecret, {
        initPaymentSheet,
        presentPaymentSheet,
      }, request);

      // Authorized. The webhook stamps the request server-side.
      store.setActiveRequestId(request.id);
      router.replace({
        pathname: "/(patient)/van/live-track" as any,
        params: { requestId: request.id },
      });
    } catch (err: any) {
      if (err instanceof DepositCanceledError) {
        // Patient dismissed the sheet — offer retry or release the hold.
        Alert.alert(
          "Deposit Not Authorized",
          "Your request is on hold, but the deposit hasn't been authorized yet. The van team can only dispatch once it is.",
          [
            {
              text: "Cancel Request",
              style: "destructive",
              onPress: () => {
                if (requestId) {
                  cancelVanRequest(requestId)
                    .then(() => store.resetDraft())
                    .catch(() => {});
                }
              },
            },
            { text: "Try Again", onPress: () => submitRequestRetry(requestId) },
          ]
        );
        return;
      }

      Alert.alert(
        "Request Failed",
        err?.message || "Could not dispatch van. Check that a van is online in your area."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Retry just the PaymentSheet step after a dismissal (request already created). */
  const submitRequestRetry = async (requestId: string | null) => {
    if (!requestId) return;
    setIsSubmitting(true);
    try {
      // Re-fetch the intent secret server-side rather than reusing the stale one.
      const retry = await retryDepositAuthorization(requestId);
      if (retry.alreadyAuthorized || !retry.clientSecret) {
        store.setActiveRequestId(requestId);
        router.replace({
          pathname: "/(patient)/van/live-track" as any,
          params: { requestId },
        });
        return;
      }
      await presentVanDepositSheet(retry.clientSecret, {
        initPaymentSheet,
        presentPaymentSheet,
      }, retry);
      store.setActiveRequestId(requestId);
      router.replace({
        pathname: "/(patient)/van/live-track" as any,
        params: { requestId },
      });
    } catch {
      // Still not authorized — the live-track banner offers another retry.
      store.setActiveRequestId(requestId);
      router.replace({
        pathname: "/(patient)/van/live-track" as any,
        params: { requestId },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestMutation = useMutation({
    mutationFn: () => submitRequest(),
  });
  const fullAddress = [
    accessPayload.addressLine1,
    accessPayload.addressLine2,
    accessPayload.city,
    accessPayload.postcode,
  ]
    .filter(Boolean)
    .join(", ");

  const parkingLabelMap: Record<string, string> = {
    private_driveway: "Private driveway",
    permit_bay: "Kerbside permit bay",
    visitor: "Corporate / visitor parking",
    other: "Safe loading / kerb area",
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={styles.holdBanner}>
          <ThemedText variant="caption" style={styles.holdText}>
            Live dispatch · an operator will confirm your visit
          </ThemedText>
        </View>

        {/* Visit Breakdown */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <ThemedText variant="headline" style={styles.title}>
              Mobile van visit summary
            </ThemedText>
            <Badge label="Live dispatch" variant="info" />
          </View>

          <DetailRow label="Address" value={fullAddress || "—"} emphasis />
          <DetailRow label="Parking" value={parkingLabelMap[accessPayload.parkingType] || "Private driveway"} />
          {accessPayload.gateCode ? <DetailRow label="Gate or buzzer" value={accessPayload.gateCode} /> : null}
          <DetailRow label="Arrives" value={etaLabel ? `${etaLabel} from operator accept` : "Confirmed when the operator accepts"} emphasis />
          <DetailRow
            label="Treatment"
            value={
              hasService
                ? `${store.serviceName} (${store.serviceDurationMinutes} min)`
                : "No service selected"
            }
          />
        </Card>

        {/* Financials & Transparent Policy */}
        <Card style={styles.card}>
          <ThemedText variant="headline" style={styles.title}>
            Pricing & payment terms
          </ThemedText>

          <DetailRow
            label="Treatment and call-out"
            value={hasService ? formatGbp(store.servicePricePence) : "–"}
          />

          <View style={styles.rowBetween}>
            <ThemedText variant="headline">Deposit due on accept</ThemedText>
            <ThemedText variant="title" style={styles.depositPrice}>
              {depositPence > 0 ? formatGbp(depositPence) : "None"}
            </ThemedText>
          </View>

          <View style={styles.policyBox}>
            <ThemedText variant="caption" style={styles.policyNote}>
              {depositPence > 0
                ? "We place a hold for the deposit when you confirm. It's only taken if the van team accepts your request."
                : "No deposit is needed for this service."}
            </ThemedText>
            <ThemedText variant="caption" style={styles.policyNote}>
              If the request times out or is declined, any hold is released and you pay nothing.
            </ThemedText>
          </View>
        </Card>
      </ScrollView>

      {/* Action Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <Button
          title={isSubmitting ? "Dispatching…" : "Confirm & request van visit"}
          arrow={!isSubmitting}
          size="lg"
          loading={isSubmitting}
          disabled={!hasService}
          onPress={() => requestMutation.mutate()}
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
  cardHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
  depositPrice: {
    color: colors.ink,
    fontWeight: "700",
  },
  footer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  holdBanner: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  holdText: {
    color: colors.ink,
    fontWeight: "600",
  },
  policyBox: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    gap: 4,
    marginTop: spacing.xs,
    padding: spacing.sm,
  },
  policyNote: {
    color: colors.secondaryLabel,
    lineHeight: 16,
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: colors.label,
  },
});
