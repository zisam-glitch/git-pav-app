import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components";
import { useCurrentUser } from "@/features/auth/auth-store";
import { usePatientProfile, useUpdateProfileMutation } from "@/features/hooks/use-dental-api";
import { MedicalHistoryForm, MedicalHistoryFormData } from "@/components/forms/MedicalHistoryForm";
import { colors, spacing, radius } from "@/theme";
import { useProtectedScreen } from "@/features/screen-security/screen-security";

export default function MedicalHistoryScreen() {
  useProtectedScreen("medical-history");
  const router = useRouter();
  const user = useCurrentUser();
  const userId = user?.id || "";

  const { data: profile, isLoading: isLoadingProfile, error: profileError } = usePatientProfile(userId);
  const updateProfile = useUpdateProfileMutation(userId);

  const handleSubmit = async (formData: MedicalHistoryFormData) => {
    try {
      await updateProfile.mutateAsync({
        medicalHistory: formData,
      });

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Haptics optional
      }

      Alert.alert("Medical Records Updated", "Your medical history and clinical precautions have been safely recorded.", [
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {
        // Haptics optional
      }
      Alert.alert("Error", error?.message || "Failed to update medical history. Please try again.");
    }
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
            Unable to load clinical records. Please try again.
          </ThemedText>
        </View>
      </View>
    );
  }

  const savedHistory = (profile?.medicalHistory as Partial<MedicalHistoryFormData>) || {};

  return (
    <View style={styles.container}>
      <MedicalHistoryForm
        initialData={savedHistory}
        onSubmit={handleSubmit}
        isLoading={updateProfile.isPending}
        onCancel={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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

