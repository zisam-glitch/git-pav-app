import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components";
import { useCurrentUser } from "@/features/auth/auth-store";
import { usePatientProfile, useUpdateProfileMutation } from "@/features/hooks/use-dental-api";
import { EmergencyContactForm, EmergencyContactFormData } from "@/components/forms/EmergencyContactForm";
import { colors, spacing, radius } from "@/theme";

export default function EmergencyContactScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const userId = user?.id || "";

  const { data: profile, isLoading: isLoadingProfile, error: profileError } = usePatientProfile(userId);
  const updateProfile = useUpdateProfileMutation(userId);

  const handleSubmit = async (formData: EmergencyContactFormData) => {
    try {
      await updateProfile.mutateAsync({
        emergencyContactName: formData.name,
        emergencyContactPhone: formData.phone,
        emergencyContactRelationship: formData.relationship,
        emergencyContactAlternativePhone: formData.alternativePhone || null,
      });

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Haptics optional
      }

      Alert.alert("Saved", "Emergency contact details updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {
        // Haptics optional
      }
      Alert.alert("Error", error?.message || "Failed to update emergency contact.");
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
            Unable to load emergency contact details.
          </ThemedText>
        </View>
      </View>
    );
  }

  const initialData: Partial<EmergencyContactFormData> = {
    name: profile?.emergencyContact?.name || "",
    phone: profile?.emergencyContact?.phone || "",
    relationship: (profile?.emergencyContactRelationship as any) || "Spouse / Partner",
    alternativePhone: profile?.emergencyContactAlternativePhone || "",
  };

  return (
    <View style={styles.container}>
      <EmergencyContactForm
        initialData={initialData}
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

