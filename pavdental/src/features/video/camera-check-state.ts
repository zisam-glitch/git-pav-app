// What the pre-call camera and microphone check tells the patient (V18).
// Pure, so it can be tested without a phone.

export type CameraProblem = "blocked" | "in_use" | "missing" | "other";

/** Which kind of problem Daily reported when the camera or microphone would not start. */
export function cameraProblem(type?: string): CameraProblem {
  switch (type) {
    case "permissions":
      return "blocked";
    case "cam-in-use":
    case "mic-in-use":
    case "cam-mic-in-use":
      return "in_use";
    case "not-found":
    case "undefined-mediadevices":
      return "missing";
    default:
      return "other";
  }
}

export function cameraProblemMessage(problem: CameraProblem): string {
  switch (problem) {
    case "blocked":
      return "Pav Dental can't use your camera or microphone. Allow them in your phone's Settings, then check again.";
    case "in_use":
      return "Another app is using your camera or microphone. Close it, then check again.";
    case "missing":
      return "We couldn't find a camera or microphone on this phone.";
    default:
      return "Your camera or microphone didn't start. Check again, or restart the app.";
  }
}

/** True when the fix is in the phone's Settings, so a button should open them. */
export function needsSettings(problem: CameraProblem): boolean {
  return problem === "blocked";
}

/** How many of `bars` to light for a sound level between 0 and 1 (speech is quiet on this scale, so it is boosted). */
export function levelBars(level: number, bars = 5): number {
  if (!Number.isFinite(level) || level <= 0) return 0;
  const boosted = Math.min(1, Math.sqrt(level) * 1.4);
  return Math.max(1, Math.min(bars, Math.round(boosted * bars)));
}
