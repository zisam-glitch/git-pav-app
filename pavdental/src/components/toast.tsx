import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useReducedMotion } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius, shadows, motion } from "@/theme";
import { ThemedText } from "./themed-text";
import { AppIcon, type AppIconName } from "./app-icon";

type ToastTone = "success" | "error" | "info";

const toneMap: Record<ToastTone, { icon: AppIconName; color: string }> = {
  success: { icon: "checkCircle", color: colors.accent },
  error: { icon: "alert", color: colors.dangerSubtle },
  info: { icon: "info", color: colors.onInk },
};

interface ToastProps {
  message: string;
  tone?: ToastTone;
  /** Auto-dismiss delay in ms (0 = sticky until dismissed) */
  duration?: number;
  onDismiss?: () => void;
}

/**
 * Toast — transient top-of-screen feedback for operation results.
 * Announces politely to screen readers; slides/fades unless Reduce Motion is on.
 */
export function Toast({ message, tone = "info", duration = 3000, onDismiss }: ToastProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const offsetY = useSharedValue(-(insets.top + 72));
  const opacity = useSharedValue(0);
  const t = toneMap[tone];

  useEffect(() => {
    offsetY.value = withTiming(0, { duration: motion.base });
    opacity.value = withTiming(1, { duration: motion.base });
    if (duration > 0 && onDismiss) {
      const exitDelay = duration;
      offsetY.value = withDelay(
        exitDelay,
        withTiming(-(insets.top + 72), { duration: motion.base }, (finished) => {
          if (finished && onDismiss) runOnJS(onDismiss)();
        })
      );
      opacity.value = withDelay(exitDelay, withTiming(0, { duration: motion.base }));
    }
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: reduceMotion ? 0 : offsetY.value }],
    opacity: reduceMotion ? 1 : opacity.value,
  }));

  return (
    <View pointerEvents="box-none" style={[styles.overlay, { paddingTop: insets.top + 8 }]}>
      <SafeAreaView edges={["top"]} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <Animated.View
        style={[styles.toast, { top: insets.top + 8 }, style]}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        accessibilityLabel={message}
      >
        <AppIcon name={t.icon} size={22} color={t.color} />
        <ThemedText variant="subhead" style={styles.text} numberOfLines={2}>
          {message}
        </ThemedText>
        {onDismiss ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
            onPress={onDismiss}
            style={styles.close}
            hitSlop={8}
          >
            <AppIcon name="close" size={16} color={colors.onInk} />
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 100,
  },
  toast: {
    alignItems: "center",
    backgroundColor: colors.toast,
    borderRadius: radius.lg,
    borderCurve: "continuous",
    boxShadow: shadows.raised,
    flexDirection: "row",
    gap: spacing.sm,
    left: spacing.gutter,
    minHeight: 56,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    position: "absolute",
    right: spacing.gutter,
  },
  text: {
    color: colors.onInk,
    flex: 1,
  },
  close: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
});
