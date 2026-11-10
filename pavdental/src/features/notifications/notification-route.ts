export interface NotificationTarget {
  pathname: string;
  params: Record<string, string>;
}

/**
 * Where tapping a notification should go, from the data the backend attached
 * to it. A van update carries a requestId; an appointment reminder or refund
 * carries an appointmentId. Anything else just opens the app.
 */
export function routeForNotification(data: unknown): NotificationTarget | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  // A new message: the dentist's inbox, or the patient's conversation.
  if (d.type === "message") {
    if (d.audience === "clinician") return { pathname: "/(clinician)/inbox", params: {} };
    if (typeof d.threadId === "string" && d.threadId) {
      return { pathname: "/(patient)/message-thread", params: { id: d.threadId } };
    }
    return null;
  }
  if (typeof d.requestId === "string" && d.requestId) {
    return { pathname: "/(patient)/van/live-track", params: { requestId: d.requestId } };
  }
  if (typeof d.appointmentId === "string" && d.appointmentId) {
    return { pathname: "/(patient)/appointments/[id]", params: { id: d.appointmentId } };
  }
  return null;
}
