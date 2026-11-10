interface RawMessage {
  id?: unknown;
  senderRole?: string;
  senderName?: string;
  body?: unknown;
  sentAtIso?: unknown;
  attachments?: unknown;
}

export interface ThreadMessage {
  id: string;
  mine: boolean;
  sender: string;
  body: string;
  sentAtIso: string;
  /** Links to photos sent with the message. */
  photos: string[];
}

/** The messages of one thread, oldest first, marked as the patient's own or the practice's. */
export function threadMessages(raw: unknown): ThreadMessage[] {
  const list = (raw as { messages?: RawMessage[] } | null | undefined)?.messages;
  if (!Array.isArray(list)) return [];
  return list
    .map((m) => ({
      id: String(m.id),
      mine: m.senderRole === "patient",
      sender: m.senderRole === "patient" ? "You" : m.senderName || "Pav Dental care team",
      body: String(m.body ?? ""),
      sentAtIso: String(m.sentAtIso ?? ""),
      photos: Array.isArray(m.attachments)
        ? m.attachments.map((a) => (a as { url?: unknown })?.url).filter((u): u is string => typeof u === "string")
        : [],
    }))
    .sort((a, b) => a.sentAtIso.localeCompare(b.sentAtIso));
}

/** How many conversations have something the patient has not read. */
export function unreadThreadCount(raw: unknown): number {
  if (!Array.isArray(raw)) return 0;
  return raw.filter((t) => t && typeof t === "object" && (t as { isRead?: unknown }).isRead === false).length;
}
