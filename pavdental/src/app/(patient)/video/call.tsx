import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { ThemedText, Card, Button, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authFetch } from "@/features/auth/auth-api";
import { dailyJoinUrl, openVideoCall } from "@/features/video/open-call";

// The call itself runs in Daily's private room, shown in an in-app browser
// window over this screen: the app asks the server for this appointment's room
// and a meeting token, and the token is what lets the patient in (CS-07).
type Room = { url: string; token: string };

export default function VideoCallScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);

  const loadRoom = useCallback(async () => {
    if (!appointmentId) {
      setError("We couldn't find this consultation. Please go back and open it from your appointments.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/video/rooms", {
        method: "POST",
        body: JSON.stringify({ appointmentId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url || !data?.token) {
        setError(data?.error || "We couldn't open the video room. Please try again.");
        setRoom(null);
      } else {
        setRoom({ url: data.url, token: data.token });
      }
    } catch {
      setError("You seem to be offline. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  const joinCall = async () => {
    if (!room) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      setOpened(true);
      // Resolves when the patient closes the call window and is back here.
      await openVideoCall(dailyJoinUrl(room.url, room.token));
    } catch {
      setError("Your phone couldn't open the video call. Please try again.");
    }
  };

  const finish = () => {
    router.replace({
      pathname: "/(patient)/video/summary" as never,
      params: { appointmentId: appointmentId || "" },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.center}>
          <View style={styles.iconCircle}>
            {loading ? <ActivityIndicator size="large" color={colors.ink} /> : <AppIcon name="video" size={28} color={colors.ink} />}
          </View>

          <ThemedText variant="largeTitle" style={styles.title}>
            {loading ? "Opening your room" : error ? "Can't join yet" : "Your clinician is ready"}
          </ThemedText>

          {error ? (
            <ThemedText variant="subhead" style={styles.subtitle} accessibilityRole="alert">
              {error}
            </ThemedText>
          ) : (
            !loading && (
              <ThemedText variant="subhead" style={styles.subtitle}>
                The call opens on top of this screen. Allow camera and microphone access when asked, and tap Done when the call ends.
              </ThemedText>
            )
          )}

          {!loading && !error && (
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <AppIcon name="lock" size={14} color={colors.secondaryLabel} />
                <ThemedText variant="caption" style={styles.muted}>
                  Private room: only you and your clinician can join this call
                </ThemedText>
              </View>
            </Card>
          )}
        </View>

        <View style={styles.actions}>
          {error ? (
            <Button title="Try again" size="lg" onPress={loadRoom} />
          ) : (
            <Button
              title={opened ? "Rejoin video call" : "Join video call"}
              size="lg"
              disabled={!room}
              loading={loading}
              onPress={joinCall}
            />
          )}
          {opened && <Button title="I've finished the call" variant="secondary" size="md" onPress={finish} />}
          <Button title="Back" variant="ghost" size="md" onPress={() => router.back()} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.xs,
  },
  center: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.xl,
    height: 72,
    justifyContent: "center",
    marginBottom: spacing.xxs,
    width: 72,
  },
  infoCard: {
    borderCurve: "continuous",
    borderColor: colors.separator,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
    width: "100%",
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  muted: {
    color: colors.secondaryLabel,
    flex: 1,
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  subtitle: {
    color: colors.secondaryLabel,
    lineHeight: 20,
    paddingHorizontal: spacing.gutter,
    textAlign: "center",
  },
  title: {
    color: colors.label,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
  },
});
