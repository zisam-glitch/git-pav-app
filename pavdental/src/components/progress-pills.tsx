import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { useEffect } from "react";
import { colors, motion, radius } from "@/theme";

interface ProgressPillsProps {
  /** Total steps */
  total: number;
  /** Current step, 1-indexed */
  current: number;
}

/**
 * ProgressPills — segmented step indicator for onboarding flows
 * (Wise pattern: thin bars at the top of multi-step flows).
 */
export function ProgressPills({ total, current }: ProgressPillsProps) {
  // The current step's segment fills as you arrive on it; earlier ones are full.
  const fill = useSharedValue(0);
  useEffect(() => {
    fill.value = 0;
    fill.value = withTiming(1, { duration: motion.base });
  }, [current, fill]);
  const barStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: current }}
      accessibilityLabel={`Step ${current} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={styles.track}>
          {i < current - 1 ? (
            <View style={[styles.fill, { width: "100%" }]} />
          ) : i === current - 1 ? (
            <Animated.View style={[styles.fill, barStyle]} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.inkSubtle,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.xs,
    backgroundColor: colors.ink,
  },
});
