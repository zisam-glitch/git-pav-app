import { View, StyleSheet } from "react-native";
import { colors, radius, spacing } from "@/theme";
import { ThemedText } from "./themed-text";

interface MetricRingProps {
  percentage: number;
  label: string;
  color?: string;
  size?: number;
}

export function MetricRing({
  percentage,
  label,
  color = colors.info,
  size = 76,
}: MetricRingProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.ringOuter,
          {
            width: size,
            height: size,
            borderColor: "rgba(0,0,0,0.06)",
          },
        ]}
      >
        <View
          style={[
            styles.ringFill,
            {
              borderColor: color,
              borderTopColor: color,
              borderRightColor: color,
              borderBottomColor: percentage > 50 ? color : "transparent",
              borderLeftColor: percentage > 75 ? color : "transparent",
            },
          ]}
        />
        <View style={styles.centerText}>
          <ThemedText variant="headline" style={styles.percentText}>
            {percentage}%
          </ThemedText>
        </View>
      </View>
      <ThemedText variant="caption" style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  centerText: {
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    flex: 1,
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  label: {
    color: colors.secondaryLabel,
    fontWeight: "600",
  },
  percentText: {
    color: colors.label,
    fontSize: 17,
    fontWeight: "700",
  },
  ringFill: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.full,
    borderWidth: 4,
  },
  ringOuter: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: radius.full,
    borderWidth: 4,
    justifyContent: "center",
    position: "relative",
  },
});
