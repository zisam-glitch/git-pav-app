// What staff see about one video visit: did the call happen, and which notices went to the patient (V41).
// This is about timing and delivery only. It never carries message text, triage answers or provider error text.

export type VideoCallOutcome =
  | "took_place" // the dentist ended it
  | "in_progress"
  | "no_show" // marked by staff
  | "cancelled"
  | "upcoming" // booked, start time still ahead
  | "not_recorded"; // booked, its time has passed and nobody recorded that it happened

export interface VideoActivityInput {
  status: string;
  startTimeUtc: Date;
  endTimeUtc: Date;
  patientWaitingSince: Date | null;
  /** The decrypted triage record, read only for the admitted and completed times. */
  triage: Record<string, unknown> | null;
  /** Push notices recorded against this appointment. */
  pushes: { type: string; title: string; sentAt: Date; status: string }[];
  /** Reminders scheduled for this appointment. */
  reminders: { title: string; scheduledFor: Date; sentAt: Date | null; status: string }[];
  /** The conversation tied to this appointment, if the patient or dentist has started one. */
  thread: { messageCount: number; lastMessageAt: Date | null } | null;
}

export interface VideoActivity {
  call: {
    outcome: VideoCallOutcome;
    patientWaitingSince: string | null;
    admittedAt: string | null;
    completedAt: string | null;
    /** Whole minutes from the patient reporting in to being let in, when both are known. */
    waitedMinutes: number | null;
  };
  /** Pushes and reminders together, earliest first. */
  notices: { kind: "push" | "reminder"; title: string; at: string; status: string }[];
  conversation: { messageCount: number; lastMessageAt: string | null } | null;
}

export function callOutcome(status: string, endTimeUtc: Date, now: Date): VideoCallOutcome {
  if (status === "completed") return "took_place";
  if (status === "in_progress") return "in_progress";
  if (status === "no_show") return "no_show";
  if (status === "cancelled") return "cancelled";
  return endTimeUtc.getTime() < now.getTime() ? "not_recorded" : "upcoming";
}

/** An ISO time from a stored value, or null if it is missing or unreadable. */
function isoOrNull(value: unknown): string | null {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function buildVideoActivity(input: VideoActivityInput, now: Date = new Date()): VideoActivity {
  const waiting = isoOrNull(input.patientWaitingSince);
  const admittedAt = isoOrNull(input.triage?.admittedAt);
  const completedAt = isoOrNull(input.triage?.completedAt);

  const waitedMs = waiting && admittedAt ? Date.parse(admittedAt) - Date.parse(waiting) : null;

  const notices = [
    ...input.pushes.map((p) => ({ kind: "push" as const, title: p.title, at: p.sentAt.toISOString(), status: p.status })),
    // A reminder that has not gone yet is shown at the time it is due.
    ...input.reminders.map((r) => ({
      kind: "reminder" as const,
      title: r.title,
      at: (r.sentAt ?? r.scheduledFor).toISOString(),
      status: r.status,
    })),
  ].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

  return {
    call: {
      outcome: callOutcome(input.status, input.endTimeUtc, now),
      patientWaitingSince: waiting,
      admittedAt,
      completedAt,
      waitedMinutes: waitedMs !== null && waitedMs >= 0 ? Math.round(waitedMs / 60000) : null,
    },
    notices,
    conversation: input.thread
      ? { messageCount: input.thread.messageCount, lastMessageAt: input.thread.lastMessageAt?.toISOString() ?? null }
      : null,
  };
}
