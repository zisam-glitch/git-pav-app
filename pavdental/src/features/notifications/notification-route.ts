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
  // A new request for the van crew: the incoming list, not a patient screen.
  if (d.type === "van_request_incoming") return { pathname: "/(operator)/incoming", params: {} };
  if (typeof d.requestId === "string" && d.requestId) {
    return { pathname: "/(patient)/van/live-track", params: { requestId: d.requestId } };
  }
  // The last video reminder opens the waiting room, not just the appointment (V7).
  if (d.screen === "waiting_room" && typeof d.appointmentId === "string" && d.appointmentId) {
    return { pathname: "/(patient)/video/device-check", params: { appointmentId: d.appointmentId } };
  }
  if (typeof d.appointmentId === "string" && d.appointmentId) {
    return { pathname: "/(patient)/appointments/[id]", params: { id: d.appointmentId } };
  }
  return null;
}
