import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "@/theme";
import { IconButton } from "./icon-button";
import { ProgressPills } from "./progress-pills";

interface FlowHeaderProps {
  /** Step progress, 1-indexed; omit for no progress bar */
  step?: { current: number; total: number };
  onBack?: () => void;
  /** Close (X) instead of back, for the first step of a flow opened as a task */
  variant?: "back" | "close";
  /** Optional trailing control (e.g. a search button) */
  right?: React.ReactNode;
  /**
   * Set when the screen already pads for the top inset (SafeAreaView with the
   * top edge). Otherwise the header adds the inset itself.
   */
  insetHandled?: boolean;
}

/**
 * FlowHeader — the top row of a multi-step flow (booking, onboarding): round
 * back button and the step bar, kept below the status bar. Booking screens
 * that drew this themselves sat under the status bar, where the back button
 * couldn't be tapped.
 */
export function FlowHeader({ step, onBack, variant = "back", right, insetHandled = false }: FlowHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.row, { paddingTop: insetHandled ? spacing.xs : insets.top + spacing.xs }]}>
      <IconButton
        icon={variant === "close" ? "close" : "arrowLeft"}
        label={variant === "close" ? "Close" : "Go back"}
        variant="soft"
        onPress={onBack ?? (() => router.back())}
      />
      <View style={styles.progress}>{step ? <ProgressPills total={step.total} current={step.current} /> : null}</View>
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  progress: {
    flex: 1,
  },
  spacer: {
    width: 44,
  },
});
