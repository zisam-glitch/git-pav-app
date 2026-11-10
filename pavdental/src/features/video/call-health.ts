// How healthy the call looks, from what the call library reports (V16, V23).
// Pure, so it can be tested without a phone.

export type NetworkState = "good" | "warning" | "bad" | "unknown";
export type Link = "ok" | "weak" | "reconnecting";

/** What the patient is told about the connection. A dropped connection outranks a weak one. */
export function linkStatus(input: { interrupted: boolean; network: NetworkState }): Link {
  if (input.interrupted) return "reconnecting";
  return input.network === "warning" || input.network === "bad" ? "weak" : "ok";
}

/** The camera is turned off for the person once, when the connection is bad (audio-only), never over their own choice. */
export function shouldGoAudioOnly(input: { network: NetworkState; alreadyDone: boolean; cameraOn: boolean }): boolean {
  return input.network === "bad" && !input.alreadyDone && input.cameraOn;
}

export function linkMessage(link: Link, audioOnly: boolean): string | null {
  if (link === "reconnecting") return "Reconnecting… Keep this screen open.";
  if (audioOnly) return "Your connection is weak, so your camera is off. You can turn it back on when it improves.";
  if (link === "weak") return "Your connection is weak. If the picture freezes, turn your camera off.";
  return null;
}

/** A coarse bucket for how long joining took, so reports carry no exact timings per person. */
export function joinTimeBucket(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "unknown";
  if (ms < 2000) return "under_2s";
  if (ms < 5000) return "2_to_5s";
  if (ms < 10000) return "5_to_10s";
  return "over_10s";
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
