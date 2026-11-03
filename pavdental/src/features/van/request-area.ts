/**
 * Where a request is, for the operator. Before acceptance the server sends
 * only the city and postcode sector (no street), so the line reads
 * "Area: London, SW1A 1" instead of ", SW1A 1".
 */
export function requestAreaLabel(details?: {
  addressLine1?: string | null;
  city?: string | null;
  postcode?: string | null;
} | null): string {
  if (!details) return "Address shared once you accept";
  const parts = [details.addressLine1, details.city, details.postcode].filter((p) => p && String(p).trim());
  if (parts.length === 0) return "Address shared once you accept";
  return details.addressLine1 ? parts.join(", ") : `Area: ${parts.join(", ")}`;
}
