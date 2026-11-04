import { Pressable, StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { safeHaptics } from "@/lib/haptics";
import { colors, spacing, radius } from "@/theme";
import { ThemedText } from "./themed-text";

type ChipTone = "neutral" | "fill" | "ink" | "success" | "info" | "warning";

interface ChipPillProps {
  label: string;
  /** ink = selected/emphasis; neutral = resting; status tones for meta chips */
  tone?: ChipTone;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const toneMap: Record<ChipTone, { bg: string; text: string }> = {
  // Neutral chip on the white canvas (Wise filter pills)
  neutral: { bg: colors.inkSubtle, text: colors.label },
  // White chip for use on neutral cards
  fill: { bg: colors.background, text: colors.label },
  // Selected: Wise bright green with forest text
  ink: { bg: colors.accent, text: colors.onAccent },
  success: { bg: colors.successSubtle, text: colors.success },
  info: { bg: colors.infoSubtle, text: colors.info },
  warning: { bg: colors.warningSubtle, text: colors.warning },
};

/**
 * ChipPill — capsule chip for filters, meta labels, and choice rows
 * (Wise pattern: "Send · Add money · Request" pills, filter chips).
 * Pass onPress for interactive chips; without it the chip is static meta.
 */
export function ChipPill({ label, tone = "neutral", selected, onPress, style }: ChipPillProps) {
  const t = selected ? toneMap.ink : toneMap[tone];
  const interactive = !!onPress;

  const content = (
    <View style={[styles.base, { backgroundColor: t.bg }, style]}>
      <ThemedText variant="footnote" style={[styles.label, { color: t.text }]} numberOfLines={1}>
        {label}
      </ThemedText>
    </View>
  );

  if (!interactive) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      onPress={() => {
        safeHaptics.impactAsync("light").catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  label: {
    fontWeight: "600",
  },
});
