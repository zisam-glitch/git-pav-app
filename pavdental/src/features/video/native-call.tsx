import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable, ActivityIndicator, StyleProp, ViewStyle } from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import Daily, { DailyCall, DailyMediaView, DailyParticipant } from "@daily-co/react-native-daily-js";
import { ThemedText, AppIcon } from "@/components";
import { colors, spacing, radius } from "@/theme";
import { reportCallEvent } from "@/lib/call-events";
import { linkStatus, linkMessage, shouldGoAudioOnly, joinTimeBucket, type NetworkState } from "./call-health";

// The video consult runs natively inside the app (Daily's React Native SDK),
// not in a browser window: the app asks the server for this appointment's
// private room and a meeting token, and the token is what lets this person in
// (CS-07). Only one call runs at a time.

export type CallEndReason = "left" | "ended";

type Props = {
  url: string;
  token: string;
  /** Who the person is waiting for, e.g. "your dentist" or "the patient". */
  otherLabel: string;
  /** Called once the person has left, or the call ended for everyone. */
  onLeft: (reason: CallEndReason) => void;
  style?: StyleProp<ViewStyle>;
};

type Phase = "joining" | "joined" | "error";

function playable(track: DailyParticipant["tracks"]["video"] | undefined) {
  return track && (track.state === "playable" || track.state === "loading") ? track.persistentTrack ?? null : null;
}

/** What the person sees when the call can't start or stops. */
export function callErrorMessage(raw: string | undefined): string {
  const msg = (raw ?? "").toLowerCase();
  if (msg.includes("ended") || msg.includes("expired") || msg.includes("eject")) {
    return "This consultation has ended.";
  }
  if (msg.includes("payment") || msg.includes("account")) {
    return "Video calls aren't available right now. Please contact the practice.";
  }
  if (msg.includes("network") || msg.includes("connect") || msg.includes("offline")) {
    return "The call lost its connection. Check your internet and try again.";
  }
  return "The video call stopped unexpectedly. Please try again.";
}

