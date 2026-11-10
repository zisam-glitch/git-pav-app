/**
 * Getting into the video room: ask the server for this appointment's private
 * room and a meeting token (the token is what lets the person in, CS-07), and
 * turn every way that can fail into a plain sentence. No imports, so it is
 * tested without a phone; the screen passes in the real request.
 */

export type Room = { url: string; token: string };

export type RoomResult = { ok: true; room: Room } | { ok: false; message: string };

/** What the request gives back: the status and the (possibly empty) body. */
export type RoomPost = (body: { appointmentId: string }) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

export async function requestVideoRoom(appointmentId: string | undefined, post: RoomPost): Promise<RoomResult> {
  if (!appointmentId) {
    return { ok: false, message: "We couldn't find this consultation. Please go back and open it from your appointments." };
  }
  try {
    const res = await post({ appointmentId });
    const data = ((await res.json().catch(() => ({}))) ?? {}) as { url?: unknown; token?: unknown; error?: unknown };
    if (!res.ok || typeof data.url !== "string" || typeof data.token !== "string" || !data.url || !data.token) {
      const fromServer = typeof data.error === "string" && data.error ? data.error : null;
      return { ok: false, message: fromServer ?? "We couldn't open the video room. Please try again." };
    }
    return { ok: true, room: { url: data.url, token: data.token } };
  } catch {
    return { ok: false, message: "You seem to be offline. Check your connection and try again." };
  }
}

/** The title and sentence under it on the call screen, for each state it can be in. */
export function callScreenCopy(state: { loading: boolean; error: string | null; opened: boolean }): {
  title: string;
  body: string | null;
} {
  if (state.loading) return { title: "Opening your room", body: null };
  if (state.error) return { title: "Can't join yet", body: state.error };
  if (state.opened) return { title: "You left the call", body: "Rejoin if you left by mistake, or tell us you've finished." };
  return {
    title: "Your clinician is ready",
    body: "Allow camera and microphone access when your phone asks. Leave the call with the red button when you're done.",
  };
}
