import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors, radius, sizes } from "@/theme";
import { AppIcon, type AppIconName } from "./app-icon";

interface IconTileProps {
  icon: AppIconName;
  /** Outlined white circle (Wise default), neutral fill, or forest green */
  tone?: "fill" | "surface" | "ink";
  size?: number;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
}

const toneMap = {
  fill: { bg: colors.background, fg: colors.label, border: colors.separator },
  surface: { bg: colors.inkSubtle, fg: colors.label, border: "transparent" },
  ink: { bg: colors.ink, fg: colors.onInk, border: "transparent" },
} as const;

/**
 * IconTile — the 48pt round outlined icon that leads Wise list rows
 * ("Security and privacy", "Notifications"). Decorative: hidden from screen readers.
 */
export function IconTile({ icon, tone = "fill", size = sizes.iconTile, iconColor, style }: IconTileProps) {
  const t = toneMap[tone];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.tile, { width: size, height: size, backgroundColor: t.bg, borderColor: t.border }, style]}
    >
      <AppIcon name={icon} size={Math.round(size / 2)} color={iconColor ?? t.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: "center",
  },
});
