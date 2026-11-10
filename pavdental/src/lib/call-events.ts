// Call-quality events (joined, dropped, failed to join). They carry a name and
// a few coarse labels, never a person, an appointment or a room, so they can go
// to the error tracker without health data (V23). This file stays free of the
// Sentry SDK so plain-Node tests can load the modules that use it.

export type CallEventName = "call.joined" | "call.interrupted" | "call.recovered" | "call.join_failed" | "call.audio_only";
type Reporter = (name: CallEventName, labels: Record<string, string>) => void;

let reporter: Reporter | null = null;

export function setCallEventReporter(next: Reporter | null): void {
  reporter = next;
}

export function reportCallEvent(name: CallEventName, labels: Record<string, string> = {}): void {
  reporter?.(name, labels);
}
