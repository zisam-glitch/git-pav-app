import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Linking, ViewStyle } from "react-native";
import Daily, { DailyCall, DailyMediaView, DailyParticipant } from "@daily-co/react-native-daily-js";
import { ThemedText, Button } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { cameraProblem, cameraProblemMessage, needsSettings, levelBars, type CameraProblem } from "./camera-check-state";

type Phase = "idle" | "starting" | "ready" | "problem";

const BARS = 5;

// Asks for the camera and microphone with a plain reason, shows the patient
// their own picture and a moving sound level, and says what to do if one
// would not start. It uses the same call library the visit uses, so it needs
// nothing extra on the phone, and it is closed before the visit begins (V18).
export function CameraCheck() {
  const callRef = useRef<DailyCall | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [problem, setProblem] = useState<CameraProblem | null>(null);
  const [level, setLevel] = useState(0);
  const [local, setLocal] = useState<DailyParticipant | null>(null);

  const stop = () => {
    const call = callRef.current;
    callRef.current = null;
    if (call) call.destroy().catch(() => {});
  };
  useEffect(() => stop, []);

  const start = async () => {
    stop();
    setPhase("starting");
    setProblem(null);
    setLevel(0);
    const call = Daily.createCallObject();
    callRef.current = call;
    call
      .on("camera-error", (event) => {
        setProblem(cameraProblem(event?.error?.type));
        setPhase("problem");
      })
      .on("participant-updated", () => setLocal({ ...call.participants().local }))
      .on("local-audio-level", (event) => setLevel(event?.audioLevel ?? 0));
    try {
      await call.startCamera();
      setLocal({ ...call.participants().local });
      setPhase("ready");
      call.startLocalAudioLevelObserver(200).catch(() => {});
    } catch {
      setProblem((p) => p ?? "other");
      setPhase("problem");
    }
  };

  const video = local?.tracks?.video;
  const videoTrack = video && (video.state === "playable" || video.state === "loading") ? video.persistentTrack ?? null : null;
  const lit = levelBars(level, BARS);

  return (
    <View style={styles.box}>
      <ThemedText variant="body">Camera and microphone</ThemedText>
      {phase === "idle" ? (
        <>
          <ThemedText variant="caption" style={styles.muted}>
            Your dentist needs to see and hear you. Check now, so there is no surprise when your visit starts.
          </ThemedText>
          <Button title="Check camera and microphone" variant="secondary" size="md" onPress={start} />
        </>
      ) : null}
      {phase === "starting" ? <ThemedText variant="caption" style={styles.muted}>Starting…</ThemedText> : null}
      {phase === "ready" ? (
        <>
          <View style={styles.preview}>
            {videoTrack ? (
              <DailyMediaView videoTrack={videoTrack} audioTrack={null} mirror objectFit="cover" zOrder={0} style={styles.video as ViewStyle} />
            ) : (
              <ThemedText variant="caption" style={styles.muted}>Camera is off</ThemedText>
            )}
          </View>
          <View style={styles.meter} accessibilityLabel="Microphone level" accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: BARS, now: lit }}>
            {Array.from({ length: BARS }, (_, i) => (
              <View key={i} style={[styles.bar, i < lit && styles.barOn]} />
            ))}
          </View>
          <ThemedText variant="caption" style={styles.muted}>
            Say something. If the bars move, your microphone works.
          </ThemedText>
          <Button title="Check again" variant="ghost" size="sm" onPress={start} />
        </>
      ) : null}
      {phase === "problem" && problem ? (
        <>
          <ThemedText variant="caption" style={styles.bad} accessibilityRole="alert">
            {cameraProblemMessage(problem)}
          </ThemedText>
          {needsSettings(problem) ? (
            <Button title="Open Settings" variant="secondary" size="md" onPress={() => Linking.openSettings().catch(() => {})} />
          ) : null}
          <Button title="Check again" variant="ghost" size="sm" onPress={start} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bad: { color: colors.danger },
  bar: { backgroundColor: colors.separator, borderRadius: 3, flex: 1, height: 8 },
  barOn: { backgroundColor: colors.success },
  box: { gap: spacing.xs, paddingVertical: spacing.xs },
  meter: { flexDirection: "row", gap: 4 },
  muted: { color: colors.secondaryLabel },
  preview: {
    alignItems: "center",
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    height: 180,
    justifyContent: "center",
    overflow: "hidden",
  },
  video: { height: "100%", width: "100%" },
});
