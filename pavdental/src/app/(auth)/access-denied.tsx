import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Button, ThemedText } from "@/components";
import { authApi } from "@/features/auth/auth-api";
import { colors, spacing } from "@/theme";

export default function AccessDeniedScreen() {
  const router = useRouter();

  async function handleSignOut() {
    await authApi.signOut();
    router.replace("/(auth)/welcome");
  }

  return (
    <View style={styles.container}>
      <ThemedText variant="largeTitle" style={styles.title}>
        This account uses the staff portal
      </ThemedText>
      <ThemedText variant="body" style={styles.body}>
        Please use the Pav Dental web dashboard. Patient, clinician, and van operator accounts have dedicated mobile access.
      </ThemedText>
      <Button title="Sign out" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.secondaryLabel, lineHeight: 22, textAlign: "center" },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.lg,
  },
  title: { color: colors.label, textAlign: "center" },
});
