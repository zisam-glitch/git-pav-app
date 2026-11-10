import React, { useEffect, useState } from "react";
import { View, StyleSheet, Linking } from "react-native";
import Constants from "expo-constants";
import { ThemedText, Button } from "@/components";
import { colors, spacing } from "@/theme";
import { publicFetch } from "@/features/auth/auth-api";
import { PRACTICE_CONFIG } from "@/config/practice";
import { isOlderVersion } from "@/lib/app-version";

interface AppConfig {
  minimumAppVersion?: string;
  storeUrl?: string | null;
}

/**
 * Asks the server for the oldest app version still allowed. A build older than
 * that sees "Update needed" instead of the app, so a broken release can be
 * retired. Any failure to ask lets the app through: never lock people out
 * because of a network blip.
 */
export function UpdateGate({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    let active = true;
    publicFetch("/api/public/app-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) setConfig(data as AppConfig);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const installed = Constants.expoConfig?.version;
  if (config && isOlderVersion(installed, config.minimumAppVersion)) {
    return (
      <View style={styles.container} accessibilityRole="alert">
        <ThemedText variant="largeTitle">Update needed</ThemedText>
        <ThemedText variant="body" style={styles.body}>
          This version of the Pav Dental app is out of date. Please update it from the app store to carry on.
        </ThemedText>
        {config.storeUrl ? (
          <Button title="Open the app store" size="lg" onPress={() => Linking.openURL(config.storeUrl as string).catch(() => {})} />
        ) : null}
        <ThemedText variant="caption" style={styles.body}>
          Need help? Call us on {PRACTICE_CONFIG.phone}.
        </ThemedText>
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  body: { color: colors.secondaryLabel, textAlign: "center" },
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.gutter,
  },
});
