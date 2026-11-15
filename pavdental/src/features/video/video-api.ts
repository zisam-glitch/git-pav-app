import { authFetch } from "../auth/auth-api";

export async function fetchVideoSummary(appointmentId: string) {
  const res = await authFetch(`/api/video/summary/${appointmentId}`);
  if (!res.ok) throw new Error("Failed to load consultation summary");
  return res.json();
}

export async function fetchVideoTriageDraft(appointmentId: string) {
  const res = await authFetch(`/api/video/triage-draft/${appointmentId}`);
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export async function saveVideoTriageDraft(
  appointmentId: string,
  body: Record<string, unknown>,
): Promise<void> {
  await authFetch(`/api/video/triage-draft/${appointmentId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function fetchAppointmentMessageThread(
  appointmentId: string,
): Promise<{ threadId?: string } | null> {
  const res = await authFetch(`/api/appointment-messages/${appointmentId}`);
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export async function sendAppointmentMessage(
  appointmentId: string,
  body: string,
): Promise<{ threadId?: string }> {
  const res = await authFetch(`/api/appointment-messages/${appointmentId}`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || "Your message did not send. Please try again.");
  }
  return data;
}

export type WaitingRoomPollResult =
  | { kind: "not_open_yet"; opensAt: string | null }
  | { kind: "closed" }
  | { kind: "error"; fatal: boolean }
  | { kind: "ok"; data: { startTimeUtc?: string; status?: string; admitted?: boolean } };

export async function pollVideoWaitingRoom(appointmentId: string): Promise<WaitingRoomPollResult> {
  const res = await authFetch(`/api/video/waiting/${appointmentId}`, { method: "POST" });
  if (res.status === 409) {
    const early = await res.json().catch(() => ({}));
    if ((early as { code?: string })?.code === "not_open_yet") {
      return { kind: "not_open_yet", opensAt: (early as { opensAt?: string }).opensAt ?? null };
    }
    return { kind: "closed" };
  }
  if (!res.ok) {
    return { kind: "error", fatal: res.status === 404 || res.status === 403 };
  }
  const data = await res.json();
  return { kind: "ok", data };
}

export async function leaveVideoWaitingRoom(appointmentId: string): Promise<void> {
  await authFetch(`/api/video/waiting/${appointmentId}/leave`, { method: "POST" });
}

export async function uploadTriagePhoto(params: {
  appointmentId: string;
  slotLabel: string;
  uri: string;
  fileName: string;
  mimeType: string;
}): Promise<string> {
  const formData = new FormData();
  formData.append("photo", {
    uri: params.uri,
    name: params.fileName,
    type: params.mimeType,
  } as any);
  formData.append("appointmentId", params.appointmentId);
  formData.append("slotLabel", params.slotLabel);

  const uploadRes = await authFetch("/api/video/upload-triage-photo", {
    method: "POST",
    body: formData,
  });
  const uploadJson = await uploadRes.json().catch(() => ({}));
  if (!uploadRes.ok || !uploadJson.url) {
    throw new Error((uploadJson as { error?: string }).error || "Upload failed");
  }
  return uploadJson.url as string;
}

export async function submitVideoTriage(payload: Record<string, unknown>): Promise<void> {
  const res = await authFetch("/api/video/submit-triage", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error((errJson as { error?: string }).error || "Could not submit video triage data");
  }
}

export async function fetchTriagePhotos(appointmentId: string): Promise<{ url: string }[]> {
  const res = await authFetch(`/api/video/triage-photos/${appointmentId}`);
  if (!res.ok) throw new Error("photos");
  const body = await res.json().catch(() => ({ photos: [] }));
  return (body.photos ?? []) as { url: string }[];
}

export async function fetchVideoPresence(
  appointmentId: string,
): Promise<{ admitted?: boolean; patientWaiting?: boolean } | null> {
  const res = await authFetch(`/api/video/status/${appointmentId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function requestClinicianVideoRoom(
  appointmentId: string,
): Promise<{ url: string; token: string }> {
  const res = await authFetch("/api/video/rooms", {
    method: "POST",
    body: JSON.stringify({ appointmentId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.url || !data?.token) {
    throw new Error(
      (data as { error?: string })?.error || "Could not open the video room. Try again from your schedule.",
    );
  }
  return { url: data.url, token: data.token };
}

export async function admitVideoPatient(appointmentId: string): Promise<void> {
  const res = await authFetch("/api/video/admit-patient", {
    method: "POST",
    body: JSON.stringify({ appointmentId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string })?.error || "Could not let the patient in. Please try again.");
  }
}

export async function endVideoConsult(payload: Record<string, unknown>): Promise<void> {
  const res = await authFetch("/api/video/end-consult", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Could not complete consultation");
  }
}
