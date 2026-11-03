import {
  Pressable,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { safeHaptics } from "@/lib/haptics";
import { colors, spacing, sizes } from "@/theme";
import { ThemedText } from "./themed-text";
import { AppIcon } from "./app-icon";

interface ListRowProps {
  /** Primary label */
  title: string;
  /** Optional secondary label below title */
  subtitle?: string;
  /** Slot rendered on the left (icon, avatar, etc.) */
  left?: React.ReactNode;
  /** Slot rendered on the right (badge, value, chevron, toggle) */
  right?: React.ReactNode;
  /** Trailing grey chevron, as on every tappable reference row */
  chevron?: boolean;
  /** Show separator line below the row */
  separator?: boolean;
  /** "card" pads the row for a card; "flush" lines it up with the page gutter (Wise settings lists) */
  inset?: "card" | "flush";
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * ListRow — the standard list item primitive (Wise settings rows): 72pt row,
 * semibold 16pt title, 14pt grey subtitle, chevron, no fill of its own so it
 * sits on the canvas or a card. Divider inset to the text column.
 * Pass left/right slots for icons, badges, or interactive controls.
 * Do not add more content props — compose with slots instead.
 */
export function ListRow({
  title,
  subtitle,
  left,
  right,
  chevron = false,
  separator = false,
  inset = "card",
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ListRowProps) {
  const inner = (
    <View style={[styles.row, inset === "flush" && styles.rowFlush, style]}>
      {left ? <View style={styles.leftSlot}>{left}</View> : null}

      <View style={styles.content}>
        <ThemedText variant="headline" style={styles.titleText}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText variant="footnote" style={styles.subtitleText}>{subtitle}</ThemedText>
        ) : null}
      </View>

      {right ? <View style={styles.rightSlot}>{right}</View> : null}
      {chevron ? (
        <AppIcon name="chevronRight" size={20} color={colors.label} style={styles.chevron} />
      ) : null}

      {separator ? <View style={styles.separator} /> : null}
    </View>
  );

  if (!onPress) return inner;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      onPress={() => {
        safeHaptics.impactAsync("light").catch(() => {});
        onPress();
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 2,
  },
  leftSlot: {
    marginRight: spacing.md,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
  rightSlot: {
    marginLeft: spacing.sm,
  },
  row: {
    minHeight: sizes.row,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  rowFlush: {
    paddingHorizontal: 0,
  },
  titleText: {
    color: colors.label,
  },
  subtitleText: {
    color: colors.secondaryLabel,
  },
  separator: {
    backgroundColor: colors.separator,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    left: spacing.gutter,
    position: "absolute",
    right: 0,
  },
});

