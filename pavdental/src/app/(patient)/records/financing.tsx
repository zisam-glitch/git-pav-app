import { View, StyleSheet, ScrollView, Linking } from "react-native";
import { ThemedText, Card, Button, AppIcon } from "@/components";
import { colors, spacing } from "@/theme";
import { useFinancing } from "@/features/hooks/use-dental-api";

// Payment plans are arranged through the practice's finance provider. The app
// only points patients there; it never shows limits, rates or approvals
// (decisions log #5).
const FALLBACK_FINANCE_URL = "https://www.pavdental.com/services/finance";

export default function PaymentPlansScreen() {
  const { data } = useFinancing();
  const financeUrl = data?.financeInfoUrl || FALLBACK_FINANCE_URL;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="largeTitle" style={styles.title}>
            Payment plans
          </ThemedText>
          <ThemedText variant="subhead" style={styles.subtitle}>
            You may be able to spread the cost of your treatment. Options, eligibility and
            terms are set by our finance partner and explained on our website.
          </ThemedText>
        </View>

        <Card style={styles.card}>
          <View style={styles.row}>
            <AppIcon name="creditCard" size={18} color={colors.ink} />
            <ThemedText variant="headline">See payment plan options</ThemedText>
          </View>
          <ThemedText variant="body" style={styles.body}>
            Applying is done with the finance provider, not in this app. If you have questions,
            ask the practice team at your next visit or send us a message.
          </ThemedText>
          <Button title="Open finance page" onPress={() => Linking.openURL(financeUrl).catch(() => {})} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.secondaryLabel,
    lineHeight: 20,
  },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  title: {
    color: colors.label,
  },
});
