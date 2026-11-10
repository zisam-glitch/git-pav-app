/**
 * Join URL for a Daily room: the meeting token in `t` is what lets this person
 * in (CS-07). Only the web build uses it: the phone apps run the call natively
 * (see native-call.tsx).
 */
export function dailyJoinUrl(roomUrl: string, token: string): string {
  return `${roomUrl}?t=${encodeURIComponent(token)}`;
}
