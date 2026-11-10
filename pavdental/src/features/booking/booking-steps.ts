import type { CareChannel } from "./booking-types";

export type BookingStepName = "treatment" | "clinic" | "dentist" | "time" | "pay";

const CLINIC_STEPS: BookingStepName[] = ["treatment", "clinic", "dentist", "time", "pay"];
// A video consult has no clinic to choose, so it has one step fewer.
const VIDEO_STEPS: BookingStepName[] = ["treatment", "dentist", "time", "pay"];

/** The "step X of Y" for a booking screen; a video consult counts 1 to 4, not 1, 3, 4, 5. */
export function bookingStep(
  channel: CareChannel | string | null | undefined,
  name: BookingStepName
): { current: number; total: number } {
  const steps = channel === "video" ? VIDEO_STEPS : CLINIC_STEPS;
  const index = steps.indexOf(name);
  return { current: (index === -1 ? 0 : index) + 1, total: steps.length };
}
