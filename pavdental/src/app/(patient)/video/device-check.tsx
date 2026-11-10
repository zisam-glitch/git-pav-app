import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { ThemedText, Button, Card, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { CameraCheck } from "@/features/video/camera-check";

// The call runs in the app, and the phone asks for the camera and microphone
// when it starts. All the app can honestly check here is the connection.
type Connection = "checking" | "wifi" | "cellular" | "other" | "offline";

const CONNECTION_LABEL: Record<Connection, string> = {
  checking: "Checking…",
  wifi: "Connected (Wi-Fi)",
  cellular: "Connected (mobile data)",
  other: "Connected",
  offline: "Offline",
};

export default function DeviceCheckScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [connection, setConnection] = useState<Connection>("checking");

  useEffect(
    () =>
      NetInfo.addEventListener((state) => {
        if (state.isConnected === null) return;
        if (!state.isConnected) return setConnection("offline");
        setConnection(state.type === "wifi" ? "wifi" : state.type === "cellular" ? "cellular" : "other");
      }),
    [],
  );

  const handleJoinWaitingRoom = () => {
    router.push({
      pathname: "/(patient)/video/waiting" as any,
      params: { appointmentId: appointmentId || "" },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="headline" style={styles.title}>
            Before your video call
          </ThemedText>
          <ThemedText variant="caption" style={styles.subtitle}>
            Your call runs here in the app. When it starts, allow the camera and microphone so your dentist can see and
            hear you.
          </ThemedText>
        </View>

        <Card style={styles.card}>
          <View style={styles.checkItem}>
            <View style={styles.checkLeft}>
              <AppIcon name={connection === "offline" ? "wifiOff" : "wifi"} size={18} color={colors.ink} />
              <ThemedText variant="body">Internet connection</ThemedText>
            </View>
            <ThemedText
              variant="caption"
              style={connection === "offline" ? styles.badText : connection === "checking" ? styles.subtitle : styles.okText}
            >
              {CONNECTION_LABEL[connection]}
            </ThemedText>
          </View>
          {connection === "cellular" ? (
            <ThemedText variant="caption" style={styles.subtitle}>
              Video uses a lot of data. Wi-Fi is better if you have it.
            </ThemedText>
          ) : null}
          {connection === "offline" ? (
            <ThemedText variant="caption" style={styles.subtitle}>
              Connect to Wi-Fi or mobile data to join the call.
            </ThemedText>
          ) : null}
        </Card>

        <Card style={styles.card}>
          <CameraCheck />
        </Card>

        <View style={styles.fallbackBox}>
          <ThemedText variant="caption" style={styles.fallbackTitle}>
            To get the most from your call
          </ThemedText>
          <ThemedText variant="caption" style={styles.fallbackText}>
            Find a quiet, well-lit spot and keep your phone charged. If the video doesn't work, message the practice
            from the Messages tab.
          </ThemedText>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <Button
          title="Enter waiting room"
          size="lg"
          disabled={connection === "offline"}
          onPress={handleJoinWaitingRoom}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.systemBackground,
    padding: spacing.md,
  },
  checkItem: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  checkLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  fallbackBox: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: 4,
    padding: spacing.md,
  },
  fallbackText: {
    color: colors.secondaryLabel,
    lineHeight: 16,
  },
  fallbackTitle: {
    color: colors.label,
    fontWeight: "700",
  },
  footer: {
    backgroundColor: colors.background,
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  header: {
    gap: spacing.xxs,
  },
  okText: {
    color: colors.success,
    fontWeight: "700",
  },
  badText: {
    color: colors.danger,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  title: {
    color: colors.label,
  },
});

