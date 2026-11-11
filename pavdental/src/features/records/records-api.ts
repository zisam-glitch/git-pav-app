import { authFetch } from "../auth/auth-api";

// ─── Odontogram ───────────────────────────────────────────────────────────────
export async function fetchOdontogram(userId: string) {
  const res = await authFetch(`/api/patients/${userId}/odontogram`);
  if (!res.ok) throw new Error("Could not load odontogram");
  return res.json();
}

export async function updateOdontogram(
  userId: string,
  teeth: {
    toothNumber: number;
    arch: string;
    quadrant: string;
    condition: string;
    notes?: string;
  }[]
) {
  const res = await authFetch(`/api/patients/${userId}/odontogram`, {
    method: "PUT",
    body: JSON.stringify({ teeth }),
  });
  if (!res.ok) throw new Error("Could not save odontogram");
  return res.json();
}

// ─── Treatment Plans ──────────────────────────────────────────────────────────
export async function fetchTreatmentPlans(userId: string) {
  const res = await authFetch(`/api/patients/${userId}/plans`);
  if (!res.ok) throw new Error("Could not load treatment plans");
  return res.json();
}

export async function createTreatmentPlan(
  userId: string,
  plan: {
    title: string;
    items: { code: string; description: string; toothNumber?: number; costPence: number }[];
  }
) {
  const res = await authFetch(`/api/patients/${userId}/plans`, {
    method: "POST",
    body: JSON.stringify(plan),
  });
  if (!res.ok) throw new Error("Could not create treatment plan");
  return res.json();
}

export async function signTreatmentPlan(
  userId: string,
  planId: string,
  payload: { signerName: string; consentConfirmed: true; signatureData?: string }
) {
  const res = await authFetch(`/api/patients/${userId}/plans/${planId}/sign`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not sign treatment plan");
  }
  return res.json();
}

export async function declineTreatmentPlan(userId: string, planId: string) {
  const res = await authFetch(`/api/patients/${userId}/plans/${planId}/decline`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not decline treatment plan");
  }
  return res.json();
}

// ─── Prescriptions ────────────────────────────────────────────────────────────
export async function fetchPatientPrescriptions(userId: string) {
  const res = await authFetch(`/api/prescriptions/patient/${userId}`);
  if (!res.ok) throw new Error("Could not load prescriptions");
  return res.json();
}

// ─── Patient Profile ──────────────────────────────────────────────────────────
export async function fetchPatientProfile(userId: string) {
  const res = await authFetch(`/api/patients/${userId}/profile`);
  if (res.status === 403) throw new Error("You don't have access to this patient's record.");
  if (!res.ok) throw new Error("Could not load profile");
  return res.json();
}

export async function updatePatientProfile(userId: string, data: Record<string, unknown>) {
  const res = await authFetch(`/api/patients/${userId}/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Could not save profile");
  return res.json();
}

// ─── Document Vault ───────────────────────────────────────────────────────────
export async function fetchDocuments(userId: string) {
  const res = await authFetch(`/api/patients/${userId}/documents`);
  if (!res.ok) throw new Error("Could not load documents");
  return res.json();
}

// ─── Clinical Care Messaging ──────────────────────────────────────────────────
/** "summary" returns each conversation with its last message only; "full" returns every message. */
export async function fetchMessageThreads(view: "full" | "summary" = "full") {
  const res = await authFetch(view === "summary" ? "/api/messages?view=summary" : "/api/messages");
  if (!res.ok) throw new Error("Could not load message threads");
  return res.json();
}

export interface MessageThreadPage {
  id: string;
  subject: string;
  isRead: boolean;
  messages: unknown[];
  hasMore: boolean;
  /** Pass as `before` to get the page of older messages. */
  nextBefore: string | null;
}

/** One conversation and a page of its messages (newest page first; `before` gets older ones). */
export async function fetchMessageThreadPage(threadId: string, before?: string): Promise<MessageThreadPage> {
  const qs = before ? `?before=${encodeURIComponent(before)}` : "";
  const res = await authFetch(`/api/messages/${threadId}${qs}`);
  if (res.status === 404) throw new Error("Message thread not found");
  if (!res.ok) throw new Error("Could not load message thread");
  return res.json();
}

export async function fetchMessagingMeta() {
  const res = await authFetch("/api/messages/meta");
  if (!res.ok) throw new Error("Could not load messaging metadata");
  return res.json();
}

// One Idempotency-Key per message being sent, kept until it succeeds, so a
// double tap or a retry after a slow response cannot send it twice (V47).
const pendingSendKeys = new Map<string, string>();
function sendKeyFor(scope: string, body: string): string {
  const id = `${scope}:${body}`;
  let key = pendingSendKeys.get(id);
  if (!key) {
    key = `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    pendingSendKeys.set(id, key);
  }
  return key;
}

