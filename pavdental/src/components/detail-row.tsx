import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";
import { ThemedText } from "./themed-text";

interface DetailRowProps {
  label: string;
  value: string;
  /** Bold value, for totals and the thing being booked */
  emphasis?: boolean;
}

/**
 * DetailRow — Wise review row ("You send exactly · 1 SGD"): grey label on the
 * left, value on the right. Long values wrap inside the row instead of
 * running off the card.
 */
export function DetailRow({ label, value, emphasis = false }: DetailRowProps) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <ThemedText variant="subhead" style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText variant={emphasis ? "headline" : "body"} style={styles.value}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  label: {
    color: colors.secondaryLabel,
    flexShrink: 0,
    maxWidth: "45%",
  },
  value: {
    color: colors.label,
    flex: 1,
    textAlign: "right",
  },
});
