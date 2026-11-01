import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Button, Card, Input, ThemedText } from "@/components";
import { accountApi } from "@/features/account/account-api";
import { useCurrentUser } from "@/features/auth/auth-store";
import { usePatientProfile, useUpdateProfileMutation } from "@/features/hooks/use-dental-api";
import { PersonalInfoForm, PersonalInfoFormData } from "@/components/forms/PersonalInfoForm";
import { colors, spacing, radius } from "@/theme";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const userId = user?.id || "";

  const { data: profile, isLoading: isLoadingProfile, error: profileError } = usePatientProfile(userId);
  const updateProfile = useUpdateProfileMutation(userId);
  // A changed phone number waits here until the code sent to it is entered.
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const currentPhone = profile?.phone || user?.phone || "";
  const samePhone = (a: string, b: string) => a.replace(/[\s-]/g, "") === b.replace(/[\s-]/g, "");

  const verifyNewPhone = async () => {
    if (!pendingPhone) return;
    setVerifying(true);
    setCodeError(null);
    try {
      await accountApi.verifyPhoneChange(userId, pendingPhone, code.trim());
      setPendingPhone(null);
      setCode("");
      Alert.alert("Phone number updated", "Your new number is verified.", [{ text: "Done", onPress: () => router.back() }]);
    } catch (error: any) {
      setCodeError(error?.message || "That code didn't work. Check it and try again.");
    } finally {
      setVerifying(false);
    }
  };

  const resendCode = async () => {
    if (!pendingPhone) return;
    try {
      await accountApi.requestPhoneChange(userId, pendingPhone);
      setCodeError(null);
      Alert.alert("Code sent", `We've sent a new code to ${pendingPhone}.`);
    } catch (error: any) {
      setCodeError(error?.message || "We couldn't send a new code.");
    }
  };

  const handleSubmit = async (formData: PersonalInfoFormData) => {
    const phoneChanged = !samePhone(formData.phone, currentPhone);
    try {
      await updateProfile.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        gender: formData.gender,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || undefined,
        city: formData.city,
        postcode: formData.postcode,
        // A new number is saved only after it's verified (below).
        ...(phoneChanged ? {} : { phone: formData.phone }),
      });

      if (phoneChanged) {
        await accountApi.requestPhoneChange(userId, formData.phone.trim());
        setPendingPhone(formData.phone.trim());
        setCode("");
        setCodeError(null);
        return;
      }

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Haptics optional
      }

      Alert.alert("Success", "Your personal details have been updated successfully.", [
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {
        // Haptics optional
      }
      Alert.alert("Update Failed", error?.message || "Failed to update your details. Please try again.");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoadingProfile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            Failed to load your profile. Please check your connection and try again.
          </ThemedText>
        </View>
      </View>
    );
  }

  // Transform profile data to form format
  const initialData: Partial<PersonalInfoFormData> = {
    firstName: profile?.firstName || user?.firstName || "",
    lastName: profile?.lastName || user?.lastName || "",
    dob: profile?.dob ? new Date(profile.dob).toISOString().split("T")[0] : "",
    gender: (profile?.gender as any) || "prefer_not_to_say",
    addressLine1: profile?.address?.line1 || "",
    addressLine2: profile?.address?.line2 || "",
    city: profile?.address?.city || "",
    postcode: profile?.address?.postcode || "",
    phone: profile?.phone || user?.phone || "",
  };

  if (pendingPhone) {
    return (
      <View style={[styles.container, styles.codeContainer]}>
        <Card style={styles.codeCard}>
          <ThemedText variant="headline">Verify your new number</ThemedText>
          <ThemedText variant="subhead" style={styles.codeHint}>
            Your other details are saved. Enter the code we've sent by text to {pendingPhone} to change your number.
          </ThemedText>
          <Input
            label="Code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            maxLength={10}
            error={codeError ?? undefined}
          />
          <Button title="Verify and save number" size="lg" loading={verifying} disabled={code.trim().length < 4} onPress={verifyNewPhone} />
          <Button title="Send a new code" variant="secondary" size="md" onPress={resendCode} />
          <Button
            title="Keep my old number"
            variant="ghost"
            size="md"
            onPress={() => {
              setPendingPhone(null);
              router.back();
            }}
          />
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PersonalInfoForm
        initialData={initialData}
        email={profile?.email || user?.email || ""}
        isEmailVerified={user?.emailVerified ?? true}
        onSubmit={handleSubmit}
        isLoading={updateProfile.isPending}
        onCancel={handleCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  codeCard: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  codeContainer: {
    padding: spacing.md,
  },
  codeHint: {
    color: colors.secondaryLabel,
  },
  centerContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  errorContainer: {
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  errorText: {
    color: colors.danger,
    textAlign: "center",
  },
});