export async function createMessageThread(payload: {
  subject: string;
  body: string;
  recipientType?: "practice" | "care_team" | "clinician";
  recipientClinicianId?: string;
  recipientName?: string;
  clinicianRole?: string;
  clinicianName?: string;
}) {
  const sendId = `new:${payload.subject}`;
  const res = await authFetch("/api/messages", {
    method: "POST",
    headers: { "Idempotency-Key": sendKeyFor(sendId, payload.body) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Could not create message thread");
  pendingSendKeys.delete(`${sendId}:${payload.body}`);
  return res.json();
}

export async function replyToMessageThread(threadId: string, body: string, attachmentKeys: string[] = []) {
  const res = await authFetch(`/api/messages/${threadId}/reply`, {
    method: "POST",
    headers: { "Idempotency-Key": sendKeyFor(threadId, `${body}|${attachmentKeys.join(",")}`) },
    body: JSON.stringify({ body, ...(attachmentKeys.length > 0 ? { attachmentKeys } : {}) }),
  });
  if (!res.ok) throw new Error("Could not send message reply");
  pendingSendKeys.delete(`${threadId}:${body}|${attachmentKeys.join(",")}`);
  return res.json();
}

export async function markMessageThreadRead(threadId: string) {
  const res = await authFetch(`/api/messages/${threadId}/read`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Could not mark thread read");
  return res.json();
}

// ─── Payment plans ───────────────────────────────────────────────────────────
// The app links to the practice's finance page; it makes no credit decisions.
export async function fetchFinancing(): Promise<{ financeInfoUrl: string }> {
  const res = await authFetch("/api/financing");
  if (!res.ok) throw new Error("Could not load payment plan details");
  return res.json();
}

// ─── Rewards & Oral Health Insights ───────────────────────────────────────────
export async function fetchRewards() {
  const res = await authFetch("/api/rewards");
  if (!res.ok) throw new Error("Could not load rewards");
  return res.json();
}

export async function redeemReward(payload: { rewardId: string }) {
  const res = await authFetch("/api/rewards/redeem", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not redeem perk");
  }
  return res.json();
}

export async function fetchOralHealthInsights() {
  const res = await authFetch("/api/rewards/insights");
  if (!res.ok) throw new Error("Could not load oral health insights");
  return res.json();
}

export async function logBrushingSession(payload: {
  day?: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  session: "am" | "pm";
  durationSec: number;
}) {
  const res = await authFetch("/api/rewards/brushing-log", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Could not log brushing session");
  return res.json();
}

// ─── Check-in & GDPR SAR ──────────────────────────────────────────────────────
export type CheckInTask = "form" | "consent" | "insurance" | "balance";

export async function completeAppointmentCheckIn(
  appointmentId: string,
  payload: { completedTasks: CheckInTask[] }
) {
  const res = await authFetch(`/api/booking/appointments/${appointmentId}/check-in`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Could not complete pre-visit check-in");
  return res.json();
}

export async function requestDataAccessExport(payload?: {
  reason?: string;
  format?: "json" | "csv";
}) {
  const res = await authFetch("/api/consents/data-access-request", {
    method: "POST",
    body: JSON.stringify(payload || { format: "json" }),
  });
  if (!res.ok) throw new Error("Could not generate GDPR data export");
  return res.json();
}

// ─── Clinician Portal: Appointment Notes & Actions (CS-28) ────────────────────
export async function fetchAppointmentNotes(appointmentId: string) {
  const res = await authFetch(`/api/booking/appointments/${appointmentId}/notes`);
  if (!res.ok) throw new Error("Could not load clinical notes");
  return res.json();
}

export async function saveAppointmentNotes(
  appointmentId: string,
  payload: { notes: string; diagnosis?: string; treatmentPlan?: string }
) {
  const res = await authFetch(`/api/booking/appointments/${appointmentId}/notes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not save clinical notes");
  }
  return res.json();
}

export async function completeAppointment(appointmentId: string) {
  const res = await authFetch(`/api/booking/appointments/${appointmentId}/complete`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not mark appointment completed");
  }
  return res.json();
}

export async function markAppointmentNoShow(appointmentId: string) {
  const res = await authFetch(`/api/booking/appointments/${appointmentId}/no-show`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Could not mark appointment as no-show");
  }
  return res.json();
}

export async function fetchOdontogramHistory(userId: string) {
  const res = await authFetch(`/api/patients/${userId}/odontogram/history`);
  if (!res.ok) throw new Error("Could not load tooth history");
  return res.json();
}


/** Uploads one photo to a conversation and returns the key to send with the reply (V53). */
export async function uploadMessagePhoto(threadId: string, photo: { uri: string; mimeType: string }): Promise<string> {
  const form = new FormData();
  const ext = photo.mimeType === "image/png" ? "png" : photo.mimeType === "image/webp" ? "webp" : "jpg";
  form.append("photo", { uri: photo.uri, name: `message.${ext}`, type: photo.mimeType } as unknown as Blob);
  const res = await authFetch(`/api/messages/${threadId}/photos`, { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || typeof data?.key !== "string") throw new Error(data?.error || "The photo did not upload");
  return data.key;
}
