import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThemedText } from "../themed-text";
import { Input } from "../input";
import { Button } from "../button";
import { colors, spacing, type, radius } from "@/theme";

import {
  passwordChangeSchema,
  PasswordChangeFormData,
} from "@/features/account/account-schemas";

export { passwordChangeSchema, PasswordChangeFormData };

export interface PasswordChangeFormProps {
  onSubmit: (data: PasswordChangeFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function PasswordChangeForm({
  onSubmit,
  isLoading = false,
  onCancel,
}: PasswordChangeFormProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword") || "";

  // Requirements checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

  const handleFormSubmit = async (data: PasswordChangeFormData) => {
    try {
      await onSubmit(data);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to change password. Please verify current password.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <ThemedText variant="subhead" style={styles.sectionTitle}>
            Current credentials
          </ThemedText>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={showCurrent ? "Hide current password" : "Show current password"} onPress={() => setShowCurrent(!showCurrent)}>
            <ThemedText variant="caption" style={styles.toggleShow}>
              {showCurrent ? "Hide" : "Show"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <Input
          placeholder="Enter current account password"
          secureTextEntry={!showCurrent}
          error={errors.currentPassword?.message}
          value={watch("currentPassword")}
          onChangeText={(txt) => setValue("currentPassword", txt, { shouldDirty: true, shouldValidate: true })}
          editable={!isLoading}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.labelRow}>
          <ThemedText variant="subhead" style={styles.sectionTitle}>
            New password
          </ThemedText>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={showNew ? "Hide new password" : "Show new password"} onPress={() => setShowNew(!showNew)}>
            <ThemedText variant="caption" style={styles.toggleShow}>
              {showNew ? "Hide" : "Show"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <Input
          placeholder="Create strong new password"
          secureTextEntry={!showNew}
          error={errors.newPassword?.message}
          value={newPassword}
          onChangeText={(txt) => setValue("newPassword", txt, { shouldDirty: true, shouldValidate: true })}
          editable={!isLoading}
        />

        {/* Requirements Checklist */}
        <View style={styles.requirementsCard}>
          <ThemedText variant="caption" style={styles.reqTitle}>
            Password requirements:
          </ThemedText>
          <View style={styles.reqItem}>
            <ThemedText style={hasMinLength ? styles.checkPass : styles.checkFail}>
              {hasMinLength ? "✓" : "○"}
            </ThemedText>
            <ThemedText variant="caption" style={hasMinLength ? styles.reqPassText : styles.reqText}>
              At least 8 characters
            </ThemedText>
          </View>
          <View style={styles.reqItem}>
            <ThemedText style={hasUppercase ? styles.checkPass : styles.checkFail}>
              {hasUppercase ? "✓" : "○"}
            </ThemedText>
            <ThemedText variant="caption" style={hasUppercase ? styles.reqPassText : styles.reqText}>
              At least one uppercase letter (A-Z)
            </ThemedText>
          </View>
          <View style={styles.reqItem}>
            <ThemedText style={hasLowercase ? styles.checkPass : styles.checkFail}>
              {hasLowercase ? "✓" : "○"}
            </ThemedText>
            <ThemedText variant="caption" style={hasLowercase ? styles.reqPassText : styles.reqText}>
              At least one lowercase letter (a-z)
            </ThemedText>
          </View>
          <View style={styles.reqItem}>
            <ThemedText style={hasNumber ? styles.checkPass : styles.checkFail}>
              {hasNumber ? "✓" : "○"}
            </ThemedText>
            <ThemedText variant="caption" style={hasNumber ? styles.reqPassText : styles.reqText}>
              At least one numeric digit (0-9)
            </ThemedText>
          </View>
        </View>

        <Input
          label="Confirm new password *"
          placeholder="Repeat new password"
          secureTextEntry={!showNew}
          error={errors.confirmPassword?.message}
          value={watch("confirmPassword")}
          onChangeText={(txt) => setValue("confirmPassword", txt, { shouldDirty: true, shouldValidate: true })}
          editable={!isLoading}
        />
      </View>

      <View style={styles.actions}>
        <Button
          title={isLoading ? "Updating password..." : "Update password"}
          onPress={handleSubmit(handleFormSubmit)}
          disabled={isLoading || !isDirty}
          loading={isLoading}
        />
        {onCancel ? (
          <Button
            title="Cancel"
            variant="secondary"
            onPress={onCancel}
            disabled={isLoading}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  checkFail: {
    color: colors.secondaryLabel,
    opacity: 0.6,
  },
  checkPass: {
    color: colors.success,
    fontWeight: "700",
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reqItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  reqPassText: {
    color: colors.success,
    fontWeight: "500",
  },
  reqText: {
    color: colors.secondaryLabel,
  },
  reqTitle: {
    color: colors.secondaryLabel,
    fontWeight: "600",
  },
  requirementsCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.xs,
    marginTop: spacing.xs,
    padding: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...type.overline,
  },
  toggleShow: {
    color: colors.ink,
    fontWeight: "600",
  },
});

