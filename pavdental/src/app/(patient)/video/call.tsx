import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { ThemedText, Card, Button, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { authFetch } from "@/features/auth/auth-api";
import { NativeVideoCall, CallEndReason } from "@/features/video/native-call";

// The call runs natively in this screen (Daily's private room): the app asks
// the server for this appointment's room and a meeting token, and the token is
// what lets the patient in (CS-07).
type Room = { url: string; token: string };

export default function VideoCallScreen() {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [inCall, setInCall] = useState(false);

  const loadRoom = useCallback(async (): Promise<Room | null> => {
    if (!appointmentId) {
      setError("We couldn't find this consultation. Please go back and open it from your appointments.");
      setLoading(false);
      return null;
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
        return null;
      }
      const fresh = { url: data.url as string, token: data.token as string };
      setRoom(fresh);
      return fresh;
    } catch {
      setError("You seem to be offline. Check your connection and try again.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  const joinCall = async () => {
    // A rejoin after a long consultation asks for a new token, not the one
    // fetched when the screen opened (V20).
    const current = opened ? await loadRoom() : room;
    if (!current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setOpened(true);
    setInCall(true);
  };

  const finish = () => {
    router.replace({
      pathname: "/(patient)/video/summary" as never,
      params: { appointmentId: appointmentId || "" },
    });
  };

  const onLeft = (reason: CallEndReason) => {
    setInCall(false);
    // The dentist ended the consultation: show the summary straight away.
    if (reason === "ended") finish();
  };

  if (inCall && room) {
    return (
      <SafeAreaView style={styles.callSafe} edges={["top", "bottom"]}>
        <NativeVideoCall url={room.url} token={room.token} otherLabel="your dentist" onLeft={onLeft} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.center}>
          <View style={styles.iconCircle}>
            {loading ? <ActivityIndicator size="large" color={colors.ink} /> : <AppIcon name="video" size={28} color={colors.ink} />}
          </View>

          <ThemedText variant="largeTitle" style={styles.title}>
            {loading ? "Opening your room" : error ? "Can't join yet" : opened ? "You left the call" : "Your clinician is ready"}
          </ThemedText>

          {error ? (
            <ThemedText variant="subhead" style={styles.subtitle} accessibilityRole="alert">
              {error}
            </ThemedText>
          ) : (
            !loading && (
              <ThemedText variant="subhead" style={styles.subtitle}>
                {opened
                  ? "Rejoin if you left by mistake, or tell us you've finished."
                  : "Allow camera and microphone access when your phone asks. Leave the call with the red button when you're done."}
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
  callSafe: {
    backgroundColor: "#0B0F0A",
    flex: 1,
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
