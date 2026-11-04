import { View, StyleSheet } from "react-native";
import { colors, radius } from "@/theme";
import { ThemedText } from "./themed-text";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantMap: Record<BadgeVariant, { bg: any; text: any }> = {
  default: { bg: colors.inkSubtle, text: colors.secondaryLabel },
  success: { bg: colors.successSubtle, text: colors.success },
  warning: { bg: colors.warningSubtle, text: colors.warning },
  danger: { bg: colors.dangerSubtle, text: colors.danger },
  info: { bg: colors.infoSubtle, text: colors.info },
};

/**
 * Badge — compact status pill (Wise "Very secure", "Refunded" status tags).
 * Use for appointment states, booking statuses, and notification counts.
 */
export function Badge({ label, variant = "default" }: BadgeProps) {
  const { bg, text } = variantMap[variant];
  return (
    <View
      style={[styles.base, { backgroundColor: bg }]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <ThemedText variant="micro" style={[styles.label, { color: text }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: {
    fontWeight: "600",
  },
});

