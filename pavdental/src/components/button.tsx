import {
  Pressable,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  View,
} from "react-native";
import { safeHaptics } from "@/lib/haptics";
import { colors, spacing, radius, sizes } from "@/theme";
import { ThemedText } from "./themed-text";
import { AppIcon } from "./app-icon";

// ─── Variant map ──────────────────────────────────────────────────────────────
// Wise: bright green primary with forest text, light green secondary, white on
// dark surfaces.
const variants = {
  primary: {
    backgroundColor: colors.accent,
    color: colors.onAccent,
  },
  secondary: {
    backgroundColor: colors.accentSubtle,
    color: colors.onAccent,
  },
  inverse: {
    backgroundColor: colors.alwaysWhite,
    color: colors.ink,
  },
  ghost: {
    backgroundColor: "transparent",
    color: colors.ink,
  },
  destructive: {
    backgroundColor: colors.dangerSubtle,
    color: colors.danger,
  },
} as const;

// Disabled buttons in Wise turn neutral grey rather than fading out.
const disabledColors = {
  backgroundColor: colors.inkSubtle,
  color: colors.tertiaryLabel,
} as const;

// ─── Size map ─────────────────────────────────────────────────────────────────
// sm = inline pill ("Change", "Send"); md/lg = full 52pt pill. All capsules.
const sizes_ = {
  sm: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.md,
    minHeight: sizes.buttonSmall,
    borderRadius: radius.full,
  },
  md: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    minHeight: sizes.button,
    borderRadius: radius.full,
  },
  lg: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    minHeight: sizes.button,
    borderRadius: radius.full,
  },
} as const;

// Small pills are 36pt tall; this keeps their touch target at 44pt.
const smallHitSlop = { top: 4, bottom: 4, left: 0, right: 0 };

// ─── Props ────────────────────────────────────────────────────────────────────
interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes_;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Accessibility label override — defaults to title */
  accessibilityLabel?: string;
  /** Optional icon to render alongside the title */
  icon?: React.ReactNode;
  /** Position of the icon relative to title (default "left") */
  iconPosition?: "left" | "right";
  /** If true, renders a trailing arrow matching Neo Financial buttons */
  arrow?: boolean;
  /** Trigger light haptic on press (defaults to true) */
  haptic?: boolean;
}

/**
 * Button — the primary interactive primitive for this app.
 * Wise pill: 52pt capsule, semibold 16 label, optional trailing arrow.
 */
export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
  icon,
  iconPosition = "left",
  arrow = false,
  haptic = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const v = disabled && variant !== "ghost" ? disabledColors : variants[variant];
  const s = sizes_[size];

  const handlePress = () => {
    if (isDisabled) return;
    if (haptic) {
      safeHaptics.impactAsync("light").catch(() => {});
    }
    onPress?.();
  };

  const trailingIcon = icon && iconPosition === "right" ? (
    <View>{icon}</View>
  ) : arrow ? (
    <AppIcon name="arrowRight" size={size === "sm" ? 14 : 18} color={v.color as string} />
  ) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={handlePress}
      hitSlop={size === "sm" ? smallHitSlop : undefined}
      style={({ pressed }) => [
        {
          backgroundColor:
            pressed && !isDisabled && variant === "primary" ? colors.accentPressed : v.backgroundColor,
          // @ts-ignore — borderCurve is an iOS-specific style; silently ignored on Android
          borderCurve: "continuous",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: spacing.xs,
          opacity: loading ? 0.8 : pressed && !isDisabled ? 0.8 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
          ...s,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.color as string} />
      ) : (
        <>
          {icon && iconPosition === "left" ? <View>{icon}</View> : null}
          <ThemedText
            variant={size === "sm" ? "subhead" : "headline"}
            style={{ color: v.color, fontWeight: "600" }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            {title}
          </ThemedText>
          {trailingIcon}
        </>
      )}
    </Pressable>
  );
}

