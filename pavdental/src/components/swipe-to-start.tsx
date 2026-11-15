import { useState } from "react";
import { View, StyleSheet, LayoutChangeEvent, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { safeHaptics } from "@/lib/haptics";
import { colors, radius } from "@/theme";
import { ThemedText } from "./themed-text";
import { AppIcon } from "./app-icon";

interface SwipeToStartProps {
  label?: string;
  onComplete: () => void;
}

export function SwipeToStart({
  label = "Swipe To Start",
  onComplete,
}: SwipeToStartProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);
  const buttonWidth = 52;

  const maxSlide = Math.max(0, containerWidth - buttonWidth - 8);

  const triggerComplete = () => {
    safeHaptics.notificationAsync("success").catch(() => {});
    onComplete();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (maxSlide > 0) {
        translateX.value = Math.min(Math.max(0, e.translationX), maxSlide);
      }
    })
    .onEnd(() => {
      if (maxSlide > 0 && translateX.value > maxSlide * 0.72) {
        translateX.value = withSpring(maxSlide, { damping: 18, stiffness: 220 });
        runOnJS(triggerComplete)();
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: maxSlide > 0 ? 1 - (translateX.value / maxSlide) * 0.9 : 1,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.track} onLayout={onLayout}>
      <Animated.View style={[styles.labelBox, labelAnimatedStyle]}>
        <ThemedText variant="subhead" style={styles.label}>
          {label}
        </ThemedText>
        <AppIcon name="chevronRight" size={14} color="rgba(255,255,255,0.4)" />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.thumb, thumbAnimatedStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => {
              // Tap fallback
              safeHaptics.impactAsync("medium").catch(() => {});
              onComplete();
            }}
            style={styles.thumbInner}
          >
            <AppIcon name="chevronRight" size={18} color={colors.ink} />
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.alwaysWhite,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  labelBox: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
  thumb: {
    height: 52,
    width: 52,
  },
  thumbInner: {
    alignItems: "center",
    backgroundColor: colors.alwaysWhite,
    borderRadius: radius.full,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  track: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderColor: "rgba(255, 255, 255, 0.22)",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    height: 60,
    justifyContent: "flex-start",
    overflow: "hidden",
    padding: 4,
    position: "relative",
    width: "100%",
  },
});
