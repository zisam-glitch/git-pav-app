// What the staff home page puts first: counts of things that need a person,
// each linking to the screen with the detail. The backend sends counts only,
// no names or amounts, so there is nothing sensitive to show here.

export interface Attention {
  visitsToday: number;
  visitsLeftToday: number;
  unreadThreads: number;
  erasureOpen: number;
  erasureOverdue: number;
  cardFailuresLastWeek: number;
  depositReleaseFailures: number;
  vansOut: number;
  /** Vans on shift that have stopped reporting their position. Absent from an older backend. */
  quietVans?: number;
  asOf: string;
}

/** urgent: act now. action: needs doing today. info: good to know. clear: nothing to do. */
export type Tone = "urgent" | "action" | "info" | "clear";

export interface AttentionItem {
  key: string;
  label: string;
  count: number;
  note: string;
  href: string;
  tone: Tone;
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

function erasureItem(a: Attention): AttentionItem {
  let note = "None waiting";
  let tone: Tone = "clear";
  if (a.erasureOverdue > 0) {
    note = `${a.erasureOverdue} past the one-month deadline`;
    tone = "urgent";
  } else if (a.erasureOpen > 0) {
    note = "All within the one-month deadline";
    tone = "action";
  }
  return {
    key: "erasure",
    label: "Erasure requests",
    count: a.erasureOpen,
    note,
    href: "/dashboard/erasure-requests",
    tone,
  };
}

export function attentionItems(a: Attention): AttentionItem[] {
  const items: AttentionItem[] = [
    erasureItem(a),
    {
      key: "card",
      label: "Failed card payments",
      count: a.cardFailuresLastWeek,
      note: a.cardFailuresLastWeek > 0 ? "In the last 7 days. Check the audit log" : "None in the last 7 days",
      href: "/dashboard/audit-log",
      tone: a.cardFailuresLastWeek > 0 ? "urgent" : "clear",
    },
    {
      key: "deposit",
      label: "Van deposits not released",
      count: a.depositReleaseFailures,
      note: a.depositReleaseFailures > 0 ? "The deposit hold couldn't be released" : "None stuck",
      href: "/dashboard/van-shifts",
      tone: a.depositReleaseFailures > 0 ? "urgent" : "clear",
    },
    {
      key: "quiet-vans",
      label: "Vans not reporting in",
      count: a.quietVans ?? 0,
      note:
        (a.quietVans ?? 0) > 0
          ? "On shift but silent. Patients aren't offered them. Call the crew"
          : "Every van on shift is reporting",
      href: "/dashboard/van-shifts",
      tone: (a.quietVans ?? 0) > 0 ? "urgent" : "clear",
    },
    {
      key: "inbox",
      label: "Messages waiting for staff",
      count: a.unreadThreads,
      note:
        a.unreadThreads > 0
          ? plural(a.unreadThreads, "Conversation to read", "Conversations to read")
          : "Inbox is clear",
      href: "/dashboard/inbox",
      tone: a.unreadThreads > 0 ? "action" : "clear",
    },
    {
      key: "visits",
      label: "Visits today",
      count: a.visitsToday,
      note: a.visitsToday > 0 ? `${a.visitsLeftToday} still to come` : "No visits today",
      href: "/dashboard/app-appointments",
      tone: "info",
    },
    {
      key: "vans",
      label: "Vans out now",
      count: a.vansOut,
      note: a.vansOut > 0 ? "See when each last reported in" : "None on shift",
      href: "/dashboard/van-shifts",
      tone: "info",
    },
  ];
  // Worst first; within a tone the order above stands.
  const rank: Record<Tone, number> = { urgent: 0, action: 1, info: 2, clear: 3 };
  return items
    .map((item, index) => ({ item, index }))
    .sort((x, y) => rank[x.item.tone] - rank[y.item.tone] || x.index - y.index)
    .map(({ item }) => item);
}

/** True when anything is urgent, so the page can lead with a warning. */
export const hasUrgent = (items: AttentionItem[]) => items.some((item) => item.tone === "urgent");
