/**
 * Practice contact and operating configuration.
 * Central single source of truth for practice phone, email, and fallback operating hours (TC-12, MF-10).
 * Dynamic clinic hours are read from the clinics API via usePracticeHours / resolvePracticeHours.
 */
export const PRACTICE_CONFIG = {
  name: "Pav Dental",
  phone: process.env.EXPO_PUBLIC_PRACTICE_PHONE ?? "0800 1938 786",
  telUrl: `tel:${(process.env.EXPO_PUBLIC_PRACTICE_PHONE ?? "0800 1938 786").replace(/[^\d+]/g, "")}`,
  email: "hello@pavdental.com",
  emergencyTel: "tel:999",
  urgentTel: "tel:111",
  /** Baseline fallback hours when offline or before clinic data resolves */
  hoursText: "Mon–Fri 09:00–17:30 · Sat 09:00–13:00",
  /**
   * Where the practice is: 786 Leeds Road, Bradford, BD3 9TY. Only for a
   * development build with no GPS and for the draft's starting values. It is
   * never sent to the server as someone's real position.
   */
  location: { lat: 53.7998, lng: -1.7289 },
  /** Examples shown in address fields, local to where the service is. */
  examplePostcode: "BD3 9TY",
  exampleCity: "Bradford",
  exampleStreet: "12 High Street",
} as const;
