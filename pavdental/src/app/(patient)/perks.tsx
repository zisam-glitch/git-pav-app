import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText, Card, Button, AppIcon, Badge, Toast, IconButton } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useRewards, useRedeemRewardMutation } from "@/features/hooks/use-dental-api";
import { formatGbp } from "@/features/booking/booking-api";

// Everything here comes from the server (decisions log #14): points are
// earned only for completed visits and spent as money off a later deposit.
interface RewardItem {
  id: string;
  title: string;
  category: string;
  pointsCost: number;
  discountPence: number;
  description: string;
}

interface Voucher {
  id: string;
  voucherCode: string;
  rewardTitle: string;
  discountPence: number;
}

export default function OralHealthPerksScreen() {
  const router = useRouter();
  const { data: rewardsData, isLoading, isError } = useRewards();
  const redeemMutation = useRedeemRewardMutation();
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const pointsBalance: number = rewardsData?.pointsBalance ?? 0;
  const pointsPerVisit: number | undefined = rewardsData?.pointsPerCompletedVisit;
  const catalog: RewardItem[] = rewardsData?.catalog ?? [];
  const vouchers: Voucher[] = rewardsData?.vouchers ?? [];

  const handleRedeem = async (item: RewardItem) => {
    try {
      const res = await redeemMutation.mutateAsync({ rewardId: item.id });
      setSelectedReward(null);
      setToast({
        message: `Voucher ${res.voucherCode} added. You can use it when you pay your next deposit.`,
        tone: "success",
      });
    } catch (err: unknown) {
      setSelectedReward(null);
      const msg = err instanceof Error ? err.message : "Could not redeem points";
      setToast({ message: msg, tone: "error" });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {toast ? <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} /> : null}

      <View style={styles.topNav}>
        <IconButton
          icon="arrowLeft"
          label="Go back"
          variant="soft"
          size={22}
          onPress={() => router.back()}
        />
        <ThemedText variant="headline" style={styles.navTitle}>Rewards & perks</ThemedText>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Points Hero Card */}
        <Card elevation="flat" style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <ThemedText variant="caption" style={styles.heroLabel}>Your reward balance</ThemedText>
              <ThemedText variant="largeTitle" style={styles.heroPoints}>
                {isLoading ? "–" : pointsBalance.toLocaleString("en-GB")}
              </ThemedText>
              <ThemedText variant="caption" style={styles.heroSub}>
                {isError ? "Couldn't load your points. Try again later." : "Active points available"}
              </ThemedText>
            </View>
          </View>
          <View style={styles.heroNoticeRow}>
            <AppIcon name="info" size={14} color="rgba(255, 255, 255, 0.7)" />
            <ThemedText variant="caption" style={styles.heroNoticeText}>
              {pointsPerVisit
                ? `Earn ${pointsPerVisit} points per completed visit. Spend as money off deposits.`
                : "Earn points for every completed visit. Spend as money off deposits."}
            </ThemedText>
          </View>
        </Card>

        {vouchers.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText variant="headline" style={styles.sectionTitle}>
                Your vouchers
              </ThemedText>
              <ThemedText variant="caption" style={styles.sectionMuted}>
                Choose a voucher when you pay the deposit for your next booking.
              </ThemedText>
            </View>
            <Card elevation="flat" style={styles.vouchersCard}>
              {vouchers.map((v, i) => (
                <View key={v.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.voucherRow}>
                    <View style={styles.voucherLeft}>
                      <View style={styles.voucherIconBox}>
                        <AppIcon name="tag" size={16} color={colors.ink} />
                      </View>
                      <ThemedText variant="subhead" style={styles.voucherDiscount}>
                        {formatGbp(v.discountPence)} off a deposit
                      </ThemedText>
                    </View>
                    <View style={styles.promoCodePill}>
                      <ThemedText variant="caption" style={styles.promoCodeText}>{v.voucherCode}</ThemedText>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}

        <View style={styles.sectionHeader}>
          <ThemedText variant="headline" style={styles.sectionTitle}>
            Available rewards
          </ThemedText>
          <ThemedText variant="caption" style={styles.sectionMuted}>
            Redeem points for treatment discounts & perks.
          </ThemedText>
        </View>

        <View style={styles.catalogGrid}>
          {catalog.map((item) => {
            const canAfford = pointsBalance >= item.pointsCost;
            return (
              <Card key={item.id} elevation="flat" style={styles.itemCard}>
                <View style={styles.itemTopRow}>
                  <Badge label={item.category} variant="info" />
                  <ThemedText variant="headline" style={styles.pointsCostTag}>
                    {item.pointsCost} pts
                  </ThemedText>
                </View>

                <ThemedText variant="headline" style={styles.itemTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText variant="caption" style={styles.itemDesc}>
                  {item.description}
                </ThemedText>

                <Button
                  title={canAfford ? "Redeem voucher" : `Need ${item.pointsCost - pointsBalance} more pts`}
                  variant={canAfford ? "primary" : "secondary"}
                  size="sm"
                  arrow={canAfford}
                  disabled={!canAfford}
                  onPress={() => setSelectedReward(item)}
                  style={styles.redeemBtn}
                />
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {selectedReward && (
        <Modal visible animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <ThemedText variant="largeTitle" style={styles.modalTitle}>
                Confirm redemption
              </ThemedText>
              <ThemedText variant="subhead" style={styles.modalSub}>
                Swap {selectedReward.pointsCost} points for {selectedReward.title.toLowerCase()}?
              </ThemedText>

              <Card elevation="flat" style={styles.modalCard}>
                <View style={styles.modalRow}>
                  <ThemedText variant="caption" style={styles.modalLabel}>Points balance</ThemedText>
                  <ThemedText variant="subhead" style={styles.modalValue}>{pointsBalance} pts</ThemedText>
                </View>
                <View style={styles.modalRow}>
                  <ThemedText variant="caption" style={styles.modalLabel}>Cost</ThemedText>
                  <ThemedText variant="subhead" style={styles.costNegative}>–{selectedReward.pointsCost} pts</ThemedText>
                </View>
                <View style={styles.divider} />
                <View style={styles.modalRow}>
                  <ThemedText variant="caption" style={styles.modalLabel}>Remaining balance</ThemedText>
                  <ThemedText variant="headline" style={styles.modalRemaining}>{pointsBalance - selectedReward.pointsCost} pts</ThemedText>
                </View>
              </Card>

              <View style={styles.modalActions}>
                <Button
                  title={redeemMutation.isPending ? "Redeeming…" : "Confirm & redeem"}
                  size="lg"
                  arrow={true}
                  loading={redeemMutation.isPending}
                  onPress={() => handleRedeem(selectedReward)}
                />
                <Button title="Cancel" variant="ghost" size="md" onPress={() => setSelectedReward(null)} />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  catalogGrid: {
    gap: spacing.sm,
  },
  costNegative: {
    color: colors.danger,
    fontWeight: "700",
  },
  divider: {
    backgroundColor: colors.separator,
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.xs,
  },
  heroCard: {
    backgroundColor: colors.ink,
    borderCurve: "continuous",
    borderRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.lg,
  },
  heroLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 11,
    fontWeight: "700",
  },
  heroNoticeRow: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroNoticeText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 13,
    flex: 1,
  },
  heroPoints: {
    color: colors.alwaysWhite,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -1,
    marginVertical: 2,
  },
  heroSub: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  heroTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemCard: {
    backgroundColor: colors.systemBackground,
    borderCurve: "continuous",
    borderRadius: radius.lg,
    gap: spacing.xs,
    padding: spacing.md,
  },
  itemDesc: {
    color: colors.secondaryLabel,
    fontSize: 13,
    lineHeight: 18,
  },
  itemTitle: {
    color: colors.label,
    fontWeight: "700",
    marginTop: 2,
  },
  itemTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalActions: {
    gap: spacing.xs,
    marginTop: spacing.md,
    width: "100%",
  },
  modalCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.xs,
    marginVertical: spacing.md,
    padding: spacing.md,
    width: "100%",
  },
  modalLabel: {
    color: colors.secondaryLabel,
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalRemaining: {
    color: colors.ink,
    fontWeight: "700",
  },
  modalRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalSheet: {
    alignItems: "center",
    backgroundColor: colors.sheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    width: "100%",
  },
  modalSub: {
    color: colors.secondaryLabel,
    marginTop: spacing.xxs,
    textAlign: "center",
  },
  modalTitle: {
    color: colors.label,
    fontWeight: "700",
    textAlign: "center",
  },
  modalValue: {
    fontWeight: "600",
  },
  navSpacer: {
    width: 44,
  },
  navTitle: {
    color: colors.label,
    fontWeight: "700",
  },
  pointsCostTag: {
    color: colors.ink,
    fontWeight: "700",
  },
  promoCodePill: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  promoCodeText: {
    color: colors.ink,
    fontFamily: "Courier",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  redeemBtn: {
    marginTop: spacing.xs,
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    gap: 2,
    marginTop: spacing.xs,
  },
  sectionMuted: {
    color: colors.secondaryLabel,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    color: colors.label,
    fontWeight: "700",
    fontSize: 17,
  },
  topNav: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  voucherDiscount: {
    fontWeight: "600",
  },
  voucherIconBox: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.full,
    height: 32,
    justifyContent: "center",
    width: 32,
    borderColor: colors.separator,
    borderWidth: 1,
  },
  voucherLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  voucherRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  vouchersCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
});
