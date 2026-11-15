// backend/src/lib/appointment-list.ts
// What the patient's appointment LIST carries (I4). The list holds up to 200 visits and is
// fetched on every Home and Bookings load, so it must not decrypt, or send, the triage answers
// and access details of every one. The detail endpoint (GET /appointments/:id) returns them
// for the one visit being looked at. No imports, so it is easy to test.

/** Fields that stay out of the list. They are stored encrypted and belong to the detail endpoint. */
export const LIST_OMITTED_FIELDS = ["triageData", "accessDetails"] as const;

export function toPatientListItem<T extends Record<string, unknown>>(
  appointment: T
): Omit<T, (typeof LIST_OMITTED_FIELDS)[number]> {
  const rest: Record<string, unknown> = { ...appointment };
  for (const field of LIST_OMITTED_FIELDS) delete rest[field];
  return rest as Omit<T, (typeof LIST_OMITTED_FIELDS)[number]>;
}
