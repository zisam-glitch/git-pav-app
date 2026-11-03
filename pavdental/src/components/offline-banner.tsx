import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, shadows, spacing } from "@/theme";
import { ThemedText } from "./themed-text";
import { AppIcon } from "./app-icon";
import { useIsOnline } from "@/lib/network";

interface OfflineBannerProps {
  message?: string;
}

/**
 * OfflineBanner — a floating pill just below the status bar while the phone
 * is offline. It used to sit in the layout above the navigator with no top
 * inset: its text ran under the clock and Dynamic Island, and every screen
 * below was pushed down. Floating and compact, centred between the back
 * button and any header icons, it moves nothing; touches pass through. The
 * full message is read out by screen readers.
 */
export function OfflineBanner({
  message = "You are currently offline. Changes will sync when reconnected.",
}: OfflineBannerProps) {
  const isOnline = useIsOnline();
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top - spacing.xxs }]}>
      <View
        style={styles.banner}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        accessibilityLabel={message}
      >
        <AppIcon name="wifiOff" size={14} color={colors.onInk} />
        <ThemedText variant="caption" style={styles.text} numberOfLines={1}>
          You're offline
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 1000,
  },
  banner: {
    alignItems: "center",
    backgroundColor: colors.toast,
    borderRadius: radius.full,
    boxShadow: shadows.raised,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
  },
  text: {
    color: colors.onInk,
    flexShrink: 1,
    fontWeight: "500",
  },
});
