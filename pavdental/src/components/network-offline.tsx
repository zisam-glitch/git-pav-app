import { View, StyleSheet } from "react-native";
import { colors, spacing } from "@/theme";
import { ThemedText } from "./themed-text";
import { Button } from "./button";
import { Illustration } from "./illustrations";

interface NetworkOfflineProps {
  /** Optional custom message */
  message?: string;
  /** Action to retry when connection is restored */
  onRetry?: () => void;
}

/**
 * NetworkOffline — shown when the device has no internet connection.
 * Provides clear guidance and retry option when connection is restored.
 */
export function NetworkOffline({
  message = "No internet connection. Please check your network settings.",
  onRetry,
}: NetworkOfflineProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
    >
      <Illustration name="offline" size={160} />

      <ThemedText variant="headline" style={styles.message}>
        {message}
      </ThemedText>

      {onRetry ? (
        <Button
          title="Retry"
          variant="secondary"
          onPress={onRetry}
          style={styles.cta}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  cta: {
    marginTop: spacing.xs,
  },
  message: {
    color: colors.secondaryLabel,
    textAlign: "center",
  },
});
