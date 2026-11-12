import { reportCaughtError } from "@/lib/caught-errors";
import { runBookingPayment } from "@/features/booking/booking-payment";
import { useStripePay } from "@/features/booking/use-stripe-pay";
import { bookingStep } from "@/features/booking/booking-steps";
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStripe } from "@stripe/stripe-react-native";
import { ThemedText, Card, Button, AppIcon, FlowHeader, DetailRow, CheckboxMark } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useBookingStore } from "@/features/booking/booking-store";
import {
  formatGbp,
  createAppointment,
  createPaymentIntent,
  confirmAppointment,
  newBookingAttemptKey,
} from "@/features/booking/booking-api";
import { useRewards } from "@/features/hooks/use-dental-api";
import { useDependants } from "@/features/account/account-hooks";

export default function BookingSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPlatformPaySupported } = useStripe();
  // Only offer the Apple Pay / Google Pay button where the wallet can pay.
  const [walletReady, setWalletReady] = useState(false);
  useEffect(() => {
    isPlatformPaySupported(Platform.OS === "android" ? { googlePay: { testEnv: process.env.EXPO_PUBLIC_APP_ENV !== "production" } } : undefined)
      .then(setWalletReady, () => setWalletReady(false));
  }, []);
  const { service, clinic, clinician, slot, holdExpiresAt, releaseSlot, channel } = useBookingStore();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (!holdExpiresAt) return 0;
    return Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
  });
  const [isProcessing, setIsProcessing] = useState(false);
  // Once the booking is paid, the confirmed screen sits on top of this one and
  // clears the draft; without this the cleared draft looks like an expired hold.
  const paidRef = useRef(false);
  // A rewards voucher off this deposit (decisions log #14). The server checks
  // it and sets the amount; this only previews it.
  const { data: rewardsData } = useRewards();
  const voucher: { voucherCode: string; discountPence: number } | undefined = rewardsData?.vouchers?.[0];
  const [useVoucher, setUseVoucher] = useState(false);
  // A parent or guardian can book for their child (decisions log #17).
  const { data: dependants = [] } = useDependants();
  const [dependantId, setDependantId] = useState<string | null>(null);

  useEffect(() => {
    if (paidRef.current) return;
    if (!service || !slot) {
      router.replace("/(patient)/booking/service-catalog" as any);
    }
  }, [service, slot]);

  const depositPence = service?.depositPence ?? 0;
  const voucherFits = !!voucher && voucher.discountPence < depositPence;
  const depositDuePence = useVoucher && voucherFits ? depositPence - voucher!.discountPence : depositPence;

  useEffect(() => {
    if (paidRef.current) return;
    if (!holdExpiresAt || holdExpiresAt <= Date.now()) {
      setSecondsRemaining(0);
      Alert.alert(
        "Your held time has run out",
        "Your slot reservation has expired or is invalid. Please select a time slot.",
        [
          {
            text: "Select Slot",
            onPress: () => {
              releaseSlot();
              router.replace("/(patient)/booking/slot-picker" as any);
            },
          },
        ]
      );
      return;
    }

    setSecondsRemaining(Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000)));

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        if (paidRef.current) return;
        // Handle expired hold
        Alert.alert(
          "Your held time has run out",
          "Your slot reservation has expired. Please select a new time slot.",
          [
            {
              text: "OK",
              onPress: () => {
                releaseSlot();
                router.replace("/(patient)/booking/slot-picker" as any);
              },
            },
          ]
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // One key per visit to this screen: retries of the same booking reuse it.
  const attemptKey = useRef(newBookingAttemptKey());
  const stripePay = useStripePay();

  // "wallet" pays with Apple Pay or Google Pay in the phone's own sheet; "card"
  // opens Stripe's card form. Either way the patient confirms the payment
  // themselves (double-click or Face ID, or the sheet's Pay button): nothing
  // is charged just by tapping a button here. The steps live in
  // features/booking/booking-payment.ts; this only shows the outcome.
  const handlePayDeposit = async (method: "wallet" | "card") => {
    setIsProcessing(true);
    const outcome = await runBookingPayment(
      {
        createAppointment,
        createPaymentIntent,
        confirmAppointment,
        initStripe: stripePay.initStripe,
        payWithWallet: stripePay.payWithWallet,
        payWithSheet: stripePay.payWithSheet,
        // Once paid, the confirmed screen sits on top and clears the draft;
        // without this the cleared draft looks like an expired hold.
        onPaid: () => {
          paidRef.current = true;
        },
        report: reportCaughtError,
        // A mock Stripe server can only be skipped past in a development build.
        allowMockPayment: __DEV__,
      },
      {
        service,
        slot,
        channel,
        clinic,
        clinician,
        dependantId,
        voucherCode: useVoucher && voucherFits ? voucher!.voucherCode : undefined,
        attemptKey: attemptKey.current,
        method,
      }
    );
    setIsProcessing(false);

    switch (outcome.kind) {
      case "confirmed":
        router.push(`/(patient)/booking/confirmed?appointmentId=${outcome.appointmentId}` as never);
        return;
      case "incomplete":
        Alert.alert(outcome.title, outcome.message);
        router.replace(`/(patient)/booking/${outcome.redirect}` as never);
        return;
      case "failed":
        Alert.alert(outcome.title, outcome.message);
        return;
      case "cancelled":
        return;
    }
  };

  if (!service || !slot) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <FlowHeader step={bookingStep(channel, "pay")} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Soft Hold Countdown Banner */}
        <View style={styles.timerBanner}>
          <AppIcon name="clock" size={14} color={colors.warning} />
          <ThemedText variant="caption" style={styles.timerText}>
            Slot reserved for {formatTimer(secondsRemaining)}. Complete payment to secure.
          </ThemedText>
        </View>

        {dependants.length > 0 && (
          <Card style={styles.card}>
            <ThemedText variant="headline" style={styles.sectionTitle}>
              Who is this appointment for?
            </ThemedText>
            <View style={styles.whoRow}>
              {[{ id: null as string | null, label: "Me" }, ...dependants.map((d) => ({ id: d.id as string | null, label: d.firstName }))].map(
                (option) => {
                  const selected = dependantId === option.id;
                  return (
                    <Pressable accessibilityLabel={option.label}
                      key={option.id ?? "me"}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => setDependantId(option.id)}
                      style={[styles.whoPill, selected && styles.whoPillSelected]}
                    >
                      <ThemedText variant="caption" style={selected ? styles.whoTextSelected : styles.label}>
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  );
                }
              )}
            </View>
          </Card>
        )}

        {/* Appointment Breakdown Card */}
        <Card style={styles.card}>
          <ThemedText variant="headline" style={styles.sectionTitle}>
            Appointment details
          </ThemedText>

          <DetailRow label="Treatment" value={service.name} emphasis />
          <DetailRow
            label={channel === "video" ? "Where" : "Practice"}
            value={channel === "video" ? "Video consultation" : clinic?.name ?? "—"}
          />
          {/* No clinician chosen means "Any practitioner (first available)" on the previous step. */}
          <DetailRow label="Dentist" value={clinician?.fullName || "First available"} />
          <DetailRow
            label="Date and time"
            value={slot.dateFormatted ? `${slot.dateFormatted} at ${slot.displayTime}` : slot.displayTime}
            emphasis
          />
        </Card>

        {/* Payment & Deposit Summary */}
        <Card style={styles.card}>
          <ThemedText variant="headline" style={styles.sectionTitle}>
            Payment breakdown
          </ThemedText>

          <View style={styles.priceRow}>
            <ThemedText variant="body" style={styles.label}>
              Treatment fee
            </ThemedText>
            <ThemedText variant="mono">
              {formatGbp(service.pricePence)}
            </ThemedText>
          </View>

          {voucherFits && (
            <Pressable accessibilityLabel="Use rewards voucher"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: useVoucher }}
              onPress={() => setUseVoucher((v) => !v)}
              style={styles.priceRow}
            >
              <View style={styles.voucherLabel}>
                <CheckboxMark checked={useVoucher} size={22} />
                <ThemedText variant="body" style={styles.label}>
                  Use rewards voucher ({formatGbp(voucher!.discountPence)} off)
                </ThemedText>
              </View>
              {useVoucher && <ThemedText variant="mono">–{formatGbp(voucher!.discountPence)}</ThemedText>}
            </Pressable>
          )}

          <View style={styles.priceRow}>
            <ThemedText variant="headline" style={styles.depositLabel}>
              Deposit due today
            </ThemedText>
            <ThemedText variant="mono" style={styles.depositAmount}>
              {formatGbp(depositDuePence)}
            </ThemedText>
          </View>

          <ThemedText variant="caption" style={styles.balanceNote}>
            {/* A video consult has no practice or van to pay at. */}
            The remaining balance of {formatGbp(service.pricePence - service.depositPence)} is paid{" "}
            {channel === "video" ? "at your appointment." : "at your visit, at the practice or the van."}
          </ThemedText>
        </Card>

        {/* Cancellation Policy */}
        <View style={styles.policyBox}>
          <ThemedText variant="caption" style={styles.policyTitle}>
            Cancellation policy
          </ThemedText>
          <ThemedText variant="caption" style={styles.policyText}>
            Cancel 48 hours or more before your visit for a full deposit refund, or 24 to 48 hours before for half. Deposits aren't refunded for cancellations less than 24 hours before. Refunds go back to your card automatically.
          </ThemedText>
        </View>
      </ScrollView>

      {/* Wallet-first payment CTAs (Apple/Google Pay primary) */}
      <View style={[styles.footerBar, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        {walletReady && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              Platform.OS === "android" ? "Pay deposit with Google Pay" : "Pay deposit with Apple Pay"
            }
            disabled={secondsRemaining === 0 || isProcessing}
            onPress={() => handlePayDeposit("wallet")}
            style={({ pressed }) => [
              styles.walletButton,
              (secondsRemaining === 0 || isProcessing) && styles.walletButtonDisabled,
              pressed && { opacity: 0.85 },
            ]}
          >
            <ThemedText variant="headline" style={styles.walletText}>
              {isProcessing ? "Processing…" : Platform.OS === "android" ? "Google Pay" : "Apple Pay"}
            </ThemedText>
            <ThemedText variant="headline" style={styles.walletText}>
              {formatGbp(depositDuePence)}
            </ThemedText>
          </Pressable>
        )}
        <Button
          testID="booking-pay-card"
          title={secondsRemaining === 0 ? "Slot expired - select new time" : walletReady ? "Pay by card instead" : `Pay ${formatGbp(depositDuePence)} by card`}
          size="lg"
          variant={walletReady ? "secondary" : "primary"}
          arrow={true}
          loading={isProcessing}
          disabled={secondsRemaining === 0}
          onPress={secondsRemaining === 0 ? () => {
            releaseSlot();
            router.replace("/(patient)/booking/slot-picker" as any);
          } : () => handlePayDeposit("card")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  topNav: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  timerBanner: {
    alignItems: "center",
    backgroundColor: colors.warningSubtle,
    borderRadius: radius.full,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xs + 2,
  },
  timerText: {
    color: colors.warning,
    flex: 1,
    fontWeight: "600",
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.label,
    fontWeight: "700",
    fontSize: 17,
    marginBottom: spacing.xxs,
  },
  label: {
    color: colors.secondaryLabel,
  },
  voucherLabel: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.xs,
  },
  priceRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  depositLabel: {
    color: colors.label,
    fontWeight: "700",
  },
  depositAmount: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "700",
  },
  balanceNote: {
    color: colors.secondaryLabel,
    marginTop: spacing.xxs,
    fontSize: 13,
  },
  policyBox: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: 6,
    padding: spacing.md,
  },
  policyTitle: {
    color: colors.label,
    fontWeight: "700",
  },
  policyText: {
    color: colors.secondaryLabel,
    lineHeight: 18,
    fontSize: 13,
  },
  whoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  whoPill: {
    borderColor: colors.separator,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xs,
  },
  whoPillSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  whoTextSelected: {
    color: colors.onAccent,
    fontWeight: "600",
  },
  footerBar: {
    backgroundColor: colors.background,
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  walletButton: {
    alignItems: "center",
    backgroundColor: colors.alwaysBlack,
    borderRadius: radius.full,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  walletButtonDisabled: {
    opacity: 0.4,
  },
  walletText: {
    color: colors.alwaysWhite,
    fontWeight: "700",
    fontSize: 17,
  },
});
