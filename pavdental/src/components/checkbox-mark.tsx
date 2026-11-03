import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius } from "@/theme";
import { AppIcon } from "./app-icon";

interface CheckboxMarkProps {
  checked: boolean;
  size?: number;
}

/**
 * CheckboxMark — the box inside a checkbox row. Unchecked is an empty rounded
 * square with a 3:1 border; checked is Iconsax TickSquare (Bold) in ink. The
 * row around it owns the press, the role and the label.
 */
export function CheckboxMark({ checked, size = 24 }: CheckboxMarkProps) {
  if (checked) return <AppIcon name="checkbox" size={size} color={colors.ink} variant="Bold" />;
  return <View style={[styles.empty, { height: size - 4, width: size - 4 }]} />;
}

const styles = StyleSheet.create({
  empty: {
    borderColor: colors.inputUnderline,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    margin: 2,
  },
});
