import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ThemedText, Card, Button, Input, AppIcon } from "@/components";
import { useDeleteAccountMutation } from "@/features/account/account-hooks";
import { colors, spacing, type, radius } from "@/theme";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const deleteAccount = useDeleteAccountMutation();
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");

  const handleDelete = () => {
    if (confirmText !== "DELETE") {
      Alert.alert("Confirmation Required", 'Please type "DELETE" into the box to confirm account closure.');
      return;
    }

    Alert.alert(
      "Final Confirmation",
      "Are you sure? You'll be signed out straight away and won't be able to sign in again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Permanently Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteAccount.mutateAsync({
                reason: reason.trim() || undefined,
                confirmPassword: password,
              });

              try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              } catch {
                // optional
              }

              Alert.alert("Account Closed", result.message ?? "Your account is closed and you have been signed out.", [
                {
                  text: "OK",
                  onPress: () => {
                    router.replace("/(auth)/welcome");
                  },
                },
              ]);
            } catch (err: any) {
              if (err?.code === "UPCOMING_BOOKINGS") {
                Alert.alert(
                  "Cancel your appointments first",
                  "You have upcoming appointments. Please cancel them before closing your account, as you won't be able to sign in afterwards. The usual deposit refund rules apply.",
                  [
                    { text: "Not now", style: "cancel" },
                    { text: "View appointments", onPress: () => router.replace("/(patient)/(tabs)/appointments") },
                  ]
                );
                return;
              }
              Alert.alert("Error", err?.message || "Failed to delete account. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Warning Banner */}
      <View style={styles.warningCard}>
        <AppIcon name="alert" size={24} color={colors.danger} />
        <View style={styles.warningTextWrap}>
          <ThemedText variant="headline" style={styles.warningTitle}>
            Irreversible account closure
          </ThemedText>
          <ThemedText variant="caption" style={styles.warningSub}>
            You'll be signed out on every device straight away. Please cancel any upcoming appointments first. We then erase your personal details within one month.
          </ThemedText>
        </View>
      </View>

      {/* Statutory Retention Notice */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          How long we keep dental records
        </ThemedText>
        <Card style={styles.retentionCard}>
          <ThemedText variant="caption" style={styles.retentionText}>
            We must keep dental records for a period after your last treatment. Our privacy notice sets out how long; the draft periods are being reviewed by our legal adviser.
          </ThemedText>
          <ThemedText variant="caption" style={styles.retentionText}>
            Your login, contact details, saved cards, notifications and rewards are erased. Your dental records are kept, securely, until the retention period ends.
          </ThemedText>
        </Card>
      </View>

      {/* Feedback / Reason */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Reason for leaving (optional)
        </ThemedText>
        <Input
          placeholder="Help us improve our service..."
          value={reason}
          onChangeText={setReason}
          multiline
        />
      </View>

      {/* Confirmation Input */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Type "DELETE" to confirm
        </ThemedText>
        <Input
          placeholder="DELETE"
          autoCapitalize="characters"
          value={confirmText}
          onChangeText={setConfirmText}
        />

        <Input
          label="Account password"
          placeholder="Verify account password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Action Button */}
      <View style={styles.actions}>
        <Button
          title={deleteAccount.isPending ? "Closing account..." : "Permanently delete account"}
          variant="destructive"
          onPress={handleDelete}
          disabled={confirmText !== "DELETE" || deleteAccount.isPending}
          loading={deleteAccount.isPending}
        />
        <Button
          title="Keep my account"
          variant="secondary"
          onPress={() => router.back()}
          disabled={deleteAccount.isPending}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  retentionCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.xs,
    padding: spacing.md,
  },
  retentionText: {
    color: colors.secondaryLabel,
    lineHeight: 18,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...type.overline,
  },
  warningCard: {
    backgroundColor: colors.dangerSubtle,
    borderColor: colors.danger,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  warningSub: {
    color: colors.secondaryLabel,
    lineHeight: 18,
  },
  warningTextWrap: {
    flex: 1,
    gap: 2,
  },
  warningTitle: {
    color: colors.danger,
  },
});

