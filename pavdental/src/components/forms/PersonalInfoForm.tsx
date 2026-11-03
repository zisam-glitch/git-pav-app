import React from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThemedText } from "../themed-text";
import { Input } from "../input";
import { Button } from "../button";
import { Badge } from "../badge";
import { colors, spacing, type, radius } from "@/theme";

import {
  personalInfoSchema,
  PersonalInfoFormData,
} from "@/features/account/account-schemas";

export { personalInfoSchema, PersonalInfoFormData };

export interface PersonalInfoFormProps {
  initialData?: Partial<PersonalInfoFormData>;
  email?: string;
  isEmailVerified?: boolean;
  onSubmit: (data: PersonalInfoFormData) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

const GENDER_OPTIONS: { label: string; value: PersonalInfoFormData["gender"] }[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
];

export function PersonalInfoForm({
  initialData,
  email,
  isEmailVerified = false,
  onSubmit,
  isLoading = false,
  onCancel,
}: PersonalInfoFormProps) {
  const {
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      dob: initialData?.dob || "",
      gender: initialData?.gender || "prefer_not_to_say",
      addressLine1: initialData?.addressLine1 || "",
      addressLine2: initialData?.addressLine2 || "",
      city: initialData?.city || "",
      postcode: initialData?.postcode || "",
      phone: initialData?.phone || "",
    },
  });

  const selectedGender = watch("gender");

  const handleFormSubmit = async (data: PersonalInfoFormData) => {
    try {
      await onSubmit(data);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to update profile. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Account Identity (Read-only) */}
      {email ? (
        <View style={styles.section}>
          <ThemedText variant="subhead" style={styles.sectionTitle}>
            Account login email
          </ThemedText>
          <View style={styles.readOnlyCard}>
            <View style={styles.emailRow}>
              <ThemedText variant="headline">{email}</ThemedText>
              <Badge
                variant={isEmailVerified ? "success" : "warning"}
                label={isEmailVerified ? "Verified" : "Unverified"}
              />
            </View>
            <ThemedText variant="caption" style={styles.readOnlyNote}>
              Account login email is managed via security settings to protect your dental identity.
            </ThemedText>
          </View>
        </View>
      ) : null}

      {/* Personal Details */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Patient identity
        </ThemedText>

        <Input
          label="First name *"
          placeholder="Enter your first name"
          error={errors.firstName?.message}
          value={watch("firstName")}
          onChangeText={(text) => setValue("firstName", text, { shouldDirty: true, shouldValidate: true })}
          editable={!isLoading}
        />

        <Input
          label="Last name *"
          placeholder="Enter your last name"
          error={errors.lastName?.message}
          value={watch("lastName")}
          onChangeText={(text) => setValue("lastName", text, { shouldDirty: true, shouldValidate: true })}
          editable={!isLoading}
        />

        <Input
          label="Date of birth (YYYY-MM-DD) *"
          placeholder="e.g. 1990-05-14"
          error={errors.dob?.message}
          value={watch("dob")}
          onChangeText={(text) => setValue("dob", text, { shouldDirty: true, shouldValidate: true })}
          editable={!isLoading}
        />

        <View style={styles.genderContainer}>
          <ThemedText variant="subhead" style={styles.fieldLabel}>
            Gender *
          </ThemedText>
          <View style={styles.genderPills}>
            {GENDER_OPTIONS.map((opt) => {
              const active = selectedGender === opt.value;
              return (
                <Pressable accessibilityLabel={opt.label}
                  key={opt.value}
                  disabled={isLoading}
                  onPress={() => setValue("gender", opt.value, { shouldDirty: true, shouldValidate: true })}
                  style={[styles.genderPill, active && styles.genderPillActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <ThemedText
                    variant="caption"
                    style={[styles.genderPillText, active && styles.genderPillTextActive]}
                  >
                    {opt.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
          {errors.gender?.message ? (
            <ThemedText variant="caption" style={styles.fieldError}>
              {errors.gender.message}
            </ThemedText>
          ) : null}
        </View>
      </View>

      {/* Residential Address */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Residential address (UK)
        </ThemedText>

        <Input
          label="Address line 1 *"
          placeholder="Street name & house number"
          error={errors.addressLine1?.message}
          value={watch("addressLine1")}
          onChangeText={(text) => setValue("addressLine1", text, { shouldDirty: true, shouldValidate: true })}
          editable={!isLoading}
        />

        <Input
          label="Address line 2 (optional)"
          placeholder="Flat, suite, unit"
          error={errors.addressLine2?.message}
          value={watch("addressLine2")}
          onChangeText={(text) => setValue("addressLine2", text, { shouldDirty: true, shouldValidate: true })}
          editable={!isLoading}
        />

        <Input
          label="City / town *"
          placeholder="e.g. London"
          error={errors.city?.message}
          value={watch("city")}
          onChangeText={(text) => setValue("city", text, { shouldDirty: true, shouldValidate: true })}
          editable={!isLoading}
        />

        <Input
          label="Postcode *"
          placeholder="e.g. SW1A 1AA"
          autoCapitalize="characters"
          error={errors.postcode?.message}
          value={watch("postcode")}
          onChangeText={(text) => setValue("postcode", text.toUpperCase(), { shouldDirty: true, shouldValidate: true })}
          editable={!isLoading}
        />
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <ThemedText variant="subhead" style={styles.sectionTitle}>
          Direct contact
        </ThemedText>

        <Input
          label="Mobile phone *"
          placeholder="+44 7XXX XXXXXX"
          keyboardType="phone-pad"
          error={errors.phone?.message}
          value={watch("phone")}
          onChangeText={(text) => setValue("phone", text, { shouldDirty: true, shouldValidate: true })}
          editable={!isLoading}
        />
      </View>

      {/* Form Actions */}
      <View style={styles.actions}>
        <Button
          title={isLoading ? "Saving changes..." : "Save changes"}
          onPress={handleSubmit(handleFormSubmit)}
          disabled={isLoading || !isDirty}
          loading={isLoading}
        />
        {onCancel && (
          <Button
            title="Cancel"
            variant="secondary"
            onPress={onCancel}
            disabled={isLoading}
          />
        )}
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
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emailRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fieldError: {
    color: colors.danger,
    marginTop: 2,
  },
  fieldLabel: {
    fontWeight: "600",
  },
  genderContainer: {
    gap: spacing.xs,
  },
  genderPill: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  genderPillActive: {
    backgroundColor: colors.inkSubtle,
    borderColor: colors.accent,
  },
  genderPillText: {
    color: colors.secondaryLabel,
    fontWeight: "500",
  },
  genderPillTextActive: {
    color: colors.ink,
    fontWeight: "700",
  },
  genderPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  readOnlyCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.xs,
    padding: spacing.md,
  },
  readOnlyNote: {
    color: colors.secondaryLabel,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...type.overline,
    marginBottom: spacing.xs,
  },
});
