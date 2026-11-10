import React, { useEffect } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { ThemedText, Button } from "@/components";
import { colors, spacing } from "@/theme";
import { dailyJoinUrl } from "./open-call";

// The web build has no native WebRTC module, so it opens Daily's own page in
// a new tab instead of running the call in the app.

export type CallEndReason = "left" | "ended";

export function callErrorMessage(): string {
  return "The video call stopped unexpectedly. Please try again.";
}

export function NativeVideoCall({
  url,
  token,
  onLeft,
  style,
}: {
  url: string;
  token: string;
  otherLabel: string;
  onLeft: (reason: CallEndReason) => void;
  style?: StyleProp<ViewStyle>;
}) {
  useEffect(() => {
    window.open(dailyJoinUrl(url, token), "_blank", "noopener");
  }, [url, token]);
  return (
    <View style={[styles.stage, style]}>
      <ThemedText variant="headline" style={styles.text}>
        The call opened in a new tab.
      </ThemedText>
      <Button title="I've left the call" variant="secondary" onPress={() => onLeft("left")} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: "center", backgroundColor: colors.background, flex: 1, gap: spacing.md, justifyContent: "center" },
  text: { color: colors.label, textAlign: "center" },
});
