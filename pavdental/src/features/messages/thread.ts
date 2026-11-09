export interface ThreadMessage {
  id: string;
  mine: boolean;
  sender: string;
  body: string;
  sentAtIso: string;
}

/** The messages of one thread, oldest first, marked as the patient's own or the practice's. */
export function threadMessages(raw: unknown): ThreadMessage[] {
  const list = (raw as { messages?: unknown[] } | null | undefined)?.messages;
  if (!Array.isArray(list)) return [];
  return list
    .map((m: any) => ({
      id: String(m.id),
      mine: m.senderRole === "patient",
      sender: m.senderRole === "patient" ? "You" : m.senderName || "Pav Dental care team",
      body: String(m.body ?? ""),
      sentAtIso: String(m.sentAtIso ?? ""),
    }))
    .sort((a, b) => a.sentAtIso.localeCompare(b.sentAtIso));
}
