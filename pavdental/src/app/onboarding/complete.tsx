import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText, Button, AppIcon, Card } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { useAuthStore } from "@/features/auth/auth-store";

export default function OnboardingCompleteScreen() {
  const router = useRouter();
  const { user: existingUser, accessToken } = useAuthStore();

  const handleEnterApp = () => {
    if (!existingUser || !accessToken) {
      router.replace("/(auth)/sign-in");
      return;
    }
    router.replace("/(patient)/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.centerBox}>
          <View style={styles.celebrationCircle}>
            <AppIcon name="check" size={36} color={colors.success} />
          </View>

          <ThemedText variant="largeTitle" style={styles.title}>
            You're all set!
          </ThemedText>

          <ThemedText variant="subhead" style={styles.subtitle}>
            Your profile and medical history have been securely logged. You can now book van visits, video consultations, and clinic visits instantly.
          </ThemedText>

          <Card elevation="flat" style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.checkIconBox}>
                <AppIcon name="checkCircle" size={16} color={colors.success} />
              </View>
              <ThemedText variant="subhead" style={styles.summaryText}>
                Patient record created
              </ThemedText>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.checkIconBox}>
                <AppIcon name="checkCircle" size={16} color={colors.success} />
              </View>
              <ThemedText variant="subhead" style={styles.summaryText}>
                Medical safeguards & allergies logged
              </ThemedText>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.checkIconBox}>
                <AppIcon name="checkCircle" size={16} color={colors.success} />
              </View>
              <ThemedText variant="subhead" style={styles.summaryText}>
                Your consent choices are saved
              </ThemedText>
            </View>
          </Card>
        </View>

        <View style={styles.actions}>
          <Button
            title="Explore Pav Dental"
            size="lg"
            arrow={true}
            onPress={handleEnterApp}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: spacing.xl,
  },
  celebrationCircle: {
    alignItems: "center",
    backgroundColor: colors.successSubtle,
    borderRadius: radius.full,
    height: 72,
    justifyContent: "center",
    marginBottom: spacing.xs,
    width: 72,
  },
  centerBox: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
  },
  checkIconBox: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  subtitle: {
    color: colors.secondaryLabel,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.sm + 2,
    marginTop: spacing.sm,
    padding: spacing.md + 2,
    width: "100%",
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  summaryText: {
    color: colors.label,
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    color: colors.label,
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },
});