export function NativeVideoCall({ url, token, otherLabel, onLeft, style }: Props) {
  // The screen must not dim and lock in the middle of a consultation (V17).
  useKeepAwake();
  const callRef = useRef<DailyCall | null>(null);
  const onLeftRef = useRef(onLeft);
  onLeftRef.current = onLeft;
  // Leaving because this screen closed must not navigate anywhere.
  const unmountingRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("joining");
  const [error, setError] = useState<string | null>(null);
  const [deviceProblem, setDeviceProblem] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Record<string, DailyParticipant>>({});
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [leaving, setLeaving] = useState(false);
  // Once the other person has been in the call, their absence means they left (V21).
  const [otherHasJoined, setOtherHasJoined] = useState(false);
  // The connection: dropped (the library is retrying), or weak (V16).
  const [interrupted, setInterrupted] = useState(false);
  const [network, setNetwork] = useState<NetworkState>("unknown");
  const [audioOnly, setAudioOnly] = useState(false);
  const audioOnlyDone = useRef(false);
  const camOnRef = useRef(true);

  useEffect(() => {
    unmountingRef.current = false;
    const call = Daily.createCallObject();
    callRef.current = call;
    const refresh = () => setParticipants({ ...call.participants() });
    const joinStarted = Date.now();

    call
      .on("joined-meeting", () => {
        setPhase("joined");
        refresh();
        reportCallEvent("call.joined", { join_time: joinTimeBucket(Date.now() - joinStarted) });
      })
      .on("network-connection", (event) => {
        const state = String(event?.event ?? "");
        if (state.includes("interrupt")) {
          setInterrupted(true);
          reportCallEvent("call.interrupted");
        } else if (state.includes("connected")) {
          setInterrupted((was) => {
            if (was) reportCallEvent("call.recovered");
            return false;
          });
        }
      })
      .on("network-quality-change", (event) => {
        const state = (event?.networkState ?? "unknown") as NetworkState;
        setNetwork(state);
        // A bad connection turns the camera off once, so the voice gets through (audio-only).
        if (shouldGoAudioOnly({ network: state, alreadyDone: audioOnlyDone.current, cameraOn: camOnRef.current })) {
          audioOnlyDone.current = true;
          call.setLocalVideo(false);
          camOnRef.current = false;
          setCamOn(false);
          setAudioOnly(true);
          reportCallEvent("call.audio_only");
        }
      })
      .on("participant-joined", refresh)
      .on("participant-updated", refresh)
      .on("participant-left", refresh)
      .on("left-meeting", () => {
        if (!unmountingRef.current) onLeftRef.current("left");
      })
      .on("error", (event) => {
        const message = callErrorMessage(event?.errorMsg);
        setError(message);
        setPhase("error");
        if (message === "This consultation has ended." && !unmountingRef.current) onLeftRef.current("ended");
      })
      .on("camera-error", () => {
        setDeviceProblem("Your camera or microphone couldn't start. Allow Pav Dental to use them in Settings, then rejoin.");
      });

    call.join({ url, token }).catch((err: unknown) => {
      const message = callErrorMessage(err instanceof Error ? err.message : String(err));
      setError(message);
      setPhase("error");
      reportCallEvent("call.join_failed", { reason: message === "This consultation has ended." ? "ended" : "other" });
    });

    return () => {
      unmountingRef.current = true;
      callRef.current = null;
      call
        .leave()
        .catch(() => {})
        .finally(() => call.destroy().catch(() => {}));
    };
  }, [url, token]);

  const link = linkStatus({ interrupted, network });
  const linkText = linkMessage(link, audioOnly && !camOn);

  const local = participants.local;
  const remote = Object.values(participants).find((p) => !p.local);
  useEffect(() => {
    if (remote) setOtherHasJoined(true);
  }, [remote]);
  const remoteVideo = playable(remote?.tracks.video);
  const remoteAudio = playable(remote?.tracks.audio);
  const localVideo = camOn ? playable(local?.tracks.video) : null;

  const toggleMic = () => {
    const next = !micOn;
    callRef.current?.setLocalAudio(next);
    setMicOn(next);
  };
  const toggleCam = () => {
    const next = !camOn;
    callRef.current?.setLocalVideo(next);
    camOnRef.current = next;
    setCamOn(next);
    if (next) setAudioOnly(false);
  };
  const flip = () => {
    callRef.current?.cycleCamera().catch(() => {});
  };
  const leave = () => {
    setLeaving(true);
    const call = callRef.current;
    if (!call) return onLeftRef.current("left");
    call.leave().catch(() => onLeftRef.current("left"));
  };

  return (
    <View style={[styles.stage, style]}>
      {remote ? (
        <DailyMediaView
          videoTrack={remoteVideo}
          audioTrack={remoteAudio}
          objectFit="cover"
          zOrder={0}
          style={StyleSheet.absoluteFill as ViewStyle}
        />
      ) : null}

      {(!remote || !remoteVideo) && (
        <View style={styles.center} accessibilityLiveRegion="polite">
          {phase === "error" ? (
            <ThemedText variant="headline" style={styles.stageText} accessibilityRole="alert">
              {error}
            </ThemedText>
          ) : (
            <>
              <ActivityIndicator color={colors.onInk} />
              <ThemedText variant="headline" style={styles.stageText}>
                {phase === "joining"
                  ? "Connecting…"
                  : remote
                    ? `${otherLabel} has their camera off`
                    : otherHasJoined
                      ? `${otherLabel} has left the call. You can wait here or leave.`
                      : `Waiting for ${otherLabel} to join…`}
              </ThemedText>
            </>
          )}
        </View>
      )}

      {phase === "joined" && (
        <View style={styles.selfView}>
          {localVideo ? (
            <DailyMediaView videoTrack={localVideo} audioTrack={null} mirror objectFit="cover" zOrder={1} style={styles.selfVideo} />
          ) : (
            <View style={[styles.selfVideo, styles.selfOff]}>
              <AppIcon name="videoOff" size={20} color={colors.onInk} />
            </View>
          )}
        </View>
      )}

      {linkText ? (
        <View
          style={[styles.banner, styles.linkBanner, deviceProblem ? { top: spacing.md + 72 } : null]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <ThemedText variant="caption" style={styles.linkBannerText}>
            {linkText}
          </ThemedText>
        </View>
      ) : null}

      {deviceProblem && (
        <View style={styles.banner} accessibilityRole="alert">
          <ThemedText variant="caption" style={styles.bannerText}>
            {deviceProblem}
          </ThemedText>
        </View>
      )}

      <View style={styles.controls}>
        <ControlButton
          icon={micOn ? "mic" : "micOff"}
          label={micOn ? "Mute microphone" : "Unmute microphone"}
          active={!micOn}
          disabled={phase !== "joined"}
          onPress={toggleMic}
        />
        <ControlButton
          icon={camOn ? "video" : "videoOff"}
          label={camOn ? "Turn camera off" : "Turn camera on"}
          active={!camOn}
          disabled={phase !== "joined"}
          onPress={toggleCam}
        />
        <ControlButton icon="refresh" label="Switch camera" disabled={phase !== "joined" || !camOn} onPress={flip} />
        <ControlButton icon="phoneOff" label="Leave call" danger disabled={leaving} onPress={leave} />
      </View>
    </View>
  );
}

function ControlButton({
  icon,
  label,
  onPress,
  active,
  danger,
  disabled,
}: {
  icon: React.ComponentProps<typeof AppIcon>["name"];
  label: string;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected: !!active }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.control,
        active && styles.controlActive,
        danger && styles.controlDanger,
        disabled && styles.controlDisabled,
        pressed && { opacity: 0.8 },
      ]}
    >
      <AppIcon name={icon} size={22} color={active ? colors.ink : colors.onInk} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.md,
    left: spacing.md,
    padding: spacing.sm,
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
  },
  bannerText: {
    color: colors.danger,
  },
  linkBanner: {
    backgroundColor: colors.inkSubtle,
  },
  linkBannerText: {
    color: colors.ink,
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  control: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  controlActive: {
    backgroundColor: colors.onInk,
  },
  controlDanger: {
    backgroundColor: colors.danger,
  },
  controlDisabled: {
    opacity: 0.4,
  },
  controls: {
    bottom: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
  },
  selfOff: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
  },
  selfVideo: {
    borderRadius: radius.lg,
    height: 144,
    overflow: "hidden",
    width: 104,
  },
  selfView: {
    borderRadius: radius.lg,
    overflow: "hidden",
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
  },
  stage: {
    backgroundColor: "#0B0F0A",
    flex: 1,
    overflow: "hidden",
  },
  stageText: {
    color: colors.onInk,
    textAlign: "center",
  },
});
