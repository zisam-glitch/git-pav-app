import React from "react";
import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from "react-native";
import { Image, ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { safeHaptics } from "@/lib/haptics";
import { colors, radius, spacing } from "@/theme";
import { ThemedText } from "./themed-text";
import { AppIcon } from "./app-icon";

interface ServiceHeroCardProps {
  title: string;
  image: ImageSource | string | number;
  badge?: string;
  actionLabel?: string;
  onPressAction?: () => void;
  onPressChat?: () => void;
  onPressInfo?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ServiceHeroCard({
  title,
  image,
  badge,
  actionLabel = "Schedule Surgery",
  onPressAction,
  onPressChat,
  onPressInfo,
  style,
}: ServiceHeroCardProps) {
  const handleChat = () => {
    safeHaptics.impactAsync("light").catch(() => {});
    onPressChat?.();
  };

  const handleAction = () => {
    safeHaptics.impactAsync("medium").catch(() => {});
    onPressAction?.();
  };

  const handleInfo = () => {
    safeHaptics.impactAsync("light").catch(() => {});
    onPressInfo?.();
  };

  return (
    <View style={[styles.card, style]}>
      {/* Background Photography */}
      <Image
        source={typeof image === "string" ? { uri: image } : image}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />

      {/* Subtle top gradient + Strong bottom gradient */}
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "transparent", "rgba(0,0,0,0.88)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Header Row on Card */}
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          {badge ? (
            <View style={styles.badgePill}>
              <ThemedText variant="caption" style={styles.badgeText}>
                {badge}
              </ThemedText>
            </View>
          ) : null}
          <ThemedText variant="headline" style={styles.title}>
            {title}
          </ThemedText>
        </View>

        {onPressInfo ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Info about ${title}`}
            onPress={handleInfo}
            hitSlop={8}
            style={({ pressed }) => [styles.infoBtn, pressed && { opacity: 0.7 }]}
          >
            <AppIcon name="info" size={15} color={colors.alwaysWhite} />
          </Pressable>
        ) : null}
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomRow}>
        {onPressChat ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chat with clinical coordinator"
            onPress={handleChat}
            style={({ pressed }) => [
              styles.chatBtn,
              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
            ]}
          >
            <AppIcon name="message" size={16} color={colors.alwaysWhite} />
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={handleAction}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
        >
          <AppIcon name="calendar" size={14} color={colors.onAccent} />
          <ThemedText variant="headline" style={styles.actionText}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Wise primary pill on the photo
  actionBtn: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.gutter,
  },
  actionText: {
    color: colors.onAccent,
    fontSize: 14,
    fontWeight: "600",
  },
  badgePill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: radius.full,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.alwaysWhite,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bottomRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: "auto",
  },
  card: {
    borderRadius: radius.lg,
    // @ts-ignore
    borderCurve: "continuous",
    height: 220,
    justifyContent: "space-between",
    overflow: "hidden",
    padding: spacing.md,
    position: "relative",
  },
  chatBtn: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: radius.full,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  infoBtn: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: radius.full,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  title: {
    color: colors.alwaysWhite,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.sm,
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
