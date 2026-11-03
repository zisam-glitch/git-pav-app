import React from "react";
import { View, StyleSheet, Switch, Pressable } from "react-native";
import { ThemedText } from "../themed-text";
import { colors, spacing, radius, sizes } from "@/theme";

export interface ToggleSwitchProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  testID?: string;
}

export function ToggleSwitch({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  icon,
  testID,
}: ToggleSwitchProps) {
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={() => !disabled && onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      accessibilityHint={description}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.leftContainer}>
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        <View style={styles.textContainer}>
          <ThemedText variant="headline" style={styles.label}>
            {label}
          </ThemedText>
          {description ? (
            <ThemedText variant="caption" style={styles.description}>
              {description}
            </ThemedText>
          ) : null}
        </View>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.inkSubtle, true: colors.successFill }}
        thumbColor={colors.systemBackground}
        ios_backgroundColor={colors.inkSubtle}
        importantForAccessibility="no"
        accessibilityElementsHidden={true}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Flat on the page like Wise's notification settings: no card, no side padding.
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: sizes.row,
    paddingVertical: spacing.sm,
  },
  description: {
    color: colors.secondaryLabel,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.separator,
    borderRadius: radius.full,
    borderWidth: 1,
    height: sizes.iconTile,
    justifyContent: "center",
    width: sizes.iconTile,
  },
  label: {
    color: colors.label,
  },
  leftContainer: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
});

