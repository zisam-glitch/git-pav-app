import React from "react";
import { PRACTICE_TIME_ZONE } from "@/features/booking/uk-time";
import { View, StyleSheet, ScrollView, Share } from "react-native";
import { ThemedText, Card, Button, Badge, QueryState } from "@/components";
import { colors, spacing, radius } from "@/theme";
import {
  useReferrals,
  formatPounds,
  referralShareMessage,
  type ReferralSummary,
} from "@/features/referrals/referrals-api";

// Refer-a-friend (D-03). Rules as the owner set them: a friend enters this
// code when they sign up; after their first completed visit over £150 you get
// a voucher, which the practice takes off your next bill.

const dateLabel = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { timeZone: PRACTICE_TIME_ZONE, day: "numeric", month: "short", year: "numeric" }) : "";

export default function ReferScreen() {
  const query = useReferrals();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <QueryState
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        data={query.data}
        isEmpty={() => false}
        onRetry={() => query.refetch()}
        skeletonCount={2}
      >
        {(data: ReferralSummary) => (
          <View style={styles.stack}>
            <Card style={styles.card}>
              <ThemedText variant="overline" style={styles.muted}>
                Your code
              </ThemedText>
              <ThemedText variant="largeTitle" style={styles.code} selectable accessibilityLabel={`Your code is ${data.code.split("").join(" ")}`}>
                {data.code}
              </ThemedText>
              <ThemedText variant="subhead" style={styles.muted}>
                When a friend signs up with this code and has a visit over {formatPounds(data.minVisitPence)}, you get{" "}
                {formatPounds(data.voucherPence)} off your next bill at the practice.
              </ThemedText>
              <Button
                title="Share your code"
                onPress={() => Share.share({ message: referralShareMessage(data.code) }).catch(() => {})}
              />
            </Card>

            <Card style={styles.card}>
              <ThemedText variant="headline">How it works</ThemedText>
              <ThemedText variant="subhead" style={styles.muted}>
                1. Your friend enters your code when they create their account.
              </ThemedText>
              <ThemedText variant="subhead" style={styles.muted}>
                2. Once their first visit over {formatPounds(data.minVisitPence)} is complete, your voucher appears here.
              </ThemedText>
              <ThemedText variant="subhead" style={styles.muted}>
                3. Show the voucher code at the practice and we take {formatPounds(data.voucherPence)} off your bill.
              </ThemedText>
              <ThemedText variant="caption" style={styles.muted}>
                One voucher per friend. We never tell you who used your code or what treatment they had.
              </ThemedText>
            </Card>

            <View style={styles.stack}>
              <ThemedText variant="overline" style={styles.muted}>
                Your vouchers
              </ThemedText>
              {data.vouchers.length === 0 ? (
                <Card style={styles.card}>
                  <ThemedText variant="subhead" style={styles.muted}>
                    {data.friendsJoined === 0
                      ? "No one has signed up with your code yet."
                      : `${data.friendsJoined} ${data.friendsJoined === 1 ? "friend has" : "friends have"} signed up with your code. Your voucher appears after their first qualifying visit.`}
                  </ThemedText>
                </Card>
              ) : (
                data.vouchers.map((v) => (
                  <Card key={v.voucherCode} style={styles.card}>
                    <View style={styles.row}>
                      <ThemedText variant="headline">{formatPounds(v.amountPence)} off your bill</ThemedText>
                      <Badge variant={v.usedAt ? "default" : "success"} label={v.usedAt ? "Used" : "Ready to use"} />
                    </View>
                    <ThemedText variant="title" style={styles.code} selectable>
                      {v.voucherCode}
                    </ThemedText>
                    <ThemedText variant="caption" style={styles.muted}>
                      {v.usedAt ? `Used ${dateLabel(v.usedAt)}` : `Earned ${dateLabel(v.issuedAt)}. Show this code at the practice.`}
                    </ThemedText>
                  </Card>
                ))
              )}
            </View>
          </View>
        )}
      </QueryState>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.md,
  },
  code: {
    color: colors.label,
    letterSpacing: 2,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
  },
  muted: {
    color: colors.secondaryLabel,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stack: {
    gap: spacing.md,
  },
});
