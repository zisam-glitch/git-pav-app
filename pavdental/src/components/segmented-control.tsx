import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/theme";
import { safeHaptics } from "@/lib/haptics";
import { ThemedText } from "./themed-text";

interface SegmentedControlProps<K extends string> {
  segments: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
}

/**
 * SegmentedControl — Wise's "Transactions | Options" switch: a grey pill
 * track with the active segment as a white pill (40pt pill in a 44pt track).
 * Segments share the spare width but never cut a label short.
 */
export function SegmentedControl<K extends string>({ segments, value, onChange }: SegmentedControlProps<K>) {
  return (
    <View accessibilityRole="tablist" style={styles.track}>
      {segments.map((seg) => {
        const active = seg.key === value;
        return (
          <Pressable
            key={seg.key}
            accessibilityRole="tab"
            accessibilityLabel={seg.label}
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (active) return;
              safeHaptics.impactAsync("light").catch(() => {});
              onChange(seg.key);
            }}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <ThemedText variant="subhead" numberOfLines={1} style={[styles.label, active && styles.labelActive]}>
              {seg.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.secondaryLabel,
    fontWeight: "600",
  },
  labelActive: {
    color: colors.label,
  },
  segment: {
    alignItems: "center",
    borderRadius: radius.full,
    flexBasis: "auto",
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: spacing.xs,
  },
  segmentActive: {
    backgroundColor: colors.background,
  },
  track: {
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    flexDirection: "row",
    padding: 2,
  },
});
