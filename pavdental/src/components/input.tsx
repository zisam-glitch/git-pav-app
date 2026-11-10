import { useState } from "react";
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { colors, spacing, radius, sizes, type } from "@/theme";
import { ThemedText } from "./themed-text";

export type InputState = "default" | "focused" | "error" | "disabled";

interface InputProps extends Omit<TextInputProps, "style"> {
  /** Field label — sits above the field in bold, as in Wise */
  label?: string;
  /** Inline error message — renders the input in error state */
  error?: string;
  /** Hint text rendered below the input */
  hint?: string;
  /** Disable the field */
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  /** Optional slot rendered inside the right edge of input */
  rightSlot?: React.ReactNode;
}

/**
 * Input — Wise text field: bold 14pt label above a white field with a 1pt
 * grey border and 10pt corners. The border turns 2pt forest green on focus
 * and red on error; the error message sits under the field.
 */
export function Input({
  label,
  error,
  hint,
  disabled = false,
  containerStyle,
  rightSlot,
  onFocus,
  onBlur,
  placeholder,
  multiline,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;

  const border = hasError ? colors.danger : isFocused ? colors.ink : colors.inputUnderline;
  const borderWidth = hasError || isFocused ? 2 : 1;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <ThemedText
          variant="footnote"
          style={styles.label}
          numberOfLines={2}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {label}
        </ThemedText>
      ) : null}
      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          // A thicker border would shift the text; padding absorbs the difference.
          { borderColor: border, borderWidth, paddingHorizontal: spacing.md - (borderWidth - 1) },
          disabled && styles.fieldDisabled,
        ]}
      >
        <TextInput
          {...props}
          multiline={multiline}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor={colors.tertiaryLabel}
          // A label passed by the caller wins; an empty label ("" is used where the
          // field has no visible title) falls back to the placeholder, so a screen
          // reader never meets an unnamed field.
          accessibilityLabel={props.accessibilityLabel || label || placeholder}
          accessibilityHint={hint}
          accessibilityState={{ disabled }}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.inputMultiline]}
        />
        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </View>

      {hasError ? (
        <ThemedText
          variant="caption"
          style={styles.error}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText variant="caption" style={styles.hint}>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  error: {
    color: colors.danger,
  },
  hint: {
    color: colors.secondaryLabel,
  },
  label: {
    color: colors.label,
    fontWeight: "600",
  },
  field: {
    minHeight: sizes.input,
    backgroundColor: colors.tertiaryBackground,
    borderRadius: radius.sm,
    // @ts-ignore — iOS-only style, ignored on Android
    borderCurve: "continuous",
    flexDirection: "row",
    alignItems: "center",
  },
  fieldMultiline: {
    alignItems: "flex-start",
    minHeight: 112,
    paddingVertical: spacing.sm,
  },
  fieldDisabled: {
    backgroundColor: colors.inkSubtle,
    opacity: 0.7,
  },
  input: {
    ...type.body,
    flex: 1,
    color: colors.label,
    minHeight: 24,
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
  },
  inputMultiline: {
    minHeight: 88,
    paddingVertical: 0,
    textAlignVertical: "top",
  },
  rightSlot: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
  },
});
