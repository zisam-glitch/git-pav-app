/**
 * Watches one appointment until the server says it is confirmed (B4, B5).
 *
 * It asks about that appointment only, never "the latest one in the list",
 * and stops asking as soon as it is confirmed or the time runs out.
 */

export type ConfirmationOutcome = "confirmed" | "timeout" | "missing";

export interface WatchOptions {
  intervalMs?: number;
  timeoutMs?: number;
}

export function watchConfirmation(
  appointmentId: string | undefined,
  fetchStatus: (id: string) => Promise<{ status: string } | null>,
  onDone: (outcome: ConfirmationOutcome) => void,
  { intervalMs = 2000, timeoutMs = 45000 }: WatchOptions = {}
): () => void {
  if (!appointmentId) {
    onDone("missing");
    return () => {};
  }

  let finished = false;
  let inFlight = false;
  let interval: ReturnType<typeof setInterval> | null = null;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const stop = () => {
    if (interval) clearInterval(interval);
    if (timeout) clearTimeout(timeout);
    interval = null;
    timeout = null;
  };
  const finish = (outcome: ConfirmationOutcome) => {
    if (finished) return;
    finished = true;
    stop();
    onDone(outcome);
  };

  const check = async () => {
    if (finished || inFlight) return;
    inFlight = true;
    try {
      const appointment = await fetchStatus(appointmentId);
      if (appointment?.status === "confirmed") finish("confirmed");
    } catch {
      // A failed check is retried on the next tick.
    } finally {
      inFlight = false;
    }
  };

  void check();
  interval = setInterval(check, intervalMs);
  timeout = setTimeout(() => finish("timeout"), timeoutMs);

  return () => {
    finished = true;
    stop();
  };
}
