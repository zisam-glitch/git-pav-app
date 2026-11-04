import type { VanServiceRequest } from "./van-types";

export type LiveTrackDispatchView = {
  /** True once an operator has accepted; van and ETA are only shown then. */
  accepted: boolean;
  etaLabel: string | null;
  vanName: string | null;
  vanSubtitle: string;
};

/**
 * What the live tracking sheet may say about the van and arrival time.
 * Until an operator accepts, no van is assigned and no ETA is real, so both
 * are withheld whatever the API returned.
 */
export function getLiveTrackDispatchView(
  request: Pick<VanServiceRequest, "status" | "etaLabel" | "etaSecondsSnapshot" | "van" | "service">
): LiveTrackDispatchView {
  const accepted = request.status !== "pending";
  const serviceName = request.service?.name || "Dental Checkup";
  if (!accepted) {
    return {
      accepted,
      etaLabel: null,
      vanName: null,
      vanSubtitle: `${serviceName} · Waiting for an operator to accept`,
    };
  }
  const etaLabel =
    request.etaLabel ||
    (request.etaSecondsSnapshot ? `~${Math.round(request.etaSecondsSnapshot / 60)} min` : "Calculating...");
  return {
    accepted,
    etaLabel,
    vanName: request.van?.name || "Pav Dental Mobile Surgery Unit",
    vanSubtitle: request.van?.registrationPlate
      ? `${serviceName} · Reg: ${request.van.registrationPlate}`
      : serviceName,
  };
}
