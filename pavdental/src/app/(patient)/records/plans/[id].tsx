import { reportCaughtError } from "@/lib/caught-errors";
import { declinePlan, decisionFromStatus, findPlan, planBadge, prescribedBy, signPlan } from "@/features/records/plan-actions";
import React, { useState, useEffect } from "react";
import { PRACTICE_TIME_ZONE } from "@/features/booking/uk-time";
import { View, StyleSheet, ScrollView, Pressable, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import { safeHaptics } from "@/lib/haptics";
import { ThemedText, Card, Badge, Button, AppIcon, ConfirmSheet, Toast, ErrorState, CheckboxMark } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { toothLabel } from "@/features/records/tooth-number";
import {
  useTreatmentPlans,
  useSignTreatmentPlanMutation,
  useDeclineTreatmentPlanMutation,
  useServices,
} from "@/features/hooks/use-dental-api";
import { useCurrentUser } from "@/features/auth/auth-store";
import { formatGbp } from "@/lib/money";
import { useBookingStore } from "@/features/booking/booking-store";
import { bookingChannelFor, firstBookingStep } from "@/features/booking/start-booking";
import { serviceForPlanItem } from "@/features/booking/plan-booking";

// ─── Treatment plan detail — items, costs, progress, accept/decline ───────────
// Reference pattern: Neo Financial Contract Confirmation & Aspen Clinical E-Sign.
// Reachable from the Plans list. "Accepting" records that the patient read the
// plan (decisions log D-06); consent to treatment is taken in person.

export default function TreatmentPlanDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, signSheet } = useLocalSearchParams<{ id: string; signSheet?: string }>();
  const user = useCurrentUser();
  const { setService, setChannel } = useBookingStore();
  const userId = user?.id || "";
  const { data: apiPlans, isLoading, isError, refetch } = useTreatmentPlans(userId);
  const { data: services = [] } = useServices();
  const signPlanMutation = useSignTreatmentPlanMutation(userId);
  const declinePlanMutation = useDeclineTreatmentPlanMutation(userId);

  const [confirmDecision, setConfirmDecision] = useState<"decline" | null>(null);
  const [showSignSheet, setShowSignSheet] = useState(false);
  const [decision, setDecision] = useState<"accepted" | "declined" | null>(null);
  const [signedInfo, setSignedInfo] = useState<{
    signedAt: string;
    hash: string;
    signerName: string;
  } | null>(null);
  const [consentChecked, setConsentChecked] = useState(true);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  useEffect(() => {
    if (signSheet === "true") {
      setShowSignSheet(true);
    }
  }, [signSheet]);

  const plan = findPlan(apiPlans as any[] | undefined, id) as any;

  // A plan answered on an earlier visit shows that answer, not the buttons again.
  useEffect(() => {
    const earlier = decisionFromStatus(plan?.status);
    if (earlier) setDecision(earlier);
  }, [plan?.status]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <View style={{ padding: spacing.md, minHeight: 160, backgroundColor: colors.inkSubtle, borderRadius: radius.lg, width: "100%" }} />
        </View>
      </View>
    );
  }

  if (isError && apiPlans === undefined) {
    return (
      <View style={styles.container}>
        <ErrorState
          message="We couldn't load this treatment plan. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ThemedText variant="body" style={styles.muted}>
            This treatment plan is no longer available.
          </ThemedText>
          <Button title="Back to plans" variant="secondary" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const items: any[] = plan.items || [];
  const totalCostPence: number = plan.totalCostPence || 0;
  const completedCount = decision === "accepted" ? items.length : 0;
  const progress = items.length ? completedCount / items.length : 0;

  const prescribed = prescribedBy(plan.clinician);
  const created = new Date(plan.createdAt).toLocaleDateString("en-GB", { timeZone: PRACTICE_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleDecline = async () => {
    const outcome = await declinePlan({ decline: (planId) => declinePlanMutation.mutateAsync(planId) }, plan.id);
    setConfirmDecision(null);
    if (outcome.kind === "declined") {
      setDecision("declined");
      setToast({ message: "Treatment plan declined — clinician notified", tone: "success" });
      return;
    }
    reportCaughtError(outcome.error, "treatment plan decline failed");
    setToast({ message: outcome.message, tone: "error" });
  };

  const formatSignedAt = (when: Date) =>
    when.toLocaleTimeString("en-GB", { timeZone: PRACTICE_TIME_ZONE, hour: "2-digit", minute: "2-digit" }) +
    ", " +
    when.toLocaleDateString("en-GB", { timeZone: PRACTICE_TIME_ZONE, day: "numeric", month: "short", year: "numeric" });

  const handleSignPlan = async () => {
    const outcome = await signPlan(
      {
        // Face ID or fingerprint where the phone has it; no check where it does not (web).
        verifyIdentity: async () => {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          if (!hasHardware || !isEnrolled) return "unavailable";
          const auth = await LocalAuthentication.authenticateAsync({
            promptMessage: "Confirm it's you",
            fallbackLabel: "Use passcode",
            disableDeviceFallback: false,
          });
          return auth.success ? "verified" : "cancelled";
        },
        sign: (input) => signPlanMutation.mutateAsync(input),
      },
      plan.id,
      user
    );

    if (outcome.kind === "not-verified") {
      setToast({ message: "Biometric verification was cancelled or failed.", tone: "error" });
      return;
    }
    setShowSignSheet(false);
    if (outcome.kind === "failed") {
      reportCaughtError(outcome.error, "treatment plan sign failed");
      setToast({ message: outcome.message, tone: "error" });
      return;
    }
    safeHaptics.notificationAsync("success").catch(() => {});
    setSignedInfo({
      signedAt: formatSignedAt(outcome.signedAt ? new Date(outcome.signedAt) : new Date()),
      hash: outcome.hash,
      signerName: outcome.signerName,
    });
    setDecision("accepted");
    setToast({
      message: "Plan acknowledged — you've confirmed you've read this plan. Consent to treatment will be taken in person at your visit.",
      tone: "success",
    });
  };

  const handleBookFirstAppointment = () => {
    const matchedService = serviceForPlanItem(items[0]?.description ?? plan.title, services);

    if (matchedService) {
      setService(matchedService);
      const channel = bookingChannelFor(matchedService);
      setChannel(channel);
      router.push(firstBookingStep(channel) as never);
    } else {
      router.push("/(patient)/booking/service-catalog" as never);
    }
  };

  return (
    <View style={styles.container}>
      {toast ? <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} /> : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header card */}
        <Card style={styles.card}>
          <View style={styles.topRow}>
            <ThemedText variant="title" style={styles.planTitle}>
              {plan.title}
            </ThemedText>
            <Badge
              label={planBadge(decision).label}
              variant={planBadge(decision).variant}
            />
          </View>
          <ThemedText variant="caption" style={styles.muted}>
            Prescribed by {prescribed} · {created}
          </ThemedText>
        </Card>

        {/* Signed Legal Audit Certificate Card (Visible when signed) */}
        {decision === "accepted" && signedInfo ? (
          <Card style={styles.signedCertificateCard}>
            <View style={styles.certHeader}>
              <View style={styles.certShield}>
                <AppIcon name="shieldCheck" size={16} color={colors.success} />
              </View>
              <View style={styles.certHeaderText}>
                <ThemedText variant="headline" style={styles.certTitle}>
                  You've confirmed you read this plan
                </ThemedText>
                <ThemedText variant="caption" style={styles.certMeta}>
                  Your dentist will go through it with you and take your consent in person
                </ThemedText>
              </View>
            </View>

            <View style={styles.certDetailsBox}>
              <View style={styles.certDetailRow}>
                <ThemedText variant="caption" style={styles.certFieldLabel}>
                  Confirmed by:
                </ThemedText>
                <ThemedText variant="subhead" style={styles.certFieldValue}>
                  {signedInfo.signerName}
                </ThemedText>
              </View>
              <View style={styles.certDetailRow}>
                <ThemedText variant="caption" style={styles.certFieldLabel}>
                  Confirmed at:
                </ThemedText>
                <ThemedText variant="mono" style={styles.certMetaMono}>
                  {signedInfo.signedAt}
                </ThemedText>
              </View>
              <View style={styles.certDetailRow}>
                <ThemedText variant="caption" style={styles.certFieldLabel}>
                  Record reference:
                </ThemedText>
                <ThemedText variant="mono" style={styles.certMetaMono}>
                  {signedInfo.hash || "Recorded on our servers"}
                </ThemedText>
              </View>
            </View>

            <Button
              title="Book first treatment appointment"
              arrow
              variant="primary"
              size="lg"
              onPress={handleBookFirstAppointment}
              style={styles.bookFirstBtn}
            />
          </Card>
        ) : null}

        {/* Progress ring card */}
        <Card elevation="flat" style={styles.progressCard}>
          <View style={styles.ring}>
            <ThemedText variant="mono" style={styles.ringText}>
              {Math.round(progress * 100)}%
            </ThemedText>
          </View>
          <View style={styles.progressInfo}>
            <ThemedText variant="subhead" style={styles.progressTitle}>
              {decision === "accepted" ? "Plan accepted — all items ready to schedule" : "Awaiting patient authorization"}
            </ThemedText>
            <ThemedText variant="caption" style={styles.muted}>
              {items.length} clinical step{items.length !== 1 ? "s" : ""} · {formatGbp(totalCostPence)} total
            </ThemedText>
          </View>
        </Card>

        {/* Items */}
        <View style={styles.section}>
          <ThemedText variant="overline">What's included</ThemedText>
          {items.map((item) => (
            <Card key={item.id} elevation="flat" style={styles.itemCard}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <ThemedText variant="subhead" style={styles.itemName}>
                    {item.description}
                  </ThemedText>
                  <ThemedText variant="caption" style={styles.itemMeta}>
                    #{item.code}
                    {item.toothNumber ? ` · ${toothLabel(item.toothNumber)}` : ""}
                  </ThemedText>
                </View>
                <ThemedText variant="mono" style={styles.itemCost}>
                  {formatGbp(item.costPence || 0)}
                </ThemedText>
              </View>
            </Card>
          ))}
        </View>

        {/* Total + finance callout */}
        <Card style={styles.card}>
          <View style={styles.topRow}>
            <ThemedText variant="subhead" style={styles.muted}>
              Total treatment estimate
            </ThemedText>
            <ThemedText variant="title" style={styles.totalPrice}>
              {formatGbp(totalCostPence)}
            </ThemedText>
          </View>
          {totalCostPence > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ask about payment plans, learn more"
              onPress={() => router.push("/(patient)/records/financing" as never)}
              style={styles.financeBox}
            >
              <View style={styles.financeLeft}>
                <AppIcon name="creditCard" size={16} color={colors.ink} />
                <ThemedText variant="caption" style={styles.financeText}>
                  Ask about payment plans
                </ThemedText>
              </View>
              <ThemedText variant="caption" style={styles.financeLink}>
                Learn more
              </ThemedText>
            </Pressable>
          ) : null}
        </Card>
      </ScrollView>

      {/* Decision footer */}
      {!decision ? (
        <View style={[styles.footerBar, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
          <Button
            title="Review this plan"
            size="lg"
            style={styles.footerBtn}
            onPress={() => setShowSignSheet(true)}
          />
          <Button
            title="Decline"
            variant="ghost"
            size="lg"
            style={styles.footerBtnDecline}
            onPress={() => setConfirmDecision("decline")}
          />
        </View>
      ) : null}

      {/* Frame 4: Neo Financial Legal E-Signature Sheet Modal */}
      <Modal
        visible={showSignSheet}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSignSheet(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.modalBackdrop} onPress={() => setShowSignSheet(false)} />

          <View style={styles.sheetContainer}>
            <View style={styles.sheetGrabber} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderText}>
                <ThemedText variant="headline" style={styles.sheetTitle}>
                  Confirm you have read this plan
                </ThemedText>
                <ThemedText variant="caption" style={styles.sheetSub}>
                  This is not consent to treatment
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => setShowSignSheet(false)}
                style={styles.closeBtn}
              >
                <AppIcon name="close" size={16} color={colors.ink} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScroll}
            >
              {/* Itemized Recap */}
              <Card elevation="flat" style={styles.sheetSummaryCard}>
                <View style={styles.summaryTopRow}>
                  <ThemedText variant="subhead" style={styles.summaryTitle}>
                    {plan.title}
                  </ThemedText>
                  <ThemedText variant="title" style={styles.summaryPrice}>
                    {formatGbp(totalCostPence)}
                  </ThemedText>
                </View>
                <ThemedText variant="caption" style={styles.muted}>
                  Prescribed by {prescribed}
                </ThemedText>

                <View style={styles.miniItemsDivider} />

                {items.map((it) => (
                  <View key={it.id} style={styles.miniItemRow}>
                    <ThemedText variant="caption" style={styles.miniItemText} numberOfLines={1}>
                      • {it.description} {it.toothNumber ? `(#${it.toothNumber})` : ""}
                    </ThemedText>
                    <ThemedText variant="mono" style={styles.miniItemCost}>
                      {formatGbp(it.costPence || 0)}
                    </ThemedText>
                  </View>
                ))}
              </Card>

              {/* Payment plans: details live on the practice's finance page */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ask about payment plans"
                onPress={() => {
                  setShowSignSheet(false);
                  router.push("/(patient)/records/financing" as never);
                }}
                style={styles.modalFinancePill}
              >
                <AppIcon name="creditCard" size={14} color={colors.ink} />
                <ThemedText variant="caption" style={styles.modalFinanceText}>
                  Ask about payment plans
                </ThemedText>
              </Pressable>

              {/* GDC Legal Disclosure Card */}
              <Card elevation="flat" style={styles.consentCard}>
                <View style={styles.consentHeader}>
                  <AppIcon name="shieldCheck" size={16} color={colors.ink} />
                  <ThemedText variant="caption" style={styles.consentHeaderText}>
                    What this means
                  </ThemedText>
                </View>
                <ThemedText variant="caption" style={styles.consentBody}>
                  I have read this treatment plan and the estimated fees. I understand my dentist will explain the options, risks and alternatives, and ask for my consent, before any treatment starts.
                </ThemedText>

                {/* Consent checkbox */}
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityLabel="I have read this treatment plan"
                  accessibilityState={{ checked: consentChecked }}
                  onPress={() => {
                    safeHaptics.impactAsync("light").catch(() => {});
                    setConsentChecked(!consentChecked);
                  }}
                  style={styles.checkboxRow}
                >
                  <CheckboxMark checked={consentChecked} />
                  <ThemedText variant="caption" style={styles.checkboxLabel}>
                    I have read this treatment plan
                  </ThemedText>
                </Pressable>
              </Card>

            </ScrollView>

            {/* Authorize CTA */}
            <View style={styles.sheetFooter}>
              <Button
                title={consentChecked ? "Confirm" : "Tick the box to confirm"}
                variant="primary"
                size="lg"
                disabled={!consentChecked}
                onPress={handleSignPlan}
              />
              <Button
                title="Cancel"
                variant="ghost"
                size="md"
                onPress={() => setShowSignSheet(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Decline confirm sheet */}
      {confirmDecision ? (
        <ConfirmSheet
          title="Decline this plan?"
          message="Your clinician will be notified. The plan stays in your records if you change your mind later."
          confirmLabel="Decline plan"
          cancelLabel="Review again"
          variant="destructive"
          onConfirm={handleDecline}
          onCancel={() => setConfirmDecision(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  centered: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.xl,
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
  financeBox: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xxs,
    padding: spacing.sm,
  },
  financeLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
  },
  financeText: {
    color: colors.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  financeLink: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  footerBar: {
    backgroundColor: colors.background,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  footerBtn: {
    flex: 2,
  },
  footerBtnDecline: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: colors.systemBackground,
    padding: spacing.sm,
  },
  itemCost: {
    color: colors.ink,
    fontWeight: "700",
  },
  itemInfo: {
    flex: 1,
  },
  itemMeta: {
    color: colors.secondaryLabel,
  },
  itemName: {
    color: colors.label,
  },
  itemRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  muted: {
    color: colors.secondaryLabel,
  },
  planTitle: {
    color: colors.label,
    flex: 1,
  },
  progressCard: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  progressInfo: {
    flex: 1,
    gap: 2,
  },
  progressTitle: {
    color: colors.label,
  },
  ring: {
    alignItems: "center",
    backgroundColor: colors.systemBackground,
    borderColor: colors.success,
    borderRadius: radius.full,
    borderWidth: 3,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  ringText: {
    color: colors.label,
    fontSize: 13,
    fontWeight: "700",
  },
  section: {
    gap: spacing.xs,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  totalPrice: {
    color: colors.label,
    fontWeight: "700",
  },
  /* Signed Certificate Styles */
  signedCertificateCard: {
    backgroundColor: colors.successSubtle,
    borderColor: colors.successSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  certHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  certShield: {
    alignItems: "center",
    backgroundColor: colors.successSubtle,
    borderRadius: radius.full,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  certHeaderText: {
    flex: 1,
  },
  certTitle: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "700",
  },
  certMeta: {
    color: colors.success,
    fontSize: 11,
  },
  certDetailsBox: {
    backgroundColor: colors.systemBackground,
    borderColor: colors.successSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
    padding: spacing.sm,
  },
  certDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  certFieldLabel: {
    color: colors.secondaryLabel,
    fontSize: 11,
  },
  certFieldValue: {
    color: colors.label,
    fontSize: 13,
    fontWeight: "600",
  },
  certMetaMono: {
    color: colors.label,
    fontSize: 11,
  },
  bookFirstBtn: {
    marginTop: spacing.xxs,
  },
  /* Sheet Modal Styles */
  modalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: colors.sheet,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    gap: spacing.sm,
    maxHeight: "88%",
    paddingBottom: 28,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
  },
  sheetGrabber: {
    alignSelf: "center",
    backgroundColor: colors.separator,
    borderRadius: radius.xs,
    height: 4,
    marginBottom: spacing.xs,
    width: 36,
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  sheetHeaderText: {
    flex: 1,
  },
  sheetTitle: {
    color: colors.label,
    fontSize: 17,
    fontWeight: "700",
  },
  sheetSub: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  closeBtn: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  sheetScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sheetSummaryCard: {
    backgroundColor: colors.systemBackground,
    gap: 4,
    padding: spacing.sm,
  },
  summaryTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  summaryTitle: {
    // Takes the space left by the price, so a long plan name wraps instead
    // of pushing the total off the sheet.
    flex: 1,
    color: colors.label,
    fontSize: 14,
    fontWeight: "600",
  },
  summaryPrice: {
    color: colors.label,
    fontSize: 17,
    fontWeight: "700",
  },
  miniItemsDivider: {
    backgroundColor: colors.separator,
    height: 1,
    marginVertical: 4,
  },
  miniItemRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  miniItemText: {
    color: colors.label,
    flex: 1,
    fontSize: 13,
  },
  miniItemCost: {
    color: colors.secondaryLabel,
    fontSize: 11,
  },
  modalFinancePill: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalFinanceText: {
    color: colors.ink,
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
  },
  consentCard: {
    backgroundColor: colors.systemBackground,
    gap: 6,
    padding: spacing.sm,
  },
  consentHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  consentHeaderText: {
    color: colors.secondaryLabel,
    fontSize: 11,
    fontWeight: "700",
  },
  consentBody: {
    color: colors.label,
    fontSize: 13,
    lineHeight: 17,
  },
  checkboxRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  checkboxLabel: {
    color: colors.label,
    flex: 1,
    fontSize: 13,
  },
  sheetFooter: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
});
