import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ThemedText, Card, ListRow, Button, Badge, AppIcon, IconTile } from "@/components";
import { ToggleSwitch } from "@/components/settings/ToggleSwitch";
import { PasswordChangeForm, PasswordChangeFormData } from "@/components/forms/PasswordChangeForm";
import { useBiometrics } from "@/features/security/biometric-hooks";
import { useCurrentUser } from "@/features/auth/auth-store";
import { useChangePasswordMutation, useResendVerificationMutation } from "@/features/account/account-hooks";
import { colors, spacing, type, radius } from "@/theme";
import { TwoStepCard } from "@/features/security/two-step-card";

export default function SecurityScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const {
    isSupported,
    isEnrolled,
    biometricType,
    isBiometricLockEnabled,
    toggleBiometricLock,
  } = useBiometrics();

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const changePassword = useChangePasswordMutation();
  const resendVerification = useResendVerificationMutation();

  const handleToggleBiometric = async (value: boolean) => {
    const success = await toggleBiometricLock(value);
    if (success) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Haptics optional
      }
    }
  };

  const handlePasswordSubmit = async (data: PasswordChangeFormData) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Haptics optional
      }

      Alert.alert("Password Updated", "Your account password has been successfully updated.", [
        {
          text: "Done",
          onPress: () => setPasswordModalVisible(false),
        },
      ]);
    } catch (err: any) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {
        // Haptics optional
      }
      Alert.alert("Failed to Update Password", err?.message || "Please check your current password.");
    }
  };

  const handleResendEmail = async () => {
    try {
      const res = await resendVerification.mutateAsync();
      Alert.alert("Email Sent", res.message || "A verification link has been sent to your inbox.");
    } catch {
      Alert.alert("Error", "Could not send verification email. Please try again later.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Biometric App Lock */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Biometric protection
        </ThemedText>
        <ToggleSwitch
          label={`${biometricType} App Lock`}
          description={
            isSupported
              ? isEnrolled
                ? `Require ${biometricType} every time you open Pav Dental`
                : "No biometrics registered on this device"
              : "Biometric hardware not available on this device"
          }
          value={isBiometricLockEnabled}
          onValueChange={handleToggleBiometric}
          disabled={!isSupported || !isEnrolled}
          icon={<AppIcon name="lock" size={18} color={colors.label} />}
        />
      </View>

      {/* Account Security */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Login & passwords
        </ThemedText>
        <Card padding="none">
          <ListRow
            title="Change account password"
            subtitle="Update your master security password"
            left={<IconTile icon="key" />}
            right={<AppIcon name="chevronRight" size={16} color={colors.tertiaryLabel} />}
            onPress={() => setPasswordModalVisible(true)}
            separator
          />
          <ListRow
            title="Active logged-in sessions"
            subtitle="View devices and sign out other sessions"
            left={<AppIcon name="smartphone" size={18} color={colors.ink} />}
            right={<AppIcon name="chevronRight" size={16} color={colors.tertiaryLabel} />}
            onPress={() => router.push("/(patient)/(tabs)/profile/sessions" as any)}
          />
        </Card>
      </View>

      {/* Two-step sign-in */}
      <View style={styles.section}>
        <TwoStepCard />
      </View>

      {/* Email Verification Status */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Verified identity
        </ThemedText>
        <View style={styles.verifyCard}>
          <View style={styles.verifyRow}>
            <View style={styles.verifyInfo}>
              <ThemedText variant="headline">{user?.email}</ThemedText>
              <ThemedText variant="caption" style={styles.verifySub}>
                {user?.emailVerified ? "Primary email is verified" : "Email address requires verification"}
              </ThemedText>
            </View>
            <Badge
              variant={user?.emailVerified ? "success" : "warning"}
              label={user?.emailVerified ? "Verified" : "Pending"}
            />
          </View>
          {!user?.emailVerified && (
            <Button
              title={resendVerification.isPending ? "Sending..." : "Resend verification email"}
              variant="secondary"
              size="sm"
              onPress={handleResendEmail}
              disabled={resendVerification.isPending}
            />
          )}
        </View>
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Data privacy & legal
        </ThemedText>
        <Card padding="none">
          <ListRow
            title="Consent & data usage"
            subtitle="Signed GDPR records & retention disclosures"
            left={<IconTile icon="fileText" />}
            right={<AppIcon name="chevronRight" size={16} color={colors.tertiaryLabel} />}
            onPress={() => router.push("/(patient)/(tabs)/profile/consent" as any)}
          />
        </Card>
      </View>

      {/* Password Change Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText variant="headline">Change password</ThemedText>
            <Button
              title="Close"
              variant="ghost"
              size="sm"
              onPress={() => setPasswordModalVisible(false)}
            />
          </View>
          <PasswordChangeForm
            onSubmit={handlePasswordSubmit}
            isLoading={changePassword.isPending}
            onCancel={() => setPasswordModalVisible(false)}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  modalContainer: {
    backgroundColor: colors.background,
    flex: 1,
  },
  modalHeader: {
    alignItems: "center",
    borderBottomColor: colors.separator,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...type.overline,
  },
  verifyCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.md,
  },
  verifyInfo: {
    flex: 1,
    gap: 2,
  },
  verifyRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  verifySub: {
    color: colors.secondaryLabel,
  },
});

