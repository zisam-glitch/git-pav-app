import { Pressable, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";
import { ThemedText } from "./themed-text";

interface SectionHeaderProps {
  /** Sentence-case grey section label ("Credit cards") */
  title: string;
  /** Optional trailing action, e.g. "See all" */
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * SectionHeader — grey sentence-case label above a group, with an optional
 * trailing action as an underlined forest-green link (Wise: "Transfer details · Change").
 */
export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <ThemedText variant="overline">{title}</ThemedText>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}
        >
          <ThemedText variant="subhead" style={styles.actionText}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 28,
    marginBottom: spacing.xxs,
  },
  action: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    minHeight: 44,
    justifyContent: "center",
  },
  actionText: {
    color: colors.ink,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
