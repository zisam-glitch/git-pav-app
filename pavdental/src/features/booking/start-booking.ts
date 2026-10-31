import type { CareChannel, DentalService } from "./booking-types";

/**
 * How a service is booked. A service lists the channels it supports; the
 * patient's preferred channel wins when the service supports it, then a clinic
 * visit, then video, then the van.
 */
export function bookingChannelFor(
  service: Pick<DentalService, "supportedChannels">,
  preferred?: CareChannel | null
): CareChannel {
  const channels = service.supportedChannels ?? [];
  if (preferred && channels.includes(preferred)) return preferred;
  if (channels.includes("clinic")) return "clinic";
  if (channels.includes("video")) return "video";
  if (channels.includes("van")) return "van";
  return "clinic";
}

/**
 * The first screen after choosing a service. Clinic visits pick a clinic; video
 * consults have no clinic, so they go straight to choosing a clinician; van
 * visits start with the coverage check.
 */
export function firstBookingStep(channel: CareChannel): string {
  switch (channel) {
    case "video":
      return "/(patient)/booking/clinician-picker";
    case "van":
      return "/(patient)/van/service-area";
    default:
      return "/(patient)/booking/clinic-picker";
  }
}

/** Parses a `?channel=` route param. */
export function channelParam(value: unknown): CareChannel | null {
  return value === "clinic" || value === "video" || value === "van" ? value : null;
}
