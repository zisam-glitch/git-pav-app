import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { colors, spacing, radius } from "@/theme";
import { ThemedText } from "./themed-text";
import { Button } from "./button";
import { AppIcon } from "./app-icon";
import { Illustration, type IllustrationName } from "./illustrations";

interface ConfirmSheetProps {
  title: string;
  /** Consequence-first copy: state what happens, then the choice */
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** destructive renders red confirm + alert icon; neutral renders ink confirm */
  variant?: "neutral" | "destructive";
  /** Spot illustration in place of the icon, for neutral choices only */
  illustration?: IllustrationName;
  /** Called after the sheet closes (confirm pressed or swiped away) */
  onConfirm: () => void;
  onCancel?: () => void;
}

type PendingAction = "confirm" | "cancel" | null;

/**
 * ConfirmSheet — the app's only confirmation pattern (replaces Alert.alert).
 * Mount when a decision is needed; it presents itself and calls back after
 * closing. Unmount it from the callbacks:
 *
 *   {confirm && <ConfirmSheet ... onConfirm={() => { setConfirm(false); doIt(); }} />}
 */
export function ConfirmSheet({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "neutral",
  illustration,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const pending = useRef<PendingAction>(null);
  const destructive = variant === "destructive";

  // Present on mount
  useEffect(() => {
    sheetRef.current?.present();
  }, []);

  const choose = (action: Exclude<PendingAction, null>) => {
    pending.current = action;
    sheetRef.current?.dismiss();
  };

  // Fired after ANY close (button, swipe-down, backdrop tap)
  const handleClose = () => {
    const action = pending.current;
    pending.current = null;
    if (action === "confirm") onConfirm();
    else onCancel?.();
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      // Sized to its content: a fixed height cut the second button off on
      // smaller screens and with longer messages.
      enableDynamicSizing
      backdropComponent={(p) => (
        <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      )}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.indicator}
      enablePanDownToClose
      onDismiss={handleClose}
      accessibilityLabel={title}
    >
      <BottomSheetView style={[styles.content, { paddingBottom: Math.max(spacing.lg, insets.bottom + spacing.xs) }]}>
        {illustration && !destructive ? (
          <Illustration name={illustration} size={120} />
        ) : (
          <View style={[styles.iconWrap, destructive && styles.iconWrapDanger]}>
            <AppIcon
              name={destructive ? "alert" : "help"}
              size={22}
              color={destructive ? colors.danger : colors.ink}
            />
          </View>
        )}
        <ThemedText variant="title" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText variant="subhead" style={styles.message}>
          {message}
        </ThemedText>
        <View style={styles.actions}>
          <Button
            title={confirmLabel}
            variant={destructive ? "destructive" : "primary"}
            onPress={() => choose("confirm")}
            style={styles.actionBtn}
          />
          <Button
            title={cancelLabel}
            variant="ghost"
            onPress={() => choose("cancel")}
            style={styles.actionBtn}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.sheet,
    borderRadius: radius.xl,
  },
  indicator: {
    backgroundColor: colors.separator,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xs,
    gap: spacing.sm,
  },
  iconWrap: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  iconWrapDanger: {
    backgroundColor: colors.dangerSubtle,
  },
  title: {
    textAlign: "center",
  },
  message: {
    color: colors.secondaryLabel,
    textAlign: "center",
  },
  actions: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  actionBtn: {
    width: "100%",
  },
});
