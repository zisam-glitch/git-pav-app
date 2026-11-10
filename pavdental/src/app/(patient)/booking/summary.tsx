import { bookingStep } from "@/features/booking/booking-steps";
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { initStripe, useStripe, PlatformPay } from "@stripe/stripe-react-native";
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
  const { initPaymentSheet, presentPaymentSheet, isPlatformPaySupported, confirmPlatformPayPayment } = useStripe();
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

  // "wallet" pays with Apple Pay or Google Pay in the phone's own sheet; "card"
  // opens Stripe's card form. Either way the patient confirms the payment
  // themselves (double-click or Face ID, or the sheet's Pay button): nothing
  // is charged just by tapping a button here.
  const handlePayDeposit = async (method: "wallet" | "card") => {
    if (!service || !slot) {
      Alert.alert("Incomplete Booking", "Please select a service and time slot before continuing.");
      router.replace("/(patient)/booking/service-catalog" as any);
      return;
    }

    if (!slot.startTimeUtc || !slot.endTimeUtc) {
      Alert.alert("Invalid Slot", "Selected slot is missing timing details. Please choose another slot.");
      router.replace("/(patient)/booking/slot-picker" as any);
      return;
    }

    setIsProcessing(true);
    try {
      const startTime = slot.startTimeUtc;
      const endTime = slot.endTimeUtc;

      // 1. Create draft appointment
      const appt = await createAppointment({
        serviceId: service.id,
        // Clinic visits and video consults are booked here; van visits use the
        // van dispatch flow.
        channel: channel ?? "clinic",
        // "Any practitioner" leaves these as empty strings, which the API
        // rejects as not-a-UUID: send nothing so it picks the dentist itself.
        clinicianId: clinician?.id || slot.clinicianId || undefined,
        clinicId: channel === "video" ? undefined : clinic?.id || slot.clinicId || undefined,
        startTimeUtc: startTime,
        endTimeUtc: endTime,
        slotId: slot.id,
        dependantId: dependantId ?? undefined,
      }, attemptKey.current);

      // 2. Create PaymentIntent on the server — amount is server-authoritative
      const intent = await createPaymentIntent(appt.id, useVoucher && voucherFits ? voucher!.voucherCode : undefined);

      // Local development runs Stripe in mock mode: there is no card to take,
      // so the server confirms the mock intent directly (never reachable when
      // deployed: the server rejects mock keys in staging and production).
      if (intent.isMock) {
        await confirmAppointment(appt.id, intent.paymentIntentId);
        paidRef.current = true;
        setIsProcessing(false);
        router.push(`/(patient)/booking/confirmed?appointmentId=${appt.id}` as never);
        return;
      }

      // 3. Validate that we have a real payment intent
      if (!intent.clientSecret) {
        throw new Error("Payment setup failed - no client secret received");
      }

      // 4. Initialise Stripe with the key the server says to use (so a build
      // without EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY still works), then the
      // PaymentSheet with the client secret.
      if (intent.publishableKey) {
        await initStripe({
          publishableKey: intent.publishableKey,
          merchantIdentifier: "merchant.com.pavdental.app",
        });
      }
      if (method === "wallet") {
        const { error: walletError } = await confirmPlatformPayPayment(intent.clientSecret, {
          applePay: {
            merchantCountryCode: "GB",
            currencyCode: "GBP",
            cartItems: [
              {
                label: "Pav Dental deposit",
                // The wallet sheet wants a plain decimal string, not "£85.00".
                amount: (intent.amountPence / 100).toFixed(2),
                paymentType: PlatformPay.PaymentType.Immediate,
              },
            ],
          },
          googlePay: {
            merchantCountryCode: "GB",
            currencyCode: "GBP",
            merchantName: "Pav Dental",
            testEnv: process.env.EXPO_PUBLIC_APP_ENV !== "production",
          },
        });
        if (walletError) {
          if (walletError.code !== "Canceled") Alert.alert("Payment Failed", walletError.message);
          setIsProcessing(false);
          return;
        }
      } else {
        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: "Pav Dental",
          paymentIntentClientSecret: intent.clientSecret,
          // Saved cards appear in the sheet, which also offers to save a new one.
          ...(intent.customerId && intent.customerEphemeralKeySecret
            ? { customerId: intent.customerId, customerEphemeralKeySecret: intent.customerEphemeralKeySecret }
            : {}),
          returnURL: "pavdental://stripe-return",
          // Do not allow delayed payment methods (SEPA, BACS, etc.) as slot hold expires in 10 minutes (WH-1/MB-2)
          allowsDelayedPaymentMethods: false,
          // Cards only: the wallet has its own button, so this sheet always
          // shows the card form or saved cards and a "Pay £x" button.
          paymentMethodOrder: ["card"],
          primaryButtonLabel: `Pay ${formatGbp(intent.amountPence)}`,
          appearance: {
            colors: {
              primary: colors.ink as string,
              background: colors.systemBackground as string,
              componentBackground: colors.secondaryBackground as string,
              componentText: colors.label as string,
              placeholderText: colors.secondaryLabel as string,
            },
          },
        });

        if (initError) {
          Alert.alert("Payment Error", initError.message);
          setIsProcessing(false);
          return;
        }

        // 5. Present: the patient enters or picks a card and taps Pay.
        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
          // User cancelled or card declined — stay on summary screen
          if (presentError.code !== "Canceled") {
            Alert.alert("Payment Failed", presentError.message);
          }
          setIsProcessing(false);
          return;
        }
      }

      // 6. Payment collected. Ask the server to confirm now; the Stripe webhook
      // confirms the same way, so if this call fails the webhook still will
      // and the confirmed screen waits for it.
      paidRef.current = true;
      await confirmAppointment(appt.id, intent.paymentIntentId).catch(() => {});
      setIsProcessing(false);
      router.push(`/(patient)/booking/confirmed?appointmentId=${appt.id}` as any);
    } catch (err: any) {
      Alert.alert("Something went wrong", err?.message ?? "Could not process payment.");
      setIsProcessing(false);
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
