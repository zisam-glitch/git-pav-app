// The words staff see about one video visit: did the call happen, and which notices went to the patient.
// The backend decides all of it; this only gives it names. Timing and delivery only, never message text.

export type CallOutcome = "took_place" | "in_progress" | "no_show" | "cancelled" | "upcoming" | "not_recorded";

export interface VideoActivity {
  call: {
    outcome: CallOutcome;
    patientWaitingSince: string | null;
    admittedAt: string | null;
    completedAt: string | null;
    waitedMinutes: number | null;
  };
  notices: { kind: "push" | "email" | "reminder"; title: string; at: string; status: string }[];
  conversation: { messageCount: number; lastMessageAt: string | null } | null;
}

export const OUTCOME_LABELS: Record<CallOutcome, string> = {
  took_place: "The call took place",
  in_progress: "The call is under way",
  no_show: "Marked as a no-show",
  cancelled: "Cancelled",
  upcoming: "Not started yet",
  not_recorded: "Its time has passed and no call was recorded",
};

const NOTICE_KIND_LABELS = { push: "Push", email: "Email", reminder: "Reminder" } as const;

const NOTICE_STATUS_LABELS: Record<string, string> = {
  sent: "Sent",
  pending: "Due, not sent yet",
  sending: "Sending",
  failed: "Failed",
  cancelled: "Not sent, visit changed",
};

export function noticeKindLabel(kind: "push" | "email" | "reminder"): string {
  return NOTICE_KIND_LABELS[kind];
}

/** A delivery status in plain words; an unknown one is shown as it came. */
export function noticeStatusLabel(status: string): string {
  return NOTICE_STATUS_LABELS[status] ?? status;
}

/** "Waited 5 minutes", "Waited under a minute", or null when the wait is not known. */
export function waitedLabel(minutes: number | null): string | null {
  if (minutes === null) return null;
  if (minutes < 1) return "Waited under a minute";
  return `Waited ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

/** "1 message" / "3 messages", and "No messages yet" when the conversation has none. */
export function conversationLabel(conversation: VideoActivity["conversation"]): string {
  if (!conversation || conversation.messageCount === 0) return "No messages yet";
  return `${conversation.messageCount} message${conversation.messageCount === 1 ? "" : "s"}`;
}
