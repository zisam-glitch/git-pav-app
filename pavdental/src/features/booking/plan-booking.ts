type ServiceLike = { name?: string | null };

const normalise = (text: string | null | undefined) => (text ?? "").trim().toLowerCase();

/**
 * The service a treatment plan item books. Plan items don't name a service, so
 * only an exact name match counts: a near match could book the wrong treatment,
 * and with no match the patient chooses from the catalogue instead.
 */
export function serviceForPlanItem<T extends ServiceLike>(
  description: string | null | undefined,
  services: T[]
): T | null {
  const wanted = normalise(description);
  if (!wanted) return null;
  return services.find((s) => normalise(s.name) === wanted) ?? null;
}
