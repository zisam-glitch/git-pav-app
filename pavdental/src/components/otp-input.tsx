import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { colors, radius, spacing } from "@/theme";
import { ThemedText } from "./themed-text";
import { isOtpComplete, otpCells, sanitizeOtp } from "@/lib/otp";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called once, when the last digit is entered or a full code is pasted. */
  onComplete?: (value: string) => void;
  length?: number;
  /** Outlines the boxes in the error colour. */
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Read aloud by screen readers. */
  label?: string;
}

/**
 * A row of boxes for a one-time code. One hidden text field takes the typing,
 * so the keyboard's code suggestion ("From Messages") and pasting both work,
 * and the boxes just show what it holds.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  invalid = false,
  disabled = false,
  autoFocus = true,
  label = "Verification code",
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const cells = otpCells(value, length);

  const handleChange = (raw: string) => {
    const next = sanitizeOtp(raw, length);
    onChange(next);
    if (isOtpComplete(next, length) && !isOtpComplete(value, length)) onComplete?.(next);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        accessible={false}
        onPress={() => inputRef.current?.focus()}
        style={styles.row}
        disabled={disabled}
      >
        {cells.map((cell, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              cell.filled && styles.cellFilled,
              focused && cell.active && !disabled && styles.cellActive,
              invalid && styles.cellInvalid,
              disabled && styles.cellDisabled,
            ]}
          >
            <ThemedText variant="largeTitle" style={styles.digit}>
              {cell.char}
            </ThemedText>
          </View>
        ))}
      </Pressable>
      {/* The real input: invisible, but it is what the keyboard types into. */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        inputMode="numeric"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoCorrect={false}
        autoCapitalize="none"
        maxLength={length * 2}
        caretHidden
        selectTextOnFocus={false}
        contextMenuHidden={false}
        accessibilityLabel={`${label}, ${length} digits`}
        accessibilityHint="Type or paste the code from your email"
        style={styles.hidden}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  row: {
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "space-between",
  },
  cell: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.separator,
    borderRadius: radius.md,
    borderWidth: 1.5,
    flex: 1,
    height: 58,
    justifyContent: "center",
  },
  cellFilled: {
    borderColor: colors.ink,
  },
  cellActive: {
    borderColor: colors.ink,
    borderWidth: 2.5,
  },
  cellInvalid: {
    borderColor: colors.danger,
  },
  cellDisabled: {
    opacity: 0.5,
  },
  digit: {
    color: colors.label,
    textAlign: "center",
  },
  hidden: {
    // Covers the boxes so a tap lands in the field, and stays invisible.
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    color: "transparent",
    opacity: 0.02,
  },
});